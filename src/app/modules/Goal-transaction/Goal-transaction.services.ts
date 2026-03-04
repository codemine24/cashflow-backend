import { prisma } from "../../shared/prisma";
import {
  CreateGoalTransactionPayload,
  UpdateGoalTransactionPayload,
} from "./Goal-transaction.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import {
  goalTransactionQueryValidationConfig,
  goalTransactionSearchableFields,
} from "./Goal-transaction.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

// -------------------------------------- CREATE GOAL TRANSACTION --------------------------------
const createGoalTransaction = async (
  user: TAuthUser,
  payload: CreateGoalTransactionPayload,
) => {
  const goal = await prisma.goal.findFirst({
    where: {
      id: payload.goal_id,
      OR: [
        { user_id: user.id },
        {
          goal_members: {
            some: { user_id: user.id, role: { in: ["EDITOR", "ADMIN"] } },
          },
        },
      ],
    },
  });

  if (!goal) {
    throw new Error(
      "Goal not found or you are not the authorized to create transaction",
    );
  }

  const { date, time, ...transactionData } = payload;

  let created_at: Date | undefined;
  if (date || time) {
    const datePart = date ?? new Date().toISOString().slice(0, 10);
    const timePart = time ?? "00:00:00";
    created_at = new Date(`${datePart}T${timePart}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.goalTransaction.create({
      data: {
        ...transactionData,
        entry_by_id: user.id,
        ...(created_at ? { created_at } : {}),
      },
    });

    await tx.goal.update({
      where: { id: goal.id },
      data: {
        updated_at: new Date(),
      },
    });

    return transaction;
  });
  return result;
};

// -------------------------------------- GET GOAL TRANSACTIONS BY GOAL --------------------------
const getGoalTransactionsByGoal = async (
  user: TAuthUser,
  goalId: string,
  query: Record<string, any>,
) => {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      OR: [
        { user_id: user.id },
        {
          goal_members: {
            some: { user_id: user.id },
          },
        },
      ],
    },
  });

  if (!goal) {
    throw new Error(
      "Goal not found or you are not the authorized to view transactions",
    );
  }

  const { search_term, page, limit, sort_by, sort_order, type } = query;

  if (sort_by)
    queryValidator(goalTransactionQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(
      goalTransactionQueryValidationConfig,
      "sort_order",
      sort_order,
    );

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.GoalTransactionWhereInput[] = [
    { goal_id: goalId },
  ];

  if (type) andConditions.push({ type });

  if (search_term) {
    andConditions.push({
      OR: goalTransactionSearchableFields.map((field) => {
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
    prisma.goalTransaction.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        goal: {
          select: {
            name: true,
          },
        },
        entry_by: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        updated_by: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.goalTransaction.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: result,
  };
};

// -------------------------------------- GET GOAL TRANSACTION BY ID -----------------------------
const getGoalTransactionById = async (user: TAuthUser, id: string) => {
  const result = await prisma.goalTransaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
    include: {
      goal: true,
      entry_by: {
        select: {
          name: true,
          email: true,
        },
      },
      updated_by: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return result;
};

// -------------------------------------- UPDATE GOAL TRANSACTION --------------------------------
const updateGoalTransaction = async (
  user: TAuthUser,
  id: string,
  payload: UpdateGoalTransactionPayload,
) => {
  const transaction = await prisma.goalTransaction.findFirstOrThrow({
    where: {
      id,
    },
  });

  const goal = await prisma.goal.findFirst({
    where: {
      id: transaction.goal_id,
      OR: [
        { user_id: user.id },
        {
          goal_members: {
            some: { user_id: user.id, role: { in: ["EDITOR", "ADMIN"] } },
          },
        },
      ],
    },
  });

  if (!goal) {
    throw new Error(
      "Goal not found or you are not the authorized to update transaction",
    );
  }

  const { date, time, ...transactionData } = payload;

  let created_at: Date | undefined;
  if (date || time) {
    const datePart = date ?? new Date().toISOString().slice(0, 10);
    const timePart = time ?? "00:00:00";
    created_at = new Date(`${datePart}T${timePart}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.goalTransaction.update({
      where: {
        id,
      },
      data: {
        ...transactionData,
        update_by_id: user.id,
        ...(created_at ? { created_at } : {}),
      },
    });

    await tx.goal.update({
      where: { id: goal.id },
      data: {
        updated_at: new Date(),
      },
    });

    return transaction;
  });
  return result;
};

// -------------------------------------- DELETE GOAL TRANSACTIONS -------------------------------
const deleteGoalTransactions = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.goalTransaction.deleteMany({
    where: {
      id: {
        in: ids,
      },
      entry_by_id: user.id,
    },
  });

  return result;
};

export const GoalTransactionServices = {
  createGoalTransaction,
  getGoalTransactionsByGoal,
  getGoalTransactionById,
  updateGoalTransaction,
  deleteGoalTransactions,
};
