import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { BookSchemas } from "./Book.schemas";
import { BookControllers } from "./Book.controllers";
import { UserRole } from "../../../generated/prisma/enums";
import { deleteRecordsValidationSchema } from "../../shared/schema";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(BookSchemas.createBook),
  BookControllers.createBook,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BookControllers.getAllBooks,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BookControllers.getBookById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(BookSchemas.updateBook),
  BookControllers.updateBook,
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(deleteRecordsValidationSchema),
  BookControllers.deleteBooks,
);

export const BookRoutes = router;
