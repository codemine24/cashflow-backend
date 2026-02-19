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

export const AuthRoutes = router;
