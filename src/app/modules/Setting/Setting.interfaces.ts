export type CreateSettingPayload = {
  theme: string;
  language?: string;
  currency?: string;
  push_notification?: boolean;
};

export type UpdateSettingPayload = {
  theme?: string;
  language?: string;
  currency?: string;
  push_notification?: boolean;
};
