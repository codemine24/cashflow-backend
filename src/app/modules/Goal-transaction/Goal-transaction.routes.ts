import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { GoalTransactionSchemas } from "./Goal-transaction.schemas";
import { GoalTransactionControllers } from "./Goal-transaction.controllers";
import { UserRole } from "../../../generated/prisma/enums";
import { deleteRecordsValidationSchema } from "../../shared/schema";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(GoalTransactionSchemas.createGoalTransaction),
  GoalTransactionControllers.createGoalTransaction,
);

router.get(
  "/goal/:goalId",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GoalTransactionControllers.getGoalTransactionsByGoal,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GoalTransactionControllers.getGoalTransactionById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(GoalTransactionSchemas.updateGoalTransaction),
  GoalTransactionControllers.updateGoalTransaction,
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(deleteRecordsValidationSchema),
  GoalTransactionControllers.deleteGoalTransaction,
);

export const GoalTransactionRoutes = router;
