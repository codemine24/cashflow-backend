import { z } from "zod";

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
};
