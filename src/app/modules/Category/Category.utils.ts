import { sortOrderType } from "../../constants/common";

export const categorySearchableFields = ["title"];
export const categorySortableFields = ["title", "created_at", "updated_at"];

export const categoryQueryValidationConfig: Record<string, any> = {
  sort_by: categorySortableFields,
  sort_order: sortOrderType,
};
