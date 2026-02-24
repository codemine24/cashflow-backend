import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { TransactionSchemas } from "./Transaction.schemas";
import { TransactionControllers } from "./Transaction.controllers";
import { UserRole } from "../../../generated/prisma/enums";
import { deleteRecordsValidationSchema } from "../../shared/schema";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(TransactionSchemas.createTransaction),
  TransactionControllers.createTransaction,
);

router.get(
  "/book/:bookId",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TransactionControllers.getTransactionsByBook,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TransactionControllers.getTransactionById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(TransactionSchemas.updateTransaction),
  TransactionControllers.updateTransaction,
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(deleteRecordsValidationSchema),
  TransactionControllers.deleteTransaction,
);

export const TransactionRoutes = router;
