import { describe, expect, it } from "vitest";
import { isNotificationImportant } from "@shared/notifications";

describe("notification priority policy", () => {
  it("uses the configured priority when the event is enabled", () => {
    expect(isNotificationImportant({ enabled: 1, priority: 3 }, false)).toBe(true);
    expect(isNotificationImportant({ enabled: true, priority: 1 }, true)).toBe(false);
  });

  it("does not play an important sound for disabled events", () => {
    expect(isNotificationImportant({ enabled: 0, priority: 3 }, true)).toBe(false);
  });

  it("preserves the local fallback when no setting exists", () => {
    expect(isNotificationImportant(undefined, true)).toBe(true);
    expect(isNotificationImportant(null, false)).toBe(false);
  });
});
