import z from "zod";
import { AuthSchemas } from "./Auth.schemas";

export type RegisterPayload = z.infer<typeof AuthSchemas.register>["body"];

export type LoginPayload = z.infer<typeof AuthSchemas.login>["body"];
