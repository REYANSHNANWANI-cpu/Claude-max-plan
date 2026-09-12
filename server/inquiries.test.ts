import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("inquiries.submit", () => {
  it("rejects incomplete project briefs before touching persistence", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.inquiries.submit({
      name: "R",
      email: "not-an-email",
      phone: "1",
      projectDescription: "Too short",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects project briefs shorter than 20 characters", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.inquiries.submit({
      name: "Reyansh",
      email: "client@example.com",
      phone: "+91 98765 43210",
      projectDescription: "Need a site",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
