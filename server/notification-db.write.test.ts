import { describe, expect, it, vi } from "vitest";

const fakeDb = vi.hoisted(() => ({
  insert: vi.fn(),
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => fakeDb),
}));

import { createNotification, upsertNotificationSetting } from "./db";

describe("notification database writes", () => {
  it("writes an enabled priority setting with an upsert", async () => {
    const onDuplicateKeyUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn(() => ({ onDuplicateKeyUpdate }));
    fakeDb.insert.mockReturnValue({ values });

    await expect(upsertNotificationSetting({
      eventKey: "upload_error",
      priority: 3,
      enabled: 1,
    })).resolves.toEqual({ success: true });

    expect(values).toHaveBeenCalledWith({ eventKey: "upload_error", priority: 3, enabled: 1 });
    expect(onDuplicateKeyUpdate).toHaveBeenCalledWith({ set: { priority: 3, enabled: 1 } });
  });

  it("creates a persistent notification and returns its id", async () => {
    const values = vi.fn().mockResolvedValue([{ insertId: 77 }]);
    fakeDb.insert.mockReturnValue({ values });

    await expect(createNotification({
      title: "New request",
      content: "sample.mp3",
      kind: "info",
      priority: 2,
    })).resolves.toEqual({ id: 77 });

    expect(values).toHaveBeenCalledWith({
      title: "New request",
      content: "sample.mp3",
      kind: "info",
      priority: 2,
    });
  });
});
