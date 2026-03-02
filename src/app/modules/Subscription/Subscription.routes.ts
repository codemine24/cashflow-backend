import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { UserRole } from "../../../generated/prisma/enums";
import { SubscriptionSchemas } from "./Subscription.schemas";
import { SubscriptionControllers } from "./Subscription.controllers";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(SubscriptionSchemas.createSubscription),
  SubscriptionControllers.createSubscription,
);

router.get(
  "/my",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SubscriptionControllers.getMySubscription,
);

export const SubscriptionRoutes = router;
