import { z } from "zod";
import { LoanStatus, LoanType } from "../../../generated/prisma/enums";
import { dateRegex, timeRegex } from "../../constants/common";

const createLoan = z.object({
  body: z
    .object({
      person_name: z.string({
        message: "Person name is required",
      }),
      amount: z.number({
        message: "Amount is required",
      }),
      type: z.nativeEnum(LoanType, {
        message: "Type is required",
      }),
      remark: z.string().optional(),
      due_date: z.string().optional(),
    })
    .strict(),
});

const updateLoan = z.object({
  body: z
    .object({
      person_name: z.string().optional(),
      amount: z.number().optional(),
      type: z.nativeEnum(LoanType).optional(),
      status: z.nativeEnum(LoanStatus).optional(),
      remark: z.string().optional(),
      due_date: z.string().optional(),
    })
    .strict(),
});

const addPayment = z.object({
  body: z
    .object({
      loan_id: z.uuid({
        message: "Loan ID is required",
      }),
      amount: z.number({
        message: "Amount is required",
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

export const LoanSchemas = {
  createLoan,
  updateLoan,
  addPayment,
};
