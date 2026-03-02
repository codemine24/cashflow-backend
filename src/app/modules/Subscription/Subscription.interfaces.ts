import z from "zod";
import { SubscriptionSchemas } from "./Subscription.schemas";

export type CreateSubscriptionPayload = z.infer<
  typeof SubscriptionSchemas.createSubscription
>["body"];
