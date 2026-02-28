import { sortOrderType } from "../../constants/common";

export const userSearchableFields = ["name", "email"];
export const userSortableFields = ["name", "email", "created_at", "updated_at"];

export const userQueryValidationConfig: Record<string, any> = {
  sort_by: userSortableFields,
  sort_order: sortOrderType,
};