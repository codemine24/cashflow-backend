import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { CategorySchemas } from "./Category.schemas";
import { CategoryControllers } from "./Category.controllers";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(CategorySchemas.createCategory),
  CategoryControllers.createCategory,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CategoryControllers.getAllCategories,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CategoryControllers.getCategoryById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(CategorySchemas.updateCategory),
  CategoryControllers.updateCategory,
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CategoryControllers.deleteCategory,
);

export const CategoryRoutes = router;
