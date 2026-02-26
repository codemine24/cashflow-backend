import { z } from "zod";
import { TransactionType } from "../../../generated/prisma/enums";

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
    })
    .strict(),
});

export const GoalTransactionSchemas = {
  createGoalTransaction,
  updateGoalTransaction,
};
