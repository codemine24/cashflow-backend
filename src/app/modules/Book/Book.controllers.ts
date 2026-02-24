import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { BookServices } from "./Book.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- CREATE BOOK ------------------------------------
const createBook = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await BookServices.createBook(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Book created successfully",
    data: result,
  });
});

// -------------------------------------- GET ALL BOOKS ----------------------------------
const getAllBooks = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await BookServices.getAllBooks(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Books retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// -------------------------------------- GET BOOK BY ID ---------------------------------
const getBookById = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await BookServices.getBookById(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book retrieved successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE BOOK ------------------------------------
const updateBook = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await BookServices.updateBook(user, req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE BOOKS -----------------------------------
const deleteBooks = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await BookServices.deleteBooks(user, req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book deleted successfully",
    data: result,
  });
});

export const BookControllers = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBooks,
};
