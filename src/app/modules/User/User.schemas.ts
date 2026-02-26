import z from "zod";

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
    })
    .strict(),
});

export const UserSchemas = {
  updateProfile,
};
