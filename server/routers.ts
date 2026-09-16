import { randomUUID } from "node:crypto";
import { z } from "zod";
import { catalogue, findProduct } from "../shared/catalogue";
import { getShippingQuote } from "../shared/shipping";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { enforceRateLimit, requestIdentity } from "./_core/security";
import { TRPCError } from "@trpc/server";
import { createOrder, getOrdersForUser } from "./db";
import { sendOrderConfirmationEmail } from "./email";

const safeText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform(value => value.replace(/[\u0000-\u001f\u007f]/g, ""));
const orderItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/i)
    .max(80),
  quantity: z.number().int().min(1).max(20),
});

function createOrderNumber() {
  return `KN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

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
  catalogue: publicProcedure.query(() => catalogue),
  orders: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const orders = await getOrdersForUser(ctx.user.id);
      return orders.map(order => ({
        ...order,
        items: order.items,
      }));
    }),
    create: publicProcedure
      .input(
        z.object({
          customerName: safeText(2, 120),
          email: z.string().trim().toLowerCase().email().max(320),
          phone: safeText(7, 40),
          address: safeText(8, 800),
          pinCode: z
            .string()
            .regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
          notes: safeText(0, 800).optional(),
          paymentMethod: z.enum(["upi", "whatsapp"]),
          termsAccepted: z.literal(true),
          items: z.array(orderItemSchema).min(1).max(30),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const limit = enforceRateLimit(
          "orders",
          requestIdentity(ctx.req),
          10,
          10 * 60 * 1000
        );
        if (!limit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many order attempts. Please try again later.",
          });
        }
        const normalizedItems = input.items.map(item => {
          const product = findProduct(item.productId);
          if (!product)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "One of the selected pieces is no longer available",
            });
          return {
            productId: product.id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal: product.price * item.quantity,
          };
        });
        const subtotal = normalizedItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0
        );
        const quote = getShippingQuote(input.pinCode, subtotal);
        const orderNumber = createOrderNumber();
        await createOrder({
          userId: ctx.user?.id ?? null,
          orderNumber,
          customerName: input.customerName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          pinCode: input.pinCode,
          notes: input.notes || null,
          items: JSON.stringify(normalizedItems),
          subtotal,
          shipping: quote.shipping,
          total: quote.total,
          paymentMethod: input.paymentMethod,
          policyVersion: "2026-09-14",
          termsAcceptedAt: new Date(),
          status: "new",
        });
        await sendOrderConfirmationEmail({
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.email,
          items: normalizedItems,
          quote,
          paymentMethod: input.paymentMethod,
        });
        return {
          orderNumber,
          subtotal,
          shipping: quote.shipping,
          total: quote.total,
          paymentMethod: input.paymentMethod,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
