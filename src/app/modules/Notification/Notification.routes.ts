import { Router } from "express";
import auth from "../../middlewares/auth";
import { NotificationControllers } from "./Notification.controllers";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NotificationControllers.getAllNotifications,
);

export const NotificationRoutes = router;
