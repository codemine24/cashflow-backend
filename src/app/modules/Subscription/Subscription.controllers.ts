import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { TAuthUser } from "../../interfaces/common";
import { SubscriptionServices } from "./Subscription.services";

const createSubscription = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await SubscriptionServices.createSubscription(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User subscribed successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req, res) => {
  const user = req.user as TAuthUser;
  const result = await SubscriptionServices.getMySubscription(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

export const SubscriptionControllers = {
  createSubscription,
  getMySubscription,
};
