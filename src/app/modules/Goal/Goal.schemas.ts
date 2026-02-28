import { z } from "zod";
import { ShareRole } from "../../../generated/prisma/enums";

const createGoal = z.object({
  body: z
    .object({
      name: z.string({
        message: "Name is required",
      }),
      target_amount: z.number({
        message: "Target amount should be a valid number",
      }),
    })
    .strict(),
});

const shareGoal = z.object({
  body: z
    .object({
      goal_id: z.uuid({ message: "Goal ID should be a valid UUID" }),
      email: z.email({ message: "Email should be a valid email" }),
      role: z
        .enum(Object.values(ShareRole), {
          message: `Role should be one of ${Object.values(ShareRole).join(
            " | ",
          )}`,
        })
        .default(ShareRole.VIEWER),
    })
    .strict(),
});

const updateGoal = z.object({
  body: z
    .object({
      name: z.string().optional(),
      target_amount: z.number().optional(),
    })
    .strict(),
});

export const GoalSchemas = {
  createGoal,
  updateGoal,
  shareGoal,
};
