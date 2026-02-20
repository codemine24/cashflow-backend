import { z } from "zod";

const createCategory = z.object({
  body: z
    .object({
      title: z.string({
        message: "Title is required",
      }),
      icon: z.string().optional(),
      color: z.string().optional(),
    })
    .strict(),
});

const updateCategory = z.object({
  body: z
    .object({
      title: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
    })
    .strict(),
});

export const CategorySchemas = {
  createCategory,
  updateCategory,
};
