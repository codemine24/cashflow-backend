import { Router } from "express";
import payloadValidator from "../../middlewares/payload-validator";
import { AuthSchemas } from "./Auth.schemas";
import { AuthControllers } from "./Auth.controllers";

const router = Router();

router.post(
  "/register",
  payloadValidator(AuthSchemas.register),
  AuthControllers.register,
);

router.post(
  "/login",
  payloadValidator(AuthSchemas.login),
  AuthControllers.login,
);

export const AuthRoutes = router;
