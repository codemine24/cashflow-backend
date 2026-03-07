import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { NotificationServices } from "./Notification.services";
import { TAuthUser } from "../../interfaces/common";

// -------------------------------------- GET ALL NOTIFICATIONS --------------------------
const getAllNotifications = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await NotificationServices.getAllNotifications(
    user,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const NotificationControllers = {
  getAllNotifications,
};
