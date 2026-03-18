import { prisma } from "../../shared/prisma";
import {
  CreateGoalPayload,
  RemoveMemberFromGoalPayload,
  ShareGoalPayload,
  UpdateGoalPayload,
} from "./Goal.interfaces";

import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import { goalQueryValidationConfig, goalSearchableFields } from "./Goal.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import emailSender from "../../utils/email-sender";
import { shareGoalTemplate } from "../../template/share-goal-template";

// -------------------------------------- CREATE GOAL ------------------------------------
const createGoal = async (user: TAuthUser, payload: CreateGoalPayload) => {
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      is_active: true,
      OR: [
        {
          end_date: null,
        },
        {
          end_date: {
            gt: new Date(),
          },
        },
      ],
    },
  });

  if (!activeSubscription) {
    const goalCount = await prisma.goal.count({
      where: {
        user_id: user.id,
      },
    });

    if (goalCount >= 5) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        "Free users can create a maximum of 5 goals. Upgrade to premium for unlimited goals.",
      );
    }
  }

  const result = await prisma.goal.create({
    data: {
      ...payload,
      user_id: user.id,
    },
  });
  return result;
};

// -------------------------------------- GET ALL GOALS ----------------------------------
const getAllGoals = async (user: TAuthUser, query: Record<string, any>) => {
  const { search_term, page, limit, sort_by, sort_order } = query;

  if (sort_by) queryValidator(goalQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(goalQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.GoalWhereInput[] = [
    {
      OR: [
        {
          user_id: user.id,
        },
        {
          goal_members: {
            some: {
              user_id: user.id,
            },
          },
        },
      ],
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: goalSearchableFields.map((field) => {
        return {
          [field]: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        };
      }),
    });
  }

  const whereConditions = {
    AND: andConditions,
  };

  // Fetch paginated goals, count, and ALL goals (for summary) in parallel
  const [result, total, allGoals] = await Promise.all([
    prisma.goal.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        transactions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        goal_members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    }),
    prisma.goal.count({ where: whereConditions }),
    prisma.goal.findMany({
      where: whereConditions,
      select: {
        target_amount: true,
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
    }),
  ]);

  // Compute summary from all goals
  let totalGoalAmount = 0;
  let totalSaved = 0;
  let totalFulfilled = 0;

  allGoals.forEach((goal) => {
    const targetAmount = Number(goal.target_amount);
    totalGoalAmount += targetAmount;

    const goalIn = goal.transactions.reduce((acc, t) => {
      return t.type === "IN" ? acc + Number(t.amount) : acc;
    }, 0);
    const goalOut = goal.transactions.reduce((acc, t) => {
      return t.type === "OUT" ? acc + Number(t.amount) : acc;
    }, 0);
    const balance = goalIn - goalOut;
    totalSaved += balance;

    if (balance >= targetAmount) {
      totalFulfilled += 1;
    }
  });

  const totalRemaining = totalGoalAmount - totalSaved;

  const formattedResult = result.map((goal) => {
    const totalIn = goal.transactions.reduce((acc, transaction) => {
      if (transaction.type === "IN") {
        return acc + Number(transaction.amount);
      } else {
        return acc;
      }
    }, 0);

    const totalOut = goal.transactions.reduce((acc, transaction) => {
      if (transaction.type === "OUT") {
        return acc + Number(transaction.amount);
      } else {
        return acc;
      }
    }, 0);

    const balance = totalIn - totalOut;

    const members = goal.goal_members.map((member) => ({
      ...member.user,
      role: member.role,
    }));

    const role =
      goal.user_id === user.id
        ? "OWNER"
        : members.find((member) => member.id === user.id)?.role;

    return {
      id: goal.id,
      name: goal.name,
      role,
      target_amount: goal.target_amount,
      in: totalIn,
      out: totalOut,
      balance,
      total_transactions: goal.transactions.length,
      others_member: [...members, { ...goal.user, role: "OWNER" }].filter(
        (member) => member.id !== user.id,
      ),
      created_at: goal.created_at,
      updated_at: goal.updated_at,
    };
  });

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    summary: {
      total_goal_amount: totalGoalAmount,
      total_saved: totalSaved,
      total_remaining: totalRemaining > 0 ? totalRemaining : 0,
      total_fulfilled: totalFulfilled,
      total_unfulfilled: total - totalFulfilled,
    },
    data: formattedResult,
  };
};

