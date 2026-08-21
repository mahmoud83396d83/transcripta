import { describe, expect, it, vi } from "vitest";

const fakeDb = vi.hoisted(() => ({ update: vi.fn(), delete: vi.fn() }));
const predicates = vi.hoisted(() => ({ eq: vi.fn((column: unknown, value: unknown) => ({ op: "eq", column, value })), and: vi.fn((...parts: unknown[]) => ({ op: "and", parts })) }));

vi.mock("drizzle-orm/mysql2", () => ({ drizzle: vi.fn(() => fakeDb) }));
vi.mock("drizzle-orm", () => ({
  and: predicates.and,
  desc: vi.fn(),
  eq: predicates.eq,
  like: vi.fn(),
  or: vi.fn(),
}));

import { notificationLogs } from "../drizzle/schema";
import { clearNotificationLogs, markNotificationLogRead } from "./db";

describe("notification log database isolation", () => {
  it("updates only the requested session and notification id", async () => {
    const where = vi.fn().mockResolvedValue([{ affectedRows: 0 }]);
    const set = vi.fn(() => ({ where }));
    fakeDb.update.mockReturnValue({ set });

    await expect(markNotificationLogRead("session-a", 99)).resolves.toEqual({ success: false });
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ readAt: expect.any(Date) }));
    expect(predicates.and).toHaveBeenCalledWith(
      { op: "eq", column: notificationLogs.sessionKey, value: "session-a" },
      { op: "eq", column: notificationLogs.id, value: 99 },
    );
  });

  it("does not report deletion when the session has no matching rows", async () => {
    const where = vi.fn().mockResolvedValue([{ affectedRows: 0 }]);
    fakeDb.delete.mockReturnValue({ where });

    await expect(clearNotificationLogs("session-b")).resolves.toEqual({ success: false });
    expect(where).toHaveBeenCalledWith({ op: "eq", column: notificationLogs.sessionKey, value: "session-b" });
  });
});
