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

export const AuthControllers = {
  register,
};
