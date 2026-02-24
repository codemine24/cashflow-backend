import { z } from "zod";

const createBook = z.object({
  body: z
    .object({
      name: z.string({
        message: "Name is required",
      }),
    })
    .strict(),
});

const updateBook = z.object({
  body: z
    .object({
      name: z.string({ message: "Name is required" }),
    })
    .strict(),
});

export const BookSchemas = {
  createBook,
  updateBook,
};
