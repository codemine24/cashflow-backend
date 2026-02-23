import { sortOrderType } from "../../constants/common";

export const goalTransactionSearchableFields = ["remark"];
export const goalTransactionSortableFields = [
  "amount",
  "created_at",
  "updated_at",
];

export const goalTransactionQueryValidationConfig: Record<string, any> = {
  sort_by: goalTransactionSortableFields,
  sort_order: sortOrderType,
};
