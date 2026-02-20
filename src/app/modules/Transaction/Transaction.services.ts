import { prisma } from "../../shared/prisma";
import {
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "./Transaction.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import {
  transactionQueryValidationConfig,
  transactionSearchableFields,
} from "./Transaction.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

const createTransaction = async (
  user: TAuthUser,
  payload: CreateTransactionPayload,
) => {
  // Ensure the book belongs to the user
  await prisma.book.findFirstOrThrow({
    where: {
      id: payload.book_id,
      user_id: user.id,
    },
  });

  const result = await prisma.transaction.create({
    data: {
      ...payload,
      entry_by_id: user.id,
    },
  });
  return result;
};

const getAllTransactions = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const {
    search_term,
    page,
    limit,
    sort_by,
    sort_order,
    book_id,
    type,
    category_id,
  } = query;

  if (sort_by)
    queryValidator(transactionQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(transactionQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.TransactionWhereInput[] = [
    { entry_by_id: user.id },
  ];

  if (book_id) andConditions.push({ book_id });
  if (type) andConditions.push({ type });
  if (category_id) andConditions.push({ category_id });

  if (search_term) {
    andConditions.push({
      OR: transactionSearchableFields.map((field) => {
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
    prisma.transaction.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        book: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where: whereConditions }),
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

const getTransactionById = async (user: TAuthUser, id: string) => {
  const result = await prisma.transaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
    include: {
      book: true,
      category: true,
    },
  });
  return result;
};

const updateTransaction = async (
  user: TAuthUser,
  id: string,
  payload: UpdateTransactionPayload,
) => {
  await prisma.transaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
  });

  const result = await prisma.transaction.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteTransaction = async (user: TAuthUser, id: string) => {
  await prisma.transaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
  });

  const result = await prisma.transaction.delete({
    where: {
      id,
    },
  });
  return result;
};

export const TransactionServices = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
