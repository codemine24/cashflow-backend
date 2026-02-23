import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { GoalTransactionServices } from "./Goal-transaction.services";
import { TAuthUser } from "../../interfaces/common";

const createGoalTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalTransactionServices.createGoalTransaction(
    user,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Goal transaction created successfully",
    data: result,
  });
});

const getGoalTransactionsByGoal = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalTransactionServices.getGoalTransactionsByGoal(
    user,
    req.params.goalId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal transactions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getGoalTransactionById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalTransactionServices.getGoalTransactionById(
    user,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal transaction retrieved successfully",
    data: result,
  });
});

const updateGoalTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalTransactionServices.updateGoalTransaction(
    user,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal transaction updated successfully",
    data: result,
  });
});

const deleteGoalTransaction = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalTransactionServices.deleteGoalTransactions(
    user,
    req.body.ids,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal transaction deleted successfully",
    data: result,
  });
});

export const GoalTransactionControllers = {
  createGoalTransaction,
  getGoalTransactionsByGoal,
  getGoalTransactionById,
  updateGoalTransaction,
  deleteGoalTransaction,
};
