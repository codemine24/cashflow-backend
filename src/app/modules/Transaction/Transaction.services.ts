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

// -------------------------------------- CREATE TRANSACTION --------------------------------
const createTransaction = async (
  user: TAuthUser,
  payload: CreateTransactionPayload,
) => {
  const book = await prisma.book.findFirst({
    where: {
      id: payload.book_id,
      OR: [
        { user_id: user.id },
        {
          book_members: {
            some: { user_id: user.id, role: "EDITOR" },
          },
        },
      ],
    },
  });

  if (!book) {
    throw new Error(
      "Book not found or you are not the authorized to create transaction",
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
    const transaction = await tx.transaction.create({
      data: {
        ...transactionData,
        entry_by_id: user.id,
        ...(created_at ? { created_at } : {}),
      },
    });

    await tx.book.update({
      where: { id: book.id },
      data: {
        updated_at: new Date(),
      },
    });

    return transaction;
  });
  return result;
};

// -------------------------------------- GET TRANSACTIONS BY BOOK --------------------------
const getTransactionsByBook = async (
  user: TAuthUser,
  bookId: string,
  query: Record<string, any>,
) => {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      OR: [
        { user_id: user.id },
        {
          book_members: {
            some: { user_id: user.id },
          },
        },
      ],
    },
  });

  if (!book) {
    throw new Error(
      "Book not found or you are not the authorized to view transactions",
    );
  }

  const { search_term, page, limit, sort_by, sort_order, type, category_id } =
    query;

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

  const andConditions: Prisma.TransactionWhereInput[] = [{ book_id: bookId }];

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

// -------------------------------------- GET TRANSACTION BY ID -----------------------------
const getTransactionById = async (user: TAuthUser, id: string) => {
  const result = await prisma.transaction.findFirstOrThrow({
    where: {
      id,
      entry_by_id: user.id,
    },
    include: {
      book: true,
      category: true,
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

// -------------------------------------- UPDATE TRANSACTION --------------------------------
const updateTransaction = async (
  user: TAuthUser,
  id: string,
  payload: UpdateTransactionPayload,
) => {
  const transaction = await prisma.transaction.findFirstOrThrow({
    where: {
      id,
    },
  });

  const book = await prisma.book.findFirst({
    where: {
      id: transaction.book_id,
      OR: [
        { user_id: user.id },
        {
          book_members: {
            some: { user_id: user.id, role: "EDITOR" },
          },
        },
      ],
    },
  });

  if (!book) {
    throw new Error(
      "Book not found or you are not the authorized to update transaction",
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
    const transaction = await tx.transaction.update({
      where: {
        id,
      },
      data: {
        ...transactionData,
        update_by_id: user.id,
        ...(created_at ? { created_at } : {}),
      },
    });

    await tx.book.update({
      where: { id: book.id },
      data: {
        updated_at: new Date(),
      },
    });

    return transaction;
  });

  return result;
};

// -------------------------------------- DELETE TRANSACTIONS -------------------------------
const deleteTransactions = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.transaction.deleteMany({
    where: {
      id: {
        in: ids,
      },
      entry_by_id: user.id,
    },
  });

  return result;
};

export const TransactionServices = {
  createTransaction,
  getTransactionsByBook,
  getTransactionById,
  updateTransaction,
  deleteTransactions,
};
