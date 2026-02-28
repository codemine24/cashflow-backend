import { z } from "zod";
import { TransactionType } from "../../../generated/prisma/enums";
import { dateRegex, timeRegex } from "../../constants/common";

const createGoalTransaction = z.object({
  body: z
    .object({
      goal_id: z.uuid({
        message: "Goal ID should be a valid UUID",
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
      date: z
        .string()
        .regex(dateRegex, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      time: z
        .string()
        .regex(timeRegex, {
          message: "Time must be in HH:MM or HH:MM:SS format",
        })
        .optional(),
    })
    .strict(),
});

const updateGoalTransaction = z.object({
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
      date: z
        .string()
        .regex(dateRegex, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      time: z
        .string()
        .regex(timeRegex, {
          message: "Time must be in HH:MM or HH:MM:SS format",
        })
        .optional(),
    })
    .strict(),
});

export const GoalTransactionSchemas = {
  createGoalTransaction,
  updateGoalTransaction,
};
