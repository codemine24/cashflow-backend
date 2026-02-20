import z from "zod";
import { AuthSchemas } from "./Auth.schemas";

export type RegisterPayload = z.infer<typeof AuthSchemas.register>["body"];

export type ValidateOTPPayload = z.infer<
  typeof AuthSchemas.validateOTP
>["body"];
