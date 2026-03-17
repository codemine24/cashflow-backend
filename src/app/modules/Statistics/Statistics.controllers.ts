import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { StatisticsServices } from "./Statistics.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- GET OVERVIEW -----------------------------------
const getBookOverview = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getBookOverview(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Overview statistics retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET CATEGORY BREAKDOWN -------------------------
const getCategoryBreakdown = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getCategoryBreakdown(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category breakdown retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET LOAN SUMMARY -------------------------------
const getLoanSummary = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getLoanSummary(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Loan summary retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET GOAL SUMMARY -------------------------------
const getGoalSummary = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getGoalSummary(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal summary retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET GOAL OVERVIEW ------------------------------
const getGoalOverview = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getGoalOverview(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Goal overview statistics retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET DASHBOARD STATISTICS ----------------------
const getDashboardStatistics = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await StatisticsServices.getDashboardStatistics(
    user,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

export const StatisticsControllers = {
  getBookOverview,
  getCategoryBreakdown,
  getLoanSummary,
  getGoalSummary,
  getGoalOverview,
  getDashboardStatistics,
};
