import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
    customerName: varchar("customerName", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    address: text("address").notNull(),
    pinCode: varchar("pinCode", { length: 6 }).notNull(),
    notes: text("notes"),
    items: text("items").notNull(),
    subtotal: int("subtotal").notNull(),
    shipping: int("shipping").notNull(),
    total: int("total").notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["upi", "whatsapp"]).notNull(),
    policyVersion: varchar("policyVersion", { length: 32 })
      .notNull()
      .default("2026-09-14"),
    termsAcceptedAt: timestamp("termsAcceptedAt").notNull(),
    status: mysqlEnum("status", ["new", "confirmed", "fulfilled", "cancelled"])
      .default("new")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("orders_user_id_idx").on(table.userId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
