import { sortOrderType } from "../../constants/common";

export const bookSearchableFields = ["name"];
export const bookSortableFields = ["name", "created_at", "updated_at"];

export const bookQueryValidationConfig: Record<string, any> = {
  sort_by: bookSortableFields,
  sort_order: sortOrderType,
};
