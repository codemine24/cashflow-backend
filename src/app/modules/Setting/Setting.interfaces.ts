import z from "zod";
import { SettingSchemas } from "./Setting.schemas";

export type CreateSettingPayload = z.infer<
  typeof SettingSchemas.createSetting
>["body"];

export type UpdateSettingPayload = z.infer<
  typeof SettingSchemas.updateSetting
>["body"];
