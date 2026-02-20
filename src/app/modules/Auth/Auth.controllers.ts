import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { AuthServices } from "./Auth.services";

// -------------------------------------- GET OTP --------------------------------------------
const getOTP = catchAsync(async (req, res, next) => {
  const result = await AuthServices.getOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

// -------------------------------------- VALIDATE OTP ---------------------------------------
const validateOTP = catchAsync(async (req, res, next) => {
  const { refreshToken, ...result } = await AuthServices.validateOTP(req.body);
  const maxAge = 60 * 24 * 60 * 60 * 1000;
  res.cookie("refresh_token", refreshToken, { maxAge, httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
});

export const AuthControllers = {
  getOTP,
  validateOTP,
};
