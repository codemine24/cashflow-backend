import z from "zod";
import { LoanSchemas } from "./Loan.schemas";

export type CreateLoanPayload = z.infer<typeof LoanSchemas.createLoan>["body"];
export type UpdateLoanPayload = z.infer<typeof LoanSchemas.updateLoan>["body"];
export type AddPaymentPayload = z.infer<typeof LoanSchemas.addPayment>["body"];
