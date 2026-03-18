import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { LoanServices } from "./Loan.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE LOAN ------------------------------------
const createLoan = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.createLoan(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Loan created successfully",
    data: result,
  });
});

// -------------------------------------- GET ALL LOANS ----------------------------------
const getAllLoans = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.getAllLoans(user, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Loans retrieved successfully",
    meta: {
      ...result.meta,
      summary: result.summary,
    },
    data: result.data,
  });
});

// -------------------------------------- GET LOAN BY ID ---------------------------------
const getLoanById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.getLoanById(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Loan retrieved successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE LOAN ------------------------------------
const updateLoan = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.updateLoan(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Loan updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE LOANS -----------------------------------
const deleteLoans = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.deleteLoans(user, req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Loan deleted successfully",
    data: result,
  });
});

// -------------------------------------- ADD PAYMENT ------------------------------------
const addPayment = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.addPayment(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment added successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE PAYMENT ------------------------------------
const updatePayment = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await LoanServices.updatePayment(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE PAYMENT ------------------------------------
const deletePayment = catchAsync(async (req, res) => {
  const result = await LoanServices.deletePayment(req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment deleted successfully",
    data: result,
  });
});

export const LoanControllers = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoans,
  addPayment,
  updatePayment,
  deletePayment,
};
