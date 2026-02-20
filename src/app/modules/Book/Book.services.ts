import { prisma } from "../../shared/prisma";
import { CreateBookPayload, UpdateBookPayload } from "./Book.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import { bookQueryValidationConfig, bookSearchableFields } from "./Book.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

const createBook = async (user: TAuthUser, payload: CreateBookPayload) => {
  const result = await prisma.book.create({
    data: {
      ...payload,
      user_id: user.id,
    },
  });
  return result;
};

const getAllBooks = async (user: TAuthUser, query: Record<string, any>) => {
  const { search_term, page, limit, sort_by, sort_order } = query;

  if (sort_by) queryValidator(bookQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(bookQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.BookWhereInput[] = [{ user_id: user.id }];

  if (search_term) {
    andConditions.push({
      OR: bookSearchableFields.map((field) => {
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
    prisma.book.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    await prisma.book.count({ where: whereConditions }),
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

const getBookById = async (user: TAuthUser, id: string) => {
  const result = await prisma.book.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });
  return result;
};

const updateBook = async (
  user: TAuthUser,
  id: string,
  payload: UpdateBookPayload,
) => {
  await prisma.book.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.book.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteBook = async (user: TAuthUser, id: string) => {
  await prisma.book.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.book.delete({
    where: {
      id,
    },
  });
  return result;
};

export const BookServices = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
