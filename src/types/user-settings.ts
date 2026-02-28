export type UserSettingsBody = {
  currency: string;
  language: string;
  timezone: string;
};

export type UserSettingsResponse = {
  id: number;
  userId: number;
  currency: string;
  language: string;
  timezone: string;
};
