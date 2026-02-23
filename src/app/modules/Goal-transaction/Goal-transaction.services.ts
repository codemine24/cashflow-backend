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
  // Ensure the goal belongs to the user
  await prisma.goal.findFirstOrThrow({
    where: {
      id: payload.goal_id,
      user_id: user.id,
    },
  });

  const result = await prisma.goalTransaction.create({
    data: {
      ...payload,
      entry_by_id: user.id,
    },
  });
  return result;
};

// -------------------------------------- GET GOAL TRANSACTIONS BY GOAL --------------------------
const getGoalTransactionsByGoal = async (
  user: TAuthUser,
  goalId: string,
  query: Record<string, any>,
) => {
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
    { entry_by_id: user.id, goal_id: goalId },
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
  await prisma.goalTransaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
  });

  const result = await prisma.goalTransaction.update({
    where: {
      id,
    },
    data: payload,
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
