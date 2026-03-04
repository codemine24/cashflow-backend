import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { TransactionServices } from "./Transaction.services";
import { TAuthUser } from "../../interfaces/common";

const createTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await TransactionServices.createTransaction(
    user,
    req.body,
    req.files as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Transaction created successfully",
    data: result,
  });
});

const getTransactionsByBook = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await TransactionServices.getTransactionsByBook(
    user,
    req.params.bookId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transactions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getTransactionById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await TransactionServices.getTransactionById(
    user,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction retrieved successfully",
    data: result,
  });
});

const updateTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await TransactionServices.updateTransaction(
    user,
    req.params.id,
    req.body,
    req.files as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction updated successfully",
    data: result,
  });
});

const deleteTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await TransactionServices.deleteTransaction(
    user,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction deleted successfully",
    data: result,
  });
});

export const TransactionControllers = {
  createTransaction,
  getTransactionsByBook,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
