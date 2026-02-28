import { Theme } from "../../../generated/prisma/enums";

export type CreateSettingPayload = {
  theme: Theme;
  language?: string;
  currency?: string;
  push_notification?: boolean;
};

export type UpdateSettingPayload = {
  theme?: Theme;
  language?: string;
  currency?: string;
  push_notification?: boolean;
};
