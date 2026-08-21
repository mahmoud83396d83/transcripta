import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type User = NonNullable<TrpcContext["user"]>;

function context(user: User | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const regularUser: User = {
  id: 2,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("admin access control", () => {
  it("rejects a regular authenticated user before reading admin data", async () => {
    const caller = appRouter.createCaller(context(regularUser));
    await expect(caller.admin.notifications()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an unauthenticated visitor", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.admin.requests()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
