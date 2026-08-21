import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertNotification, InsertNotificationLog, InsertNotificationSetting, InsertUser, InsertTranscriptionRequest, notificationLogs, notificationSettings, notifications, transcriptionRequests, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createTranscriptionRequest(request: InsertTranscriptionRequest) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }
  const result = await db.insert(transcriptionRequests).values(request);
  return { id: Number(result[0].insertId) };
}

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(notifications).values(notification);
  return { id: Number(result[0].insertId) };
}

export async function createNotificationLog(log: InsertNotificationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(notificationLogs).values(log);
  return { id: Number(result[0].insertId) };
}

export async function listNotificationLogs(sessionKey: string, limit = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(notificationLogs).where(eq(notificationLogs.sessionKey, sessionKey)).orderBy(desc(notificationLogs.createdAt)).limit(Math.min(limit, 50));
}

export async function markNotificationLogRead(sessionKey: string, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.update(notificationLogs).set({ readAt: new Date() }).where(and(eq(notificationLogs.sessionKey, sessionKey), eq(notificationLogs.id, id)));
  return { success: Number(result[0]?.affectedRows ?? 0) > 0 } as const;
}

export async function clearNotificationLogs(sessionKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.delete(notificationLogs).where(eq(notificationLogs.sessionKey, sessionKey));
  return { success: Number(result[0]?.affectedRows ?? 0) > 0 } as const;
}

export async function listNotifications(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(Math.min(limit, 100));
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, id));
  return { success: true } as const;
}

export async function listTranscriptionRequests(filters: { query?: string; status?: "new" | "in_progress" | "completed"; limit?: number } = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [];
  const query = filters.query?.trim();
  if (query) conditions.push(or(like(transcriptionRequests.fileName, `%${query}%`), like(transcriptionRequests.service, `%${query}%`), like(transcriptionRequests.language, `%${query}%`)));
  if (filters.status) conditions.push(eq(transcriptionRequests.status, filters.status));
  return db.select().from(transcriptionRequests).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(transcriptionRequests.createdAt)).limit(Math.min(filters.limit ?? 200, 200));
}

export async function updateTranscriptionRequestStatus(id: number, status: "new" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(transcriptionRequests).set({ status }).where(eq(transcriptionRequests.id, id));
  return { success: true } as const;
}

export async function listNotificationSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(notificationSettings).orderBy(notificationSettings.eventKey);
}

export async function getNotificationSetting(eventKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(notificationSettings).where(eq(notificationSettings.eventKey, eventKey)).limit(1);
  return rows[0] ?? null;
}

export async function ensureDefaultNotificationSettings() {
  const defaults: InsertNotificationSetting[] = [
    { eventKey: "new_request", priority: 2, enabled: 1 },
    { eventKey: "upload_success", priority: 1, enabled: 1 },
    { eventKey: "upload_error", priority: 3, enabled: 1 },
  ];
  for (const setting of defaults) await upsertNotificationSetting(setting);
  return listNotificationSettings();
}

export async function upsertNotificationSetting(setting: InsertNotificationSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(notificationSettings).values(setting).onDuplicateKeyUpdate({
    set: { priority: setting.priority, enabled: setting.enabled },
  });
  return { success: true } as const;
}
