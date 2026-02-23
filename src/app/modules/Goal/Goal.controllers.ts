import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { GoalServices } from "./Goal.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE GOAL ------------------------------------
const createGoal = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalServices.createGoal(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Goal created successfully",
    data: result,
  });
});

// -------------------------------------- GET ALL GOALS ----------------------------------
const getAllGoals = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalServices.getAllGoals(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goals retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// -------------------------------------- GET GOAL BY ID ---------------------------------
const getGoalById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalServices.getGoalById(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal retrieved successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE GOAL ------------------------------------
const updateGoal = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalServices.updateGoal(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE GOALS -----------------------------------
const deleteGoals = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await GoalServices.deleteGoals(user, req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal deleted successfully",
    data: result,
  });
});

export const GoalControllers = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoals,
};
