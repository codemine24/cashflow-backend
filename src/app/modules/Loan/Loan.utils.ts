import { sortOrderType } from "../../constants/common";

export const loanSearchableFields = ["person_name", "remark"];
export const loanSortableFields = [
  "person_name",
  "amount",
  "paid_amount",
  "due_date",
  "created_at",
  "updated_at",
];

export const loanQueryValidationConfig: Record<string, any> = {
  sort_by: loanSortableFields,
  sort_order: sortOrderType,
};
