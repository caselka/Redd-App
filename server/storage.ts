import { 
  stocks, 
  priceHistory, 
  notes, 
  users,
  portfolioHoldings,
  type Stock, 
  type InsertStock, 
  type PriceHistory, 
  type InsertPriceHistory, 
  type Note, 
  type InsertNote, 
  type User,
  type UpsertUser,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type StockWithLatestPrice, 
  type StockStats 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Stock operations
  getStock(id: number): Promise<Stock | undefined>;
  getStockByTicker(ticker: string): Promise<Stock | undefined>;
  getAllStocks(): Promise<Stock[]>;
  getStocksWithLatestPrices(): Promise<StockWithLatestPrice[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, updates: Partial<InsertStock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;
  
  // Price history operations
  createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory>;
  getLatestPrice(stockId: number): Promise<PriceHistory | undefined>;
  getPriceHistory(stockId: number, limit?: number): Promise<PriceHistory[]>;
  
  // Notes operations
  createNote(note: InsertNote): Promise<Note>;
  getNotesByStock(stockId: number): Promise<Note[]>;
  getRecentNotes(limit?: number): Promise<(Note & { ticker: string; companyName: string })[]>;
  deleteNote(id: number): Promise<boolean>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Portfolio operations
  getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, updates: any): Promise<PortfolioHolding | undefined>;
  deletePortfolioHolding(id: number): Promise<boolean>;
  
  // Statistics
  getStockStats(): Promise<StockStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.provider, provider),
        eq(users.providerId, providerId)
      )
    );
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Portfolio operations
  async getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]> {
    return await db.select().from(portfolioHoldings)
      .where(eq(portfolioHoldings.userId, userId))
      .orderBy(portfolioHoldings.ticker, portfolioHoldings.purchaseDate);
  }

  async createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [newHolding] = await db
      .insert(portfolioHoldings)
      .values(holding)
      .returning();
    return newHolding;
  }

  async updatePortfolioHolding(id: number, updates: any): Promise<PortfolioHolding | undefined> {
    const [updated] = await db
      .update(portfolioHoldings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioHoldings.id, id))
      .returning();
    return updated;
  }

  async deletePortfolioHolding(id: number): Promise<boolean> {
    const result = await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Stock operations
  async getStock(id: number): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }

  async getStockByTicker(ticker: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.ticker, ticker));
    return stock;
  }

  async getAllStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }

  async getStocksWithLatestPrices(): Promise<StockWithLatestPrice[]> {
    const stocksArray = await db.select().from(stocks);
    const result: StockWithLatestPrice[] = [];

    for (const stock of stocksArray) {
      const latestPrice = await this.getLatestPrice(stock.id);
      const stockWithPrice: StockWithLatestPrice = {
        ...stock,
        currentPrice: latestPrice ? parseFloat(latestPrice.price) : undefined,
        changePercent: latestPrice ? parseFloat(latestPrice.changePercent || "0") : undefined,
        lastUpdated: latestPrice?.timestamp,
      };

      // Calculate margin of safety
      if (stockWithPrice.currentPrice) {
        const intrinsicValue = parseFloat(stock.intrinsicValue);
        const marginOfSafety = ((intrinsicValue - stockWithPrice.currentPrice) / intrinsicValue) * 100;
        stockWithPrice.marginOfSafety = marginOfSafety;
      }

      result.push(stockWithPrice);
    }

    return result;
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const [stock] = await db.insert(stocks).values(insertStock).returning();
    return stock;
  }

  async updateStock(id: number, updates: Partial<InsertStock>): Promise<Stock | undefined> {
    const [updated] = await db
      .update(stocks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stocks.id, id))
      .returning();
    return updated;
  }

  async deleteStock(id: number): Promise<boolean> {
    try {
      // Delete related data first to avoid foreign key constraints
      await db.delete(notes).where(eq(notes.stockId, id));
      await db.delete(priceHistory).where(eq(priceHistory.stockId, id));
      
      // Then delete the stock
      const result = await db.delete(stocks).where(eq(stocks.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting stock:", error);
      return false;
    }
  }

  // Price history operations
  async createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory> {
    const [price] = await db.insert(priceHistory).values(priceData).returning();
    return price;
  }

  async getLatestPrice(stockId: number): Promise<PriceHistory | undefined> {
    const [latest] = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.stockId, stockId))
      .orderBy(desc(priceHistory.timestamp))
      .limit(1);
    return latest;
  }

  async getPriceHistory(stockId: number, limit: number = 50): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.stockId, stockId))
      .orderBy(desc(priceHistory.timestamp))
      .limit(limit);
  }

  // Notes operations
  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async getNotesByStock(stockId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.stockId, stockId))
      .orderBy(desc(notes.createdAt));
  }

  async getRecentNotes(limit: number = 10): Promise<(Note & { ticker: string; companyName: string })[]> {
    const result = await db
      .select({
        id: notes.id,
        stockId: notes.stockId,
        userId: notes.userId,
        content: notes.content,
        createdAt: notes.createdAt,
        ticker: stocks.ticker,
        companyName: stocks.companyName,
      })
      .from(notes)
      .innerJoin(stocks, eq(notes.stockId, stocks.id))
      .orderBy(desc(notes.createdAt))
      .limit(limit);
    return result;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Statistics
  async getStockStats(): Promise<StockStats> {
    const stocksArray = await db.select().from(stocks);
    const totalWatched = stocksArray.length;
    
    let undervalued = 0;
    let totalMarginOfSafety = 0;
    let stocksWithPrices = 0;
    let highConviction = 0;

    for (const stock of stocksArray) {
      if (stock.convictionScore >= 4) {
        highConviction++;
      }

      const latestPrice = await this.getLatestPrice(stock.id);
      if (latestPrice) {
        const currentPrice = parseFloat(latestPrice.price);
        const intrinsicValue = parseFloat(stock.intrinsicValue);
        const marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
        
        totalMarginOfSafety += marginOfSafety;
        stocksWithPrices++;
        
        if (marginOfSafety > 0) {
          undervalued++;
        }
      }
    }

    return {
      totalWatched,
      undervalued,
      avgMarginOfSafety: stocksWithPrices > 0 ? totalMarginOfSafety / stocksWithPrices : 0,
      highConviction,
    };
  }
}

export const storage = new DatabaseStorage();