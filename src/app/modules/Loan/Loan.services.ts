import { prisma } from "../../shared/prisma";
import {
  CreateLoanPayload,
  UpdateLoanPayload,
  AddPaymentPayload,
} from "./Loan.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import { loanQueryValidationConfig, loanSearchableFields } from "./Loan.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";

// -------------------------------------- CREATE LOAN ------------------------------------
const createLoan = async (user: TAuthUser, payload: CreateLoanPayload) => {
  const result = await prisma.loan.create({
    data: {
      ...payload,
      user_id: user.id,
      due_date: payload.due_date ? new Date(payload.due_date) : null,
    },
  });
  return result;
};

// -------------------------------------- GET ALL LOANS ----------------------------------
const getAllLoans = async (user: TAuthUser, query: Record<string, any>) => {
  const { search_term, page, limit, sort_by, sort_order, type, status } = query;

  if (sort_by) queryValidator(loanQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(loanQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.LoanWhereInput[] = [
    {
      user_id: user.id,
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: loanSearchableFields.map((field) => ({
        [field]: {
          contains: search_term.trim(),
          mode: "insensitive",
        },
      })),
    });
  }

  if (type) {
    andConditions.push({ type });
  }

  if (status) {
    andConditions.push({ status });
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.loan.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        payments: true,
      },
    }),
    prisma.loan.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: result,
  };
};

// -------------------------------------- GET LOAN BY ID ---------------------------------
const getLoanById = async (user: TAuthUser, id: string) => {
  const result = await prisma.loan.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
    include: {
      payments: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });
  return result;
};

// -------------------------------------- UPDATE LOAN ------------------------------------
const updateLoan = async (
  user: TAuthUser,
  id: string,
  payload: UpdateLoanPayload,
) => {
  await prisma.loan.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.loan.update({
    where: {
      id,
    },
    data: {
      ...payload,
      due_date: payload.due_date ? new Date(payload.due_date) : undefined,
    },
  });
  return result;
};

// -------------------------------------- DELETE LOANS -----------------------------------
const deleteLoans = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.loan.deleteMany({
    where: {
      id: {
        in: ids,
      },
      user_id: user.id,
    },
  });

  return result;
};

// -------------------------------------- ADD PAYMENT ------------------------------------
const addPayment = async (user: TAuthUser, payload: AddPaymentPayload) => {
  const { loan_id, amount, remark, date, time } = payload;

  const loan = await prisma.loan.findFirst({
    where: {
      id: loan_id,
      user_id: user.id,
    },
  });

  if (!loan) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Loan not found");
  }

  let created_at: Date | undefined;
  if (date || time) {
    const datePart = date ?? new Date().toISOString().slice(0, 10);
    const timePart = time ?? "00:00:00";
    created_at = new Date(`${datePart}T${timePart}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.loanPayment.create({
      data: {
        loan_id,
        amount,
        remark,
        ...(created_at ? { created_at } : {}),
      },
    });

    const updatedLoan = await tx.loan.update({
      where: {
        id: loan_id,
      },
      data: {
        paid_amount: {
          increment: amount,
        },
      },
    });

    // Automatically mark as PAID if fully paid
    if (Number(updatedLoan.paid_amount) >= Number(updatedLoan.amount)) {
      await tx.loan.update({
        where: { id: loan_id },
        data: { status: "PAID" },
      });
    }

    return payment;
  });

  return result;
};

export const LoanServices = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoans,
  addPayment,
};
