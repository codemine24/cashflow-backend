import { z } from "zod";
import { ShareRole } from "../../../generated/prisma/enums";

const createBook = z.object({
  body: z
    .object({
      name: z.string({
        message: "Name should be a text",
      }),
    })
    .strict(),
});

const updateBook = z.object({
  body: z
    .object({
      name: z.string({ message: "Name should be a text" }),
    })
    .strict(),
});

const shareBook = z.object({
  body: z
    .object({
      book_id: z.uuid({ message: "Book ID should be a valid UUID" }),
      email: z.email({ message: "Email should be a valid email" }),
      role: z
        .enum(Object.values(ShareRole), {
          message: `Role should be one of ${Object.values(ShareRole).join(
            " | ",
          )}`,
        })
        .default(ShareRole.VIEWER),
    })
    .strict(),
});

const removeMember = z.object({
  body: z
    .object({
      book_id: z.uuid({ message: "Book ID should be a valid UUID" }),
      user_id: z.uuid({ message: "User ID should be a valid UUID" }),
    })
    .strict(),
});

export const BookSchemas = {
  createBook,
  updateBook,
  shareBook,
  removeMember,
};
