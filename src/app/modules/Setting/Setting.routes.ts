import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { SettingSchemas } from "./Setting.schemas";
import { SettingControllers } from "./Setting.controllers";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(SettingSchemas.createSetting),
  SettingControllers.createSetting,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SettingControllers.getSettings,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SettingControllers.getSettingById,
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(SettingSchemas.updateSetting),
  SettingControllers.updateSetting,
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SettingControllers.deleteSetting,
);

export const SettingRoutes = router;
