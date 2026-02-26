import { sortOrderType } from "../../constants/common";

export const goalSearchableFields = ["name"];
export const goalSortableFields = [
  "name",
  "target_amount",
  "created_at",
  "updated_at",
];

export const goalQueryValidationConfig: Record<string, any> = {
  sort_by: goalSortableFields,
  sort_order: sortOrderType,
};
