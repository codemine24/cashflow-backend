import { z } from "zod";
import { Theme } from "../../../generated/prisma/enums";

const createSetting = z.object({
  body: z
    .object({
      theme: z.enum(Theme),
      language: z.string().optional(),
      currency: z.string().optional(),
      push_notification: z.boolean().optional(),
      user_id: z.uuid(),
    })
    .strict(),
});

const updateSetting = z.object({
  body: z
    .object({
      theme: z.enum(Theme).optional(),
      language: z.string().optional(),
      currency: z.string().optional(),
      push_notification: z.boolean().optional(),
      user_id: z.uuid(),
    })
    .strict(),
});

export const SettingSchemas = {
  createSetting,
  updateSetting,
};
