import z from "zod";

// -------------------------------------- REGISTER ------------------------------------------
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

// -------------------------------------- LOGIN ---------------------------------------------
const login = z.object({
  body: z.object({
    email: z.email({ error: "Email should be a valid email" }),
    password: z
      .string({ error: "Password should be a text" })
      .min(1, "Password is required"),
  }),
});

export const AuthSchemas = {
  register,
  login,
};
