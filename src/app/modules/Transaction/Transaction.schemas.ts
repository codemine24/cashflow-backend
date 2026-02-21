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
      type: z.enum(Object.values(TransactionType), {
        message: `Transaction type should be one of ${Object.values(
          TransactionType,
        ).join(" | ")}`,
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
        .enum(Object.values(TransactionType), {
          message: `Transaction type should be one of ${Object.values(
            TransactionType,
          ).join(" | ")}`,
        })
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
