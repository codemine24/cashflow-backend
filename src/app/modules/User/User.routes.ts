import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { UserControllers } from "./User.controllers";
import { fileUploader } from "../../utils/file-uploader";
import formDataValidator from "../../middlewares/form-data-validator";
import { UserSchemas } from "./User.schemas";

const router = Router();

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.getAllUsers,
);

router.patch(
  "/update-profile",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.singleUpload.single("avatar"),
  formDataValidator(UserSchemas.updateProfile),
  UserControllers.updateProfile,
);

export const UserRoutes = router;
