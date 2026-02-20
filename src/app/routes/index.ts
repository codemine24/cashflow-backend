import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/Auth.routes";
import { BookRoutes } from "../modules/Book/Book.routes";

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
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
