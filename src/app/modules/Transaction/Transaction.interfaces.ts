import z from "zod";
import { TransactionSchemas } from "./Transaction.schemas";

export type CreateTransactionPayload = z.infer<
  typeof TransactionSchemas.createTransaction
>["body"] & { attachment?: string[] };

export type UpdateTransactionPayload = z.infer<
  typeof TransactionSchemas.updateTransaction
>["body"];
