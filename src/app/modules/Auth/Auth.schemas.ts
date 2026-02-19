import z from "zod";

const register = z.object({
  body: z.object({
    // register body schema
  }),
});

export const AuthSchemas = {
  register,
};
