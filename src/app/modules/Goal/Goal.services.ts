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

  const andConditions: Prisma.GoalWhereInput[] = [{ user_id: user.id }];

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

    return {
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      in: totalIn,
      out: totalOut,
      balance,
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

  return {
    id: result.id,
    name: result.name,
    target_amount: result.target_amount,
    in: totalIn,
    out: totalOut,
    balance,
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

export const GoalServices = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoals,
};
