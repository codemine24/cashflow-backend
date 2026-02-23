import z from "zod";
import { GoalTransactionSchemas } from "./Goal-transaction.schemas";

export type CreateGoalTransactionPayload = z.infer<
  typeof GoalTransactionSchemas.createGoalTransaction
>["body"];

export type UpdateGoalTransactionPayload = z.infer<
  typeof GoalTransactionSchemas.updateGoalTransaction
>["body"];
