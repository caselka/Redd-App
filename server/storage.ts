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
import { eq } from "drizzle-orm";

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
  
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Portfolio operations
  getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, updates: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding | undefined>;
  deletePortfolioHolding(id: number): Promise<boolean>;
  
  // Statistics
  getStockStats(): Promise<StockStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId));
  }

  async createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [newHolding] = await db
      .insert(portfolioHoldings)
      .values(holding)
      .returning();
    return newHolding;
  }

  async updatePortfolioHolding(id: number, updates: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const [updated] = await db
      .update(portfolioHoldings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioHoldings.id, id))
      .returning();
    return updated;
  }

  async deletePortfolioHolding(id: number): Promise<boolean> {
    const result = await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, id));
    return result.rowCount > 0;
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockByTicker(ticker: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(
      (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
    );
  }

  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStocksWithLatestPrices(): Promise<StockWithLatestPrice[]> {
    const stocks = Array.from(this.stocks.values());
    const result: StockWithLatestPrice[] = [];

    for (const stock of stocks) {
      const latestPrice = await this.getLatestPrice(stock.id);
      const intrinsicValue = parseFloat(stock.intrinsicValue);
      
      let marginOfSafety: number | undefined;
      if (latestPrice) {
        const currentPrice = parseFloat(latestPrice.price);
        marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
      }

      result.push({
        ...stock,
        currentPrice: latestPrice ? parseFloat(latestPrice.price) : undefined,
        changePercent: latestPrice?.changePercent ? parseFloat(latestPrice.changePercent) : undefined,
        lastUpdated: latestPrice?.timestamp,
        marginOfSafety,
      });
    }

    return result;
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.stockIdCounter++;
    const now = new Date();
    const stock: Stock = {
      ...insertStock,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, updates: Partial<InsertStock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;

    const updatedStock: Stock = {
      ...stock,
      ...updates,
      updatedAt: new Date(),
    };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async deleteStock(id: number): Promise<boolean> {
    return this.stocks.delete(id);
  }

  async createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.priceIdCounter++;
    const price: PriceHistory = {
      id,
      stockId: priceData.stockId,
      price: priceData.price,
      changePercent: priceData.changePercent ?? null,
      timestamp: new Date(),
    };
    this.priceHistory.set(id, price);
    return price;
  }

  async getLatestPrice(stockId: number): Promise<PriceHistory | undefined> {
    const prices = Array.from(this.priceHistory.values())
      .filter(p => p.stockId === stockId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return prices[0];
  }

  async getPriceHistory(stockId: number, limit: number = 50): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values())
      .filter(p => p.stockId === stockId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const newNote: Note = {
      ...note,
      id,
      createdAt: new Date(),
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async getNotesByStock(stockId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.stockId === stockId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentNotes(limit: number = 10): Promise<(Note & { ticker: string; companyName: string })[]> {
    const recentNotes = Array.from(this.notes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    const result = [];
    for (const note of recentNotes) {
      const stock = this.stocks.get(note.stockId);
      if (stock) {
        result.push({
          ...note,
          ticker: stock.ticker,
          companyName: stock.companyName,
        });
      }
    }

    return result;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async getStockStats(): Promise<StockStats> {
    const stocksWithPrices = await this.getStocksWithLatestPrices();
    
    const totalWatched = stocksWithPrices.length;
    const undervalued = stocksWithPrices.filter(s => (s.marginOfSafety || 0) > 0).length;
    const avgMarginOfSafety = stocksWithPrices.reduce((acc, s) => acc + (s.marginOfSafety || 0), 0) / totalWatched || 0;
    const highConviction = stocksWithPrices.filter(s => s.convictionScore >= 8).length;

    return {
      totalWatched,
      undervalued,
      avgMarginOfSafety: Math.round(avgMarginOfSafety * 10) / 10,
      highConviction,
    };
  }
}

export const storage = new DatabaseStorage();
