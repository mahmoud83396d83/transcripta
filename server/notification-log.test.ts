import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  clearNotificationLogs: vi.fn(),
  createNotificationLog: vi.fn(),
  listNotificationLogs: vi.fn(),
  markNotificationLogRead: vi.fn(),
}));

vi.mock("./db", () => ({
  clearNotificationLogs: dbMocks.clearNotificationLogs,
  createNotificationLog: dbMocks.createNotificationLog,
  listNotificationLogs: dbMocks.listNotificationLogs,
  markNotificationLogRead: dbMocks.markNotificationLogRead,
  createNotification: vi.fn(),
  createTranscriptionRequest: vi.fn(),
  ensureDefaultNotificationSettings: vi.fn(),
  getNotificationSetting: vi.fn(),
  listNotifications: vi.fn(),
  listTranscriptionRequests: vi.fn(),
  markNotificationRead: vi.fn(),
  updateTranscriptionRequestStatus: vi.fn(),
  upsertNotificationSetting: vi.fn(),
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(sessionKey = "session-key-123456"): TrpcContext {
  return { user: null, notificationSessionKey: sessionKey, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("persistent notification log procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listNotificationLogs.mockResolvedValue([{ id: 12, sessionKey: "session-key-123456", title: "Saved", content: "Done", kind: "success", important: 1, readAt: null }]);
    dbMocks.createNotificationLog.mockResolvedValue({ id: 12 });
    dbMocks.markNotificationLogRead.mockResolvedValue({ success: true });
    dbMocks.clearNotificationLogs.mockResolvedValue({ success: true });
  });

  it("lists and creates logs for a valid session key", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.notificationLog.list()).resolves.toHaveLength(1);
    await expect(caller.notificationLog.create({ title: "Saved", content: "Done", kind: "success", important: true })).resolves.toEqual({ id: 12 });
    expect(dbMocks.createNotificationLog).toHaveBeenCalledWith({ sessionKey: "session-key-123456", title: "Saved", content: "Done", kind: "success", important: 1 });
  });

  it("ignores a client-supplied session key and isolates different sessions", async () => {
    const first = appRouter.createCaller(publicContext("session-a-123456789"));
    const second = appRouter.createCaller(publicContext("session-b-123456789"));
    await first.notificationLog.list({ sessionKey: "session-b-123456789" } as never);
    await second.notificationLog.list();
    expect(dbMocks.listNotificationLogs).toHaveBeenNthCalledWith(1, "session-a-123456789");
    expect(dbMocks.listNotificationLogs).toHaveBeenNthCalledWith(2, "session-b-123456789");
  });

  it("returns no-op results when a foreign session has no matching record", async () => {
    dbMocks.markNotificationLogRead.mockResolvedValue({ success: false });
    dbMocks.clearNotificationLogs.mockResolvedValue({ success: false });
    const caller = appRouter.createCaller(publicContext("session-a-123456789"));
    await expect(caller.notificationLog.markRead({ id: 99 })).resolves.toEqual({ success: false });
    await expect(caller.notificationLog.clear()).resolves.toEqual({ success: false });
    expect(dbMocks.markNotificationLogRead).toHaveBeenCalledWith("session-a-123456789", 99);
    expect(dbMocks.clearNotificationLogs).toHaveBeenCalledWith("session-a-123456789");
  });

  it("scopes read and clear actions to the same session key", async () => {
    const caller = appRouter.createCaller(publicContext());
    await caller.notificationLog.markRead({ id: 12 });
    await caller.notificationLog.clear();
    expect(dbMocks.markNotificationLogRead).toHaveBeenCalledWith("session-key-123456", 12);
    expect(dbMocks.clearNotificationLogs).toHaveBeenCalledWith("session-key-123456");
  });
});
