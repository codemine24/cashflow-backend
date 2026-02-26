import { z } from "zod";
import { TransactionType } from "../../../generated/prisma/enums";

const createTransaction = z.object({
  body: z
    .object({
      book_id: z.uuid({
        message: "Book ID should be a valid UUID",
      }),
      amount: z.number({
        message: "Amount should be a valid number",
      }),
      type: z.enum(Object.values(TransactionType), {
        message: `Transaction type should be one of ${Object.values(
          TransactionType,
        ).join(" | ")}`,
      }),
      remark: z.string().optional(),
      category_id: z.string().optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/, {
          message: "Time must be in HH:MM or HH:MM:SS format",
        })
        .optional(),
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
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/, {
          message: "Time must be in HH:MM or HH:MM:SS format",
        })
        .optional(),
    })
    .strict(),
});

export const TransactionSchemas = {
  createTransaction,
  updateTransaction,
};
