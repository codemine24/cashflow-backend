import { Router } from "express";
import auth from "../../middlewares/auth";
import { StatisticsControllers } from "./Statistics.controllers";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// GET /statistics/overview?period=week|month|year|all&book_id=<id>
router.get(
  "/book-overview",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getBookOverview,
);

// GET /statistics/category-breakdown?period=week|month|year|all&type=IN|OUT&book_id=<id>
router.get(
  "/category-breakdown",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getCategoryBreakdown,
);

// GET /statistics/loan-summary
router.get(
  "/loan-summary",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getLoanSummary,
);

// GET /statistics/goal-summary
router.get(
  "/goal-summary",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getGoalSummary,
);

// GET /statistics/goal-overview?period=week|month|year|all
router.get(
  "/goal-overview",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getGoalOverview,
);

// GET /statistics/dashboard-stats?period=weekly|monthly|yearly|all&book_id=<id>
router.get(
  "/wallet-stats",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatisticsControllers.getDashboardStatistics,
);

export const StatisticsRoutes = router;
