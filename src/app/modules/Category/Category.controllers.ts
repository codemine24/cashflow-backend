import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { CategoryServices } from "./Category.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE CATEGORY ----------------------------------
const createCategory = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await CategoryServices.createCategory(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

// -------------------------------------- GET CATEGORIES -----------------------------------
const getCategories = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await CategoryServices.getCategories(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// -------------------------------------- GET CATEGORY BY ID -------------------------------
const getCategoryById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await CategoryServices.getCategoryById(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE CATEGORY ----------------------------------
const updateCategory = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await CategoryServices.updateCategory(
    user,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE CATEGORIES --------------------------------
const deleteCategories = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await CategoryServices.deleteCategories(user, req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories deleted successfully",
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategories,
};
