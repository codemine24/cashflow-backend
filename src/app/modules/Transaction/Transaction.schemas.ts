import { z } from "zod";
import { TransactionType } from "../../../generated/prisma/enums";

const createTransaction = z.object({
  body: z
    .object({
      book_id: z.string({
        message: "Book ID is required",
      }),
      amount: z.number({
        message: "Amount is required",
      }),
      type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE] as const, {
        message: "Type is required",
      }),
      remark: z.string().optional(),
      category_id: z.string().optional(),
    })
    .strict(),
});

const updateTransaction = z.object({
  body: z
    .object({
      amount: z.number().optional(),
      type: z
        .enum([TransactionType.INCOME, TransactionType.EXPENSE])
        .optional(),
      remark: z.string().optional(),
      category_id: z.string().optional(),
    })
    .strict(),
});

export const TransactionSchemas = {
  createTransaction,
  updateTransaction,
};
