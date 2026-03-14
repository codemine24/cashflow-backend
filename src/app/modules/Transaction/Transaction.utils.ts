import { sortOrderType } from "../../constants/common";

export const transactionSearchableFields = ["remark", "amount"];
export const transactionSortableFields = ["amount", "created_at", "updated_at"];

export const transactionQueryValidationConfig: Record<string, any> = {
  sort_by: transactionSortableFields,
  sort_order: sortOrderType,
};
