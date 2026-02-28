import { TAuthUser } from "../../interfaces/common";
import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import { UserServices } from "./User.services";
import httpStatus from "http-status";

// -------------------------------------- UPDATE PROFILE ------------------------------------
const updateProfile = catchAsync(async (req, res, next) => {
  const result = await UserServices.updateProfile(
    req.user as TAuthUser,
    req.body,
    req.file,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserControllers = {
  updateProfile,
};