// -------------------------------------- GET GOAL BY ID ---------------------------------
const getGoalById = async (user: TAuthUser, id: string) => {
  const result = await prisma.goal.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
    include: {
      transactions: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      goal_members: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  const totalIn = result.transactions.reduce((acc, transaction) => {
    if (transaction.type === "IN") {
      return acc + Number(transaction.amount);
    } else {
      return acc;
    }
  }, 0);

  const totalOut = result.transactions.reduce((acc, transaction) => {
    if (transaction.type === "OUT") {
      return acc + Number(transaction.amount);
    } else {
      return acc;
    }
  }, 0);

  const balance = totalIn - totalOut;

  const members = result.goal_members.map((member) => ({
    ...member.user,
    role: member.role,
  }));

  const role =
    result.user_id === user.id
      ? "OWNER"
      : members.find((member) => member.id === user.id)?.role;

  return {
    id: result.id,
    name: result.name,
    role,
    target_amount: result.target_amount,
    in: totalIn,
    out: totalOut,
    balance,
    created_by: result.user_id,
    others_member: [...members, { ...result.user, role: "OWNER" }].filter(
      (member) => member.id !== user.id,
    ),
    transactions: result.transactions,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

// -------------------------------------- UPDATE GOAL ------------------------------------
const updateGoal = async (
  user: TAuthUser,
  id: string,
  payload: UpdateGoalPayload,
) => {
  await prisma.goal.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.goal.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

// -------------------------------------- DELETE GOALS -----------------------------------
const deleteGoals = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.goal.deleteMany({
    where: {
      id: {
        in: ids,
      },
      user_id: user.id,
    },
  });

  return result;
};

// -------------------------------------- SHARE GOAL -------------------------------------
const shareGoal = async (user: TAuthUser, payload: ShareGoalPayload) => {
  const { goal_id, email, role = "VIEWER" } = payload;

  // Step 1: Verify ownership
  const goal = await prisma.goal.findFirst({
    where: {
      id: goal_id,
    },
  });

  if (!goal) {
    throw new CustomizedError(httpStatus.BAD_REQUEST, "Goal not found");
  }

  if (goal.user_id !== user.id) {
    const isAdmin = await prisma.goalMember.findFirst({
      where: {
        goal_id,
        user_id: user.id,
        role: "ADMIN",
      },
    });

    if (!isAdmin) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        "You are not authorized to share this goal",
      );
    }
  }

  // Step 2: Check shared user exist
  const sharedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!sharedUser) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "The user you are trying to share with can't be found",
    );
  }

  // Step 3: Check for active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      is_active: true,
      OR: [
        {
          end_date: null,
        },
        {
          end_date: {
            gt: new Date(),
          },
        },
      ],
    },
  });

  if (!activeSubscription) {
    // Check if this is a NEW member
    const existingMember = await prisma.goalMember.findUnique({
      where: {
        goal_id_user_id: {
          goal_id,
          user_id: sharedUser.id,
        },
      },
    });

    if (!existingMember) {
      const memberCount = await prisma.goalMember.count({
        where: {
          goal_id,
        },
      });

      if (memberCount >= 1) {
        throw new CustomizedError(
          httpStatus.BAD_REQUEST,
          "Free users can share a goal with only one user. Upgrade to premium for unlimited sharing.",
        );
      }
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const goalMember = await tx.goalMember.upsert({
      where: {
        goal_id_user_id: {
          goal_id,
          user_id: sharedUser.id,
        },
      },
      update: {
        role,
      },
      create: {
        goal_id,
        user_id: sharedUser.id,
        role,
      },
    });

    await prisma.notification.create({
      data: {
        user_id: sharedUser.id,
        title: "Goal Shared",
        message: `${user.name || user.email} shared a goal with you`,
      },
    });

    return goalMember;
  });

  // Step 4: Send email notification
  try {
    const emailBody = shareGoalTemplate({
      receiverName: sharedUser.name || sharedUser.email || "User",
      senderName: user.name || user.email || "A user",
      goalName: goal.name,
      role: role,
    });

    await emailSender(sharedUser.email, emailBody, "An goal Shared With You");
  } catch (error) {
    console.error("Failed to send share goal email:", error);
    // We don't throw here to avoid failing the share operation if only email fails
  }

  return result;
};

// -------------------------------------- REMOVE MEMBER -----------------------------------
const removeMember = async (
  user: TAuthUser,
  payload: RemoveMemberFromGoalPayload,
) => {
  const { goal_id, user_id } = payload;

  // Step 1: Verify goal existence and role of requester
  const goal = await prisma.goal.findFirst({
    where: {
      id: goal_id,
    },
    include: {
      goal_members: {
        where: {
          user_id: user.id,
        },
      },
    },
  });

  if (!goal) {
    throw new CustomizedError(httpStatus.BAD_REQUEST, "Goal not found");
  }

  const isOwner = goal.user_id === user.id;
  const isAdmin = goal.goal_members.find((m) => m.role === "ADMIN");

  if (!isOwner && !isAdmin) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "You are not authorized to remove members from this goal",
    );
  }

  // Step 2: Prevent removing the owner
  if (user_id === goal.user_id) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "The owner of the goal cannot be removed",
    );
  }

  // Step 3: Remove the member
  const result = await prisma.$transaction(async (tx) => {
    const deletedMember = await tx.goalMember.delete({
      where: {
        goal_id_user_id: {
          goal_id,
          user_id,
        },
      },
    });

    await tx.notification.create({
      data: {
        user_id,
        title: "Access Removed",
        message: `Your access to the goal "${goal.name}" has been removed by ${user.name || user.email}`,
      },
    });

    return deletedMember;
  });

  return result;
};

export const GoalServices = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoals,
  shareGoal,
  removeMember,
};
