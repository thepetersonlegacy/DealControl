import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  format: text("format").notNull(),
  imageUrl: text("image_url").notNull(),
  price: integer("price").notNull(),
  isFeatured: integer("is_featured").notNull().default(0),
  assetType: text("asset_type").default("checklist"),
  tier: text("tier").default("individual"),
  priceSolo: integer("price_solo").default(12900),
  pricePro: integer("price_pro").default(21900),
  priceOffice: integer("price_office").default(69900),
  purposeScope: text("purpose_scope"),
  useConditions: text("use_conditions"),
  risksAddressed: text("risks_addressed"),
  coreContent: text("core_content"),
  failurePoints: text("failure_points"),
  recordkeepingGuidance: text("recordkeeping_guidance"),
  judgmentBoundary: text("judgment_boundary"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local auth and Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"),
  isAdmin: integer("is_admin").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schemas for local auth
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ClickFunnels-style funnel tables
export const funnels = pgTable("funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  entryProductId: varchar("entry_product_id").references(() => products.id),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFunnelSchema = createInsertSchema(funnels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFunnel = z.infer<typeof insertFunnelSchema>;
export type Funnel = typeof funnels.$inferSelect;

export const funnelSteps = pgTable("funnel_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  funnelId: varchar("funnel_id").notNull().references(() => funnels.id),
  stepType: text("step_type").notNull(), // 'upsell', 'downsell', 'oto', 'order_bump'
  offerProductId: varchar("offer_product_id").notNull().references(() => products.id),
  priority: integer("priority").notNull().default(0),
  priceOverride: integer("price_override"),
  headline: text("headline"),
  subheadline: text("subheadline"),
  ctaText: text("cta_text"),
  declineText: text("decline_text"),
  timerSeconds: integer("timer_seconds"),
  isActive: integer("is_active").notNull().default(1),
});

export const insertFunnelStepSchema = createInsertSchema(funnelSteps).omit({
  id: true,
});

export type InsertFunnelStep = z.infer<typeof insertFunnelStepSchema>;
export type FunnelStep = typeof funnelSteps.$inferSelect;

export const orderBumps = pgTable("order_bumps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  bumpProductId: varchar("bump_product_id").notNull().references(() => products.id),
  bumpPrice: integer("bump_price").notNull(),
  headline: text("headline"),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
});

export const insertOrderBumpSchema = createInsertSchema(orderBumps).omit({
  id: true,
});

export type InsertOrderBump = z.infer<typeof insertOrderBumpSchema>;
export type OrderBump = typeof orderBumps.$inferSelect;

export const funnelSessions = pgTable("funnel_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  funnelId: varchar("funnel_id").notNull().references(() => funnels.id),
  entryPurchaseId: varchar("entry_purchase_id"), // FK managed at app level to avoid circular dependency
  currentStepIndex: integer("current_step_index").notNull().default(0),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'abandoned'
  acceptedSteps: text("accepted_steps").array(),
  declinedSteps: text("declined_steps").array(),
  totalRevenue: integer("total_revenue").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertFunnelSessionSchema = createInsertSchema(funnelSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertFunnelSession = z.infer<typeof insertFunnelSessionSchema>;
export type FunnelSession = typeof funnelSessions.$inferSelect;

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable for guest checkout
  productId: varchar("product_id").notNull().references(() => products.id),
  amount: integer("amount").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  purchasedAt: integer("purchased_at").notNull().default(sql`extract(epoch from now())`),
  funnelSessionId: varchar("funnel_session_id").references(() => funnelSessions.id),
  funnelStepId: varchar("funnel_step_id").references(() => funnelSteps.id),
  isOrderBump: integer("is_order_bump").notNull().default(0),
  parentPurchaseId: varchar("parent_purchase_id"), // Self-reference FK managed at app level
  guestEmail: varchar("guest_email", { length: 255 }), // For guest checkout tracking
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchasedAt: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").notNull().references(() => purchases.id),
  downloadedAt: integer("downloaded_at").notNull().default(sql`extract(epoch from now())`),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// Email subscribers table
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: integer("is_active").default(1),
  source: varchar("source", { length: 50 }),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  subscribedAt: true,
}).extend({
  isActive: z.number().optional(),
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// Email logs table (track sent emails)
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id").references(() => subscribers.id),
  userId: varchar("user_id", { length: 255 }),
  emailType: varchar("email_type", { length: 50 }).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"),
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
}).extend({
  status: z.string().optional(),
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// Access tokens for download portal (Elite Tier)
export const accessTokens = pgTable("access_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token", { length: 64 }).notNull().unique(),
  purchaseId: varchar("purchase_id").notNull().references(() => purchases.id),
  userId: varchar("user_id").references(() => users.id),
  licenseType: text("license_type").notNull().default("solo"), // 'solo', 'pro', 'office'
  createdAt: timestamp("created_at").defaultNow(),
  firstAccessAt: timestamp("first_access_at"),
  revokedAt: timestamp("revoked_at"),
  expiresAt: timestamp("expires_at"), // For Office annual licenses
});

export const insertAccessTokenSchema = createInsertSchema(accessTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertAccessToken = z.infer<typeof insertAccessTokenSchema>;
export type AccessToken = typeof accessTokens.$inferSelect;

// Download events for access logging (Elite Tier chargeback protection)
export const downloadEvents = pgTable("download_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").notNull().references(() => purchases.id),
  tokenId: varchar("token_id").references(() => accessTokens.id),
  eventType: text("event_type").notNull(), // 'ACCESS', 'DOWNLOAD'
  fileKey: text("file_key"),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadEventSchema = createInsertSchema(downloadEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertDownloadEvent = z.infer<typeof insertDownloadEventSchema>;
export type DownloadEvent = typeof downloadEvents.$inferSelect;

// UTM tracking for attribution (Elite Tier)
export const utmTracking = pgTable("utm_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: varchar("token_id").references(() => accessTokens.id),
  purchaseId: varchar("purchase_id").references(() => purchases.id),
  source: varchar("source", { length: 100 }),
  medium: varchar("medium", { length: 100 }),
  campaign: varchar("campaign", { length: 100 }),
  content: varchar("content", { length: 255 }),
  term: varchar("term", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUtmTrackingSchema = createInsertSchema(utmTracking).omit({
  id: true,
  createdAt: true,
});

export type InsertUtmTracking = z.infer<typeof insertUtmTrackingSchema>;
export type UtmTracking = typeof utmTracking.$inferSelect;
