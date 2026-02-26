import { z } from "zod";

const createSetting = z.object({
  body: z
    .object({
      theme: z.string({
        message: "Theme is required",
      }),
      language: z.string().optional(),
      currency: z.string().optional(),
      push_notification: z.boolean().optional(),
    })
    .strict(),
});

const updateSetting = z.object({
  body: z
    .object({
      theme: z.string().optional(),
      language: z.string().optional(),
      currency: z.string().optional(),
      push_notification: z.boolean().optional(),
    })
    .strict(),
});

export const SettingSchemas = {
  createSetting,
  updateSetting,
};
