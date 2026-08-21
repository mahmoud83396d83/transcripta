import { describe, expect, it } from "vitest";
import { ensureDefaultNotificationSettings, getNotificationSetting } from "./db";

describe("notification database helpers", () => {
  it("reads the configured new-request notification setting", async () => {
    const setting = await getNotificationSetting("new_request");
    expect(setting).toMatchObject({
      eventKey: "new_request",
      priority: expect.any(Number),
      enabled: expect.any(Number),
    });
  });

  it("initializes and returns the supported default notification settings", async () => {
    const settings = await ensureDefaultNotificationSettings();
    const keys = settings.map((setting) => setting.eventKey);
    expect(keys).toEqual(expect.arrayContaining(["new_request", "upload_success", "upload_error"]));
  });
});
