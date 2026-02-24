import { prisma } from "../../shared/prisma";
import {
  CreateBookPayload,
  ShareBookPayload,
  UpdateBookPayload,
} from "./Book.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import { bookQueryValidationConfig, bookSearchableFields } from "./Book.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

// -------------------------------------- CREATE BOOK ------------------------------------
const createBook = async (user: TAuthUser, payload: CreateBookPayload) => {
  const result = await prisma.book.create({
    data: {
      ...payload,
      user_id: user.id,
    },
  });
  return result;
};

// -------------------------------------- GET ALL BOOKS ----------------------------------
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

  const andConditions: Prisma.BookWhereInput[] = [
    {
      OR: [
        { user_id: user.id },
        {
          book_members: {
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
        book_members: {
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
    await prisma.book.count({ where: whereConditions }),
  ]);

  const formattedResult = result.map((book) => {
    const totalIn = book.transactions.reduce((acc, transaction) => {
      if (transaction.type === "IN") {
        return acc + Number(transaction.amount);
      } else {
        return acc;
      }
    }, 0);

    const totalOut = book.transactions.reduce((acc, transaction) => {
      if (transaction.type === "OUT") {
        return acc + Number(transaction.amount);
      } else {
        return acc;
      }
    }, 0);

    const balance = totalIn - totalOut;

    const role =
      book.user_id === user.id ? "OWNER" : book.book_members[0]?.role;

    const members = book.book_members.map((member) => ({
      ...member.user,
      role: member.role,
    }));

    return {
      id: book.id,
      name: book.name,
      role,
      in: totalIn,
      out: totalOut,
      balance,
      others_member: [...members, { ...book.user, role: "OWNER" }].filter(
        (member) => member.id !== user.id,
      ),
      created_at: book.created_at,
      updated_at: book.updated_at,
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

// -------------------------------------- GET BOOK BY ID ---------------------------------
const getBookById = async (user: TAuthUser, id: string) => {
  const result = await prisma.book.findFirstOrThrow({
    where: {
      id,
      OR: [
        { user_id: user.id },
        {
          book_members: {
            some: {
              user_id: user.id,
            },
          },
        },
      ],
    },
    include: {
      transactions: true,
      book_members: {
        where: {
          user_id: user.id,
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

  const role =
    result.user_id === user.id ? "OWNER" : result.book_members[0]?.role;

  return {
    id: result.id,
    name: result.name,
    role,
    in: totalIn,
    out: totalOut,
    balance,
    transactions: result.transactions,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

// -------------------------------------- UPDATE BOOK ------------------------------------
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

// -------------------------------------- DELETE BOOKS -----------------------------------
const deleteBooks = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.book.deleteMany({
    where: {
      id: {
        in: ids,
      },
      user_id: user.id,
    },
  });

  return result;
};

// -------------------------------------- SHARE BOOK --------------------------------------
const shareBook = async (user: TAuthUser, payload: ShareBookPayload) => {
  const { book_id, user_id, role = "VIEWER" } = payload;

  // Step 1: Verify ownership
  const owner = await prisma.book.findFirst({
    where: {
      id: book_id,
      user_id: user.id,
    },
  });

  if (!owner) {
    throw new Error("Book not found or you are not the owner");
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

  const result = await prisma.bookMember.upsert({
    where: {
      book_id_user_id: {
        book_id,
        user_id,
      },
    },
    update: {
      role,
    },
    create: {
      book_id,
      user_id,
      role,
    },
  });

  return result;
};

export const BookServices = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBooks,
  shareBook,
};
