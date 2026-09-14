import { z } from "zod";
import { catalogue, findProduct } from "../shared/catalogue";
import { getShippingQuote } from "../shared/shipping";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createOrder } from "./db";
import { sendOrderConfirmationEmail } from "./email";

const orderItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) });

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
      .input(z.object({
        customerName: z.string().trim().min(2).max(120),
        email: z.string().trim().email(),
        phone: z.string().trim().min(7).max(40),
        address: z.string().trim().min(8).max(800),
        pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
        notes: z.string().trim().max(800).optional(),
        paymentMethod: z.enum(["upi", "whatsapp"]),
        termsAccepted: z.literal(true),
        items: z.array(orderItemSchema).min(1).max(30),
      }))
      .mutation(async ({ input }) => {
        const normalizedItems = input.items.map((item) => {
          const product = findProduct(item.productId);
          if (!product) throw new Error("One of the selected pieces is no longer available");
          return { productId: product.id, name: product.name, quantity: item.quantity, unitPrice: product.price, lineTotal: product.price * item.quantity };
        });
        const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const quote = getShippingQuote(input.pinCode, subtotal);
        const orderNumber = `KN-${Date.now().toString(36).toUpperCase()}`;
        await createOrder({
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
        await sendOrderConfirmationEmail({ orderNumber, customerName: input.customerName, customerEmail: input.email, items: normalizedItems, quote, paymentMethod: input.paymentMethod });
        return { orderNumber, subtotal, shipping: quote.shipping, total: quote.total, paymentMethod: input.paymentMethod };
      }),
  }),
});

export type AppRouter = typeof appRouter;
