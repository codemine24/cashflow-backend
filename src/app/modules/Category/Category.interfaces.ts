import z from "zod";
import { CategorySchemas } from "./Category.schemas";

export type CreateCategoryPayload = z.infer<
  typeof CategorySchemas.createCategory
>["body"];

export type UpdateCategoryPayload = z.infer<
  typeof CategorySchemas.updateCategory
>["body"];
