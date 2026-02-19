import z from "zod";

const register = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }),
    email: z.email(),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    contact_number: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const AuthSchemas = {
  register,
};
