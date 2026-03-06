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
      purchase_token: z.string({
        error: "Purchase token is required",
      }),
      product_id: z.string({
        error: "Product ID is required",
      }),
      package_name: z.string().optional(),
    })
    .strict(),
});

export const SubscriptionSchemas = {
  createSubscription,
};
