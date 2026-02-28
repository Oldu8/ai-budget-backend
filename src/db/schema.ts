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
  unique,
  index,
} from "drizzle-orm/pg-core";

export const transactionCreatedByEnum = pgEnum("transaction_created_by", ["user", "ai"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const planTypeEnum = pgEnum("plan_type", ["free", "basic", "standard", "premium"]);

// ── 1. Users ──

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseUserId: text("supabase_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  emailConfirmed: boolean("email_confirmed").default(false).notNull(),
  paymentCustomerId: text("payment_customer_id"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── 2. User Settings ──

export const userSettings = pgTable(
  "user_settings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    currency: text("currency").notNull(),
    language: text("language").notNull(),
    timezone: text("timezone").notNull(),
  },
  (t) => ({
    userUnique: unique().on(t.userId),
  })
);

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

// ── 7. Transactions ──

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    amount: integer("amount").notNull(),
    date: date("date").notNull(),
    type: transactionTypeEnum("type").notNull(),
    createdBy: transactionCreatedByEnum("created_by").notNull(),
    rawAiData: jsonb("raw_ai_data"),
    confirmedAt: timestamp("confirmed_at"),
    imgPath: text("img_path"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userDateIdx: index("transactions_user_date_idx").on(t.userId, t.date),
    userCategoryDateIdx: index("transactions_user_category_date_idx").on(
      t.userId,
      t.categoryId,
      t.date
    ),
  })
);

// ── 9. Plans ──

export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    type: planTypeEnum("type").notNull(),
    paymentPriceId: text("payment_price_id").notNull(),
    price: integer("price").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    checkLimit: integer("check_limit").notNull(),
  },
  (t) => ({
    typeUnique: unique().on(t.type),
  })
);

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
