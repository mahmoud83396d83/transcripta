import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { clearNotificationLogs, createNotification, createNotificationLog, createTranscriptionRequest, ensureDefaultNotificationSettings, getNotificationSetting, listNotificationLogs, listNotifications, listTranscriptionRequests, markNotificationLogRead, markNotificationRead, updateTranscriptionRequestStatus, upsertNotificationSetting } from "./db";
import { notifyOwner } from "./_core/notification";

function requireNotificationSessionKey(value: string | undefined) {
  if (!value) throw new Error("Notification session is not initialized");
  return value;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  requestQuote: router({
    create: publicProcedure.input(z.object({
      fileKey: z.string().min(1).max(255),
      fileUrl: z.string().min(1).max(512),
      fileName: z.string().min(1).max(255),
      contentType: z.string().min(1).max(120),
      fileSize: z.number().int().positive().max(50 * 1024 * 1024),
      durationSeconds: z.number().int().nonnegative().optional(),
      service: z.string().max(40).optional(),
      language: z.string().max(80).optional(),
      speakers: z.number().int().positive().max(100).optional(),
      estimatedPrice: z.number().int().nonnegative().optional(),
    })).mutation(async ({ input }) => {
      const request = await createTranscriptionRequest(input);
      const notificationSetting = await getNotificationSetting("new_request");
      let persistentNotification = false;
      try {
        await createNotification({
          requestId: request.id,
          title: `طلب تفريغ جديد — ${input.fileName}`,
          content: `ملف جديد بحجم ${input.fileSize} بايت${input.service ? `، الخدمة: ${input.service}` : ""}${input.language ? `، اللغة: ${input.language}` : ""}.`,
          kind: "info",
          priority: notificationSetting?.priority ?? 2,
        });
        persistentNotification = true;
      } catch (error) {
        console.warn("[RequestQuote] Persistent notification unavailable:", error);
      }
      let ownerNotified = false;
      try {
        ownerNotified = await notifyOwner({
          title: `New Transcripta request: ${input.fileName}`,
          content: [
            `File: ${input.fileName}`,
            `Size: ${input.fileSize} bytes`,
            input.durationSeconds ? `Duration: ${input.durationSeconds}s` : undefined,
            input.service ? `Service: ${input.service}` : undefined,
            input.language ? `Language: ${input.language}` : undefined,
            input.speakers ? `Speakers: ${input.speakers}` : undefined,
            input.estimatedPrice ? `Estimated price: EGP ${input.estimatedPrice}` : undefined,
          ].filter(Boolean).join("\\n"),
        });
      } catch (error) {
        console.warn("[RequestQuote] Owner notification unavailable:", error);
      }
      return { ...request, ownerNotified, persistentNotification };
    }),
  }),
  notificationConfig: publicProcedure.query(() => ensureDefaultNotificationSettings()),
  notificationLog: router({
    list: publicProcedure.query(({ ctx }) => listNotificationLogs(requireNotificationSessionKey(ctx.notificationSessionKey))),
    create: publicProcedure.input(z.object({ title: z.string().min(1).max(180), content: z.string().min(1).max(2000), kind: z.enum(["info", "success", "error"]), important: z.boolean().optional() })).mutation(({ ctx, input }) => createNotificationLog({ ...input, sessionKey: requireNotificationSessionKey(ctx.notificationSessionKey), important: input.important ? 1 : 0 })),
    markRead: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => markNotificationLogRead(requireNotificationSessionKey(ctx.notificationSessionKey), input.id)),
    clear: publicProcedure.mutation(({ ctx }) => clearNotificationLogs(requireNotificationSessionKey(ctx.notificationSessionKey))),
  }),
  admin: router({
    requests: adminProcedure.input(z.object({ query: z.string().max(120).optional(), status: z.enum(["new", "in_progress", "completed"]).optional() }).optional()).query(({ input }) => listTranscriptionRequests(input ?? {})),
    updateRequestStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "in_progress", "completed"]) })).mutation(({ input }) => updateTranscriptionRequestStatus(input.id, input.status)),
    notifications: adminProcedure.query(() => listNotifications()),
    markNotificationRead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => markNotificationRead(input.id)),
    notificationSettings: adminProcedure.query(() => ensureDefaultNotificationSettings()),
    updateNotificationSetting: adminProcedure.input(z.object({
      eventKey: z.string().min(1).max(80),
      priority: z.number().int().min(0).max(3),
      enabled: z.boolean(),
    })).mutation(({ input }) => upsertNotificationSetting({ eventKey: input.eventKey, priority: input.priority, enabled: input.enabled ? 1 : 0 })),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
