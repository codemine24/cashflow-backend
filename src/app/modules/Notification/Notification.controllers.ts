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

// -------------------------------------- MARK NOTIFICATIONS AS READ --------------------
const markNotificationsAsRead = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await NotificationServices.markNotificationsAsRead(
    user,
    req.body.ids,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications marked as read successfully",
    data: result,
  });
});

export const NotificationControllers = {
  getAllNotifications,
  markNotificationsAsRead,
};
