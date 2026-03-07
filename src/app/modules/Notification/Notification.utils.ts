import { sortOrderType } from "../../constants/common";

export const notificationSearchableFields = ["title", "message"];
export const notificationSortableFields = ["created_at", "updated_at"];

export const notificationQueryValidationConfig: Record<string, any> = {
  sort_by: notificationSortableFields,
  sort_order: sortOrderType,
};
