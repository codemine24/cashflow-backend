import z from "zod";
import { BookSchemas } from "./Book.schemas";

export type CreateBookPayload = z.infer<typeof BookSchemas.createBook>["body"];
export type UpdateBookPayload = z.infer<typeof BookSchemas.updateBook>["body"];
export type ShareBookPayload = z.infer<typeof BookSchemas.shareBook>["body"];
