export type NotificationPrioritySetting = {
  priority: number;
  enabled: number | boolean;
};

export function isNotificationImportant(
  setting: NotificationPrioritySetting | null | undefined,
  fallback: boolean,
) {
  if (!setting) return fallback;
  return Boolean(setting.enabled) && setting.priority >= 2;
}
