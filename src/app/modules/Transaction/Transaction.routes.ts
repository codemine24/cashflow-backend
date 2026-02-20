import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { TransactionSchemas } from "./Transaction.schemas";
import { TransactionControllers } from "./Transaction.controllers";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(TransactionSchemas.createTransaction),
  TransactionControllers.createTransaction,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TransactionControllers.getAllTransactions,
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
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TransactionControllers.deleteTransaction,
);

export const TransactionRoutes = router;
