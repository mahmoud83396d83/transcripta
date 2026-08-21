import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { randomUUID } from "node:crypto";
import { parse } from "cookie";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";

export const NOTIFICATION_SESSION_COOKIE = "__Host-transcripta_notification";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  notificationSessionKey?: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const cookies = parse(opts.req.headers.cookie ?? "");
  const notificationSessionKey = cookies[NOTIFICATION_SESSION_COOKIE] ?? randomUUID();
  if (!cookies[NOTIFICATION_SESSION_COOKIE]) {
    opts.res.cookie(NOTIFICATION_SESSION_COOKIE, notificationSessionKey, { ...getSessionCookieOptions(opts.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    notificationSessionKey,
  };
}
