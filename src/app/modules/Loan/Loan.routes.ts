import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { LoanSchemas } from "./Loan.schemas";
import { LoanControllers } from "./Loan.controllers";
import { UserRole } from "../../../generated/prisma/enums";
import { deleteRecordsValidationSchema } from "../../shared/schema";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(LoanSchemas.createLoan),
  LoanControllers.createLoan,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LoanControllers.getAllLoans,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LoanControllers.getLoanById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(LoanSchemas.updateLoan),
  LoanControllers.updateLoan,
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(deleteRecordsValidationSchema),
  LoanControllers.deleteLoans,
);

router.post(
  "/payment",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(LoanSchemas.addPayment),
  LoanControllers.addPayment,
);

export const LoanRoutes = router;
