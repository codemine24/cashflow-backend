import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { AuthServices } from "./Auth.services";

// -------------------------------------- REGISTER ------------------------------------------
const register = catchAsync(async (req, res, next) => {
  const result = await AuthServices.register(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

// -------------------------------------- LOGIN ---------------------------------------------
const login = catchAsync(async (req, res, next) => {
  const { refreshToken, ...result } = await AuthServices.login(req.body);
  const maxAge = 60 * 24 * 60 * 60 * 1000;
  res.cookie("refresh_token", refreshToken, { maxAge, httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const AuthControllers = {
  register,
  login,
};
