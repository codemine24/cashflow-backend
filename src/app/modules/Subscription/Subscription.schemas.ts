import { z } from "zod";
import { SubscriptionPlan } from "../../../generated/prisma/enums";

const createSubscription = z.object({
  body: z
    .object({
      plan: z.enum(Object.values(SubscriptionPlan) as [string, ...string[]], {
        message: `Plan should be one of ${Object.values(SubscriptionPlan).join(
          " | ",
        )}`,
      }),
      price: z.number({
        message: "Price should be a number",
      }),
    })
    .strict(),
});

export const SubscriptionSchemas = {
  createSubscription,
};
