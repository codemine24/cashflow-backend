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
import { TFile } from "../../interfaces/file";
import sharp from "sharp";
import supabase from "../../shared/supabase";
import config from "../../../config";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";

// -------------------------------------- CREATE TRANSACTION --------------------------------
const createTransaction = async (
  user: TAuthUser,
  payload: CreateTransactionPayload,
  files: TFile[] | undefined,
) => {
  const book = await prisma.book.findFirst({
    where: {
      id: payload.book_id,
      OR: [
        { user_id: user.id },
        {
          book_members: {
            some: { user_id: user.id, role: { in: ["ADMIN", "EDITOR"] } },
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

  const attachment: string[] = [];

  if (files && files.length > 0) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: book.user_id,
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
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        "Upgrade to premium for upload attachments in this wallet.",
      );
    }

    for (const file of files) {
      const metadata = await sharp(file.buffer).metadata();
      const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`;
      const { data } = await supabase.storage
        .from(config.general_bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (!data?.id) {
        throw new CustomizedError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload attachment",
        );
      }

      await prisma.file.create({
        data: {
          user_id: user.id,
          name: file.originalname,
          alt_text: file.originalname,
          type: file.mimetype,
          size: file.size,
          width: metadata.width || 0,
          height: metadata.height || 0,
          path: data.path,
          bucket_id: data.id,
          bucket_name: config.general_bucket,
        },
      });

      attachment.push(data.path);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        ...transactionData,
        entry_by_id: user.id,
        attachment,
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
    },
    include: {
      book: true,
      category: true,
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
  });

  const book = await prisma.book.findFirst({
    where: {
      id: result.book_id,
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
      "Transaction not found or you are not the authorized to view transaction",
    );
  }

  return result;
};

// -------------------------------------- UPDATE TRANSACTION --------------------------------
const updateTransaction = async (
  user: TAuthUser,
  id: string,
  payload: UpdateTransactionPayload,
  files: TFile[] | undefined,
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
            some: { user_id: user.id, role: { in: ["ADMIN", "EDITOR"] } },
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

  const {
    date,
    time,
    attachment: existingAttachments,
    ...transactionData
  } = payload;

  let created_at: Date | undefined;
  if (date || time) {
    const datePart = date ?? new Date().toISOString().slice(0, 10);
    const timePart = time ?? "00:00:00";
    created_at = new Date(`${datePart}T${timePart}`);
  }

  const attachment: string[] = existingAttachments || transaction.attachment;

  if (files && files.length > 0) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: book.user_id,
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
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        "Upgrade to premium for upload attachments in this wallet.",
      );
    }

    for (const file of files) {
      const metadata = await sharp(file.buffer).metadata();
      const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`;
      const { data } = await supabase.storage
        .from(config.general_bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (!data?.id) {
        throw new CustomizedError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload attachment",
        );
      }

      await prisma.file.create({
        data: {
          user_id: user.id,
          name: file.originalname,
          alt_text: file.originalname,
          type: file.mimetype,
          size: file.size,
          width: metadata.width || 0,
          height: metadata.height || 0,
          path: data.path,
          bucket_id: data.id,
          bucket_name: config.general_bucket,
        },
      });

      attachment.push(data.path);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.update({
      where: {
        id,
      },
      data: {
        ...transactionData,
        attachment,
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
const deleteTransaction = async (user: TAuthUser, id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
  });

  if (!transaction) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  const result = await prisma.transaction.delete({
    where: {
      id,
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
  deleteTransaction,
};
