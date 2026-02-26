import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/Auth.routes";
import { BookRoutes } from "../modules/Book/Book.routes";
import { TransactionRoutes } from "../modules/Transaction/Transaction.routes";
import { CategoryRoutes } from "../modules/Category/Category.routes";
import { GoalTransactionRoutes } from "../modules/Goal-transaction/Goal-transaction.routes";
import { GoalRoutes } from "../modules/Goal/Goal.routes";
import { UserRoutes } from "../modules/User/User.routes";

const router = Router();

const routes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/book",
    route: BookRoutes,
  },
  {
    path: "/transaction",
    route: TransactionRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/goal-transaction",
    route: GoalTransactionRoutes,
  },
  {
    path: "/goal",
    route: GoalRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
