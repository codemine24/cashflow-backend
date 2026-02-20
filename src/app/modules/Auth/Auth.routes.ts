import { Router } from "express";
import payloadValidator from "../../middlewares/payload-validator";
import { AuthSchemas } from "./Auth.schemas";
import { AuthControllers } from "./Auth.controllers";

const router = Router();

router.post(
  "/get-otp",
  payloadValidator(AuthSchemas.register),
  AuthControllers.getOTP,
);

router.post(
  "/validate-otp",
  payloadValidator(AuthSchemas.validateOTP),
  AuthControllers.validateOTP,
);

export const AuthRoutes = router;
