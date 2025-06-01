import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  companyName: text("company_name").notNull(),
  intrinsicValue: decimal("intrinsic_value", { precision: 10, scale: 2 }).notNull(),
  convictionScore: integer("conviction_score").notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// User storage table supporting multiple auth providers
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"), // For email signup
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").notNull().default("email"), // "email", "google", "replit"
  providerId: varchar("provider_id"), // External provider user ID
  emailVerified: boolean("email_verified").default(false),
  tier: varchar("tier").notNull().default("free"), // "free" or "pro"
  apiRequestsUsed: integer("api_requests_used").default(0),
  apiRequestsResetAt: timestamp("api_requests_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio holdings table - individual transactions
export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name"),
  shares: decimal("shares", { precision: 15, scale: 6 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStockSchema = createInsertSchema(stocks).pick({
  ticker: true,
  companyName: true,
  intrinsicValue: true,
  convictionScore: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).pick({
  stockId: true,
  price: true,
  changePercent: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  stockId: true,
  userId: true,
  content: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  purchaseDate: z.string().transform((val) => new Date(val)),
});

export const updatePortfolioHoldingSchema = createInsertSchema(portfolioHoldings).pick({
  ticker: true,
  companyName: true,
  shares: true,
  purchasePrice: true,
  notes: true,
}).partial();

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;

export interface StockWithLatestPrice extends Stock {
  currentPrice?: number;
  changePercent?: number;
  lastUpdated?: Date;
  marginOfSafety?: number;
}

export interface StockStats {
  totalWatched: number;
  undervalued: number;
  avgMarginOfSafety: number;
  highConviction: number;
}
