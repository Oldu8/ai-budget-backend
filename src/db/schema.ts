import {
  type AnyPgColumn,
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);

export const messageStatusEnum = pgEnum("message_status", ["pending", "processed", "error"]);

export const planTypeEnum = pgEnum("plan_type", ["free", "basic", "standard", "premium"]);

// ── 1. Users ──

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(),
  paymentCustomerId: text("payment_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── 2. User Settings ──

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  currency: text("currency").notNull(),
  language: text("language").notNull(),
  timezone: text("timezone").notNull(),
});

// ── 3. Statuses (lookup table for payments & subscriptions) ──

export const statuses = pgTable("statuses", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  label: text("label").notNull(),
});

// ── 4. Categories (self-referencing hierarchy) ──

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references((): AnyPgColumn => categories.id),
  label: text("label").notNull(),
  visibilityTag: text("visibility_tag"),
});

// ── 5. User Category Settings ──

export const userCategorySettings = pgTable(
  "user_category_settings",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.userId, t.categoryId] })]
);

// ── 6. Chats ──

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});

// ── 7. Messages ──

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  text: text("text"),
  imgPath: text("img_path"),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chats.id),
  status: messageStatusEnum("status").notNull().default("pending"),
});

// ── 8. Transactions ──

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  messageId: integer("message_id").references(() => messages.id),
  type: transactionTypeEnum("type").notNull(),
  rawAiData: jsonb("raw_ai_data"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── 9. Plans ──

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  type: planTypeEnum("type").notNull(),
  paymentPriceId: text("payment_price_id").notNull(),
  price: integer("price").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  checkLimit: integer("check_limit").notNull(),
});

// ── 10. User Subscriptions ──

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id),
  paymentSubscriptionId: text("payment_subscription_id"),
  statusId: integer("status_id")
    .notNull()
    .references(() => statuses.id),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  usedChecksCount: integer("used_checks_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── 11. Payments ──

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  currency: text("currency").notNull(),
  paymentInvoiceId: text("payment_invoice_id"),
  statusId: integer("status_id")
    .notNull()
    .references(() => statuses.id),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
