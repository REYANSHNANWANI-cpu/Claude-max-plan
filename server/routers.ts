import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createInquiry } from "./db";

const inquiryInput = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(40),
  projectDescription: z.string().trim().min(20).max(2000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  inquiries: router({
    submit: publicProcedure.input(inquiryInput).mutation(async ({ input }) => {
      await createInquiry(input);
      await notifyOwner({
        title: `New project inquiry from ${input.name}`,
        content: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\n\nProject brief:\n${input.projectDescription}`,
      });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
