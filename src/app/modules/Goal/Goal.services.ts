import { prisma } from "../../shared/prisma";
import { CreateGoalPayload, UpdateGoalPayload } from "./Goal.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import { goalQueryValidationConfig, goalSearchableFields } from "./Goal.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

// -------------------------------------- CREATE GOAL ------------------------------------
const createGoal = async (user: TAuthUser, payload: CreateGoalPayload) => {
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

  const [result, total] = await Promise.all([
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
  ]);

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
const shareGoal = async (user: TAuthUser, payload: any) => {
  const { goal_id, user_id, role = "VIEWER" } = payload;

  // Step 1: Verify ownership
  const owner = await prisma.goal.findFirst({
    where: {
      id: goal_id,
      user_id: user.id,
    },
  });

  if (!owner) {
    throw new Error("Goal not found or you are not the owner");
  }

  // Step 2: Check shared user exist
  const sharedUser = await prisma.user.findUnique({
    where: {
      id: user_id,
    },
  });

  if (!sharedUser) {
    throw new Error("The user you are trying to share with can't be found");
  }

  const result = await prisma.goalMember.upsert({
    where: {
      goal_id_user_id: {
        goal_id,
        user_id,
      },
    },
    update: {
      role,
    },
    create: {
      goal_id,
      user_id,
      role,
    },
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
};
