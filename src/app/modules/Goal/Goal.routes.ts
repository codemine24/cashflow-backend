import { Router } from "express";
import auth from "../../middlewares/auth";
import payloadValidator from "../../middlewares/payload-validator";
import { GoalSchemas } from "./Goal.schemas";
import { GoalControllers } from "./Goal.controllers";
import { UserRole } from "../../../generated/prisma/enums";
import { deleteRecordsValidationSchema } from "../../shared/schema";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(GoalSchemas.createGoal),
  GoalControllers.createGoal,
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GoalControllers.getAllGoals,
);

router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GoalControllers.getGoalById,
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(GoalSchemas.updateGoal),
  GoalControllers.updateGoal,
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(deleteRecordsValidationSchema),
  GoalControllers.deleteGoals,
);

router.post(
  "/share",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  payloadValidator(GoalSchemas.shareGoal),
  GoalControllers.shareGoal,
);

export const GoalRoutes = router;
