import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  ensureDefaultNotificationSettings: vi.fn(),
  listNotifications: vi.fn(),
  listTranscriptionRequests: vi.fn(),
  updateTranscriptionRequestStatus: vi.fn(),
  markNotificationRead: vi.fn(),
  upsertNotificationSetting: vi.fn(),
}));

vi.mock("./db", () => ({
  createNotification: vi.fn(),
  createTranscriptionRequest: vi.fn(),
  ensureDefaultNotificationSettings: dbMocks.ensureDefaultNotificationSettings,
  getNotificationSetting: vi.fn(),
  listNotifications: dbMocks.listNotifications,
  listTranscriptionRequests: dbMocks.listTranscriptionRequests,
  updateTranscriptionRequestStatus: dbMocks.updateTranscriptionRequestStatus,
  markNotificationRead: dbMocks.markNotificationRead,
  upsertNotificationSetting: dbMocks.upsertNotificationSetting,
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type User = NonNullable<TrpcContext["user"]>;

const adminUser: User = {
  id: 1,
  openId: "owner",
  email: "owner@example.com",
  name: "Owner",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function adminContext(): TrpcContext {
  return {
    user: adminUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin notification procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.ensureDefaultNotificationSettings.mockResolvedValue([
      { eventKey: "new_request", priority: 2, enabled: 1 },
    ]);
    dbMocks.listNotifications.mockResolvedValue([{ id: 9, title: "New request" }]);
  dbMocks.listTranscriptionRequests.mockResolvedValue([{ id: 4, fileName: "sample.mp3", status: "new" }]);
  dbMocks.updateTranscriptionRequestStatus.mockResolvedValue({ success: true });
  dbMocks.markNotificationRead.mockResolvedValue({ success: true });
    dbMocks.upsertNotificationSetting.mockResolvedValue({ success: true });
  });

  it("reads requests, notifications, and initialized settings", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.requests()).resolves.toEqual([{ id: 4, fileName: "sample.mp3", status: "new" }]);
    await expect(caller.admin.requests({ query: "sample", status: "new" })).resolves.toEqual([{ id: 4, fileName: "sample.mp3", status: "new" }]);
    await expect(caller.admin.notifications()).resolves.toEqual([{ id: 9, title: "New request" }]);
    await expect(caller.admin.notificationSettings()).resolves.toEqual([
      { eventKey: "new_request", priority: 2, enabled: 1 },
    ]);
  });

  it("updates request status", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.updateRequestStatus({ id: 4, status: "in_progress" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateTranscriptionRequestStatus).toHaveBeenCalledWith(4, "in_progress");
  });

  it("marks a notification read and updates its priority", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.markNotificationRead({ id: 9 })).resolves.toEqual({ success: true });
    await expect(caller.admin.updateNotificationSetting({
      eventKey: "upload_error",
      priority: 3,
      enabled: false,
    })).resolves.toEqual({ success: true });
    expect(dbMocks.markNotificationRead).toHaveBeenCalledWith(9);
    expect(dbMocks.upsertNotificationSetting).toHaveBeenCalledWith({
      eventKey: "upload_error",
      priority: 3,
      enabled: 0,
    });
  });
});
