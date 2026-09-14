import { z } from "zod";
import { catalogue, findProduct } from "../shared/catalogue";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createOrder } from "./db";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalogue: publicProcedure.query(() => catalogue),
  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().trim().min(2).max(120),
          email: z.string().trim().email(),
          phone: z.string().trim().min(7).max(40),
          address: z.string().trim().min(8).max(800),
          notes: z.string().trim().max(800).optional(),
          paymentMethod: z.enum(["upi", "whatsapp"]),
          items: z.array(orderItemSchema).min(1).max(30),
        }),
      )
      .mutation(async ({ input }) => {
        const normalizedItems = input.items.map((item) => {
          const product = findProduct(item.productId);
          if (!product) throw new Error("One of the selected pieces is no longer available");
          return {
            productId: product.id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal: product.price * item.quantity,
          };
        });
        const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const orderNumber = `KN-${Date.now().toString(36).toUpperCase()}`;
        await createOrder({
          orderNumber,
          customerName: input.customerName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          notes: input.notes || null,
          items: JSON.stringify(normalizedItems),
          total,
          paymentMethod: input.paymentMethod,
          status: "new",
        });
        return { orderNumber, total, paymentMethod: input.paymentMethod };
      }),
  }),
});

export type AppRouter = typeof appRouter;
