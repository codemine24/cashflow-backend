import z from "zod";
import { Theme } from "../../../generated/prisma/enums";

const updateProfile = z.object({
  body: z
    .object({
      name: z
        .string({
          error: "Name should be a text",
        })
        .optional(),
      contact_number: z
        .string({ error: "Contact number should be a text" })
        .optional(),
      theme: z.enum(Theme).optional(),
      language: z.string().optional(),
      currency: z.string().optional(),
      push_notification: z.boolean().optional(),
    })
    .strict(),
});

export const UserSchemas = {
  updateProfile,
};
