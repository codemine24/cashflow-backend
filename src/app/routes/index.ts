import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/Auth.routes";
import { BookRoutes } from "../modules/Book/Book.routes";
import { TransactionRoutes } from "../modules/Transaction/Transaction.routes";
import { CategoryRoutes } from "../modules/Category/Category.routes";

const router = Router();

const routes = [
  {
    path: "/auth",
    route: AuthRoutes,
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
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
