import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStockSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";
import { startTelegramBot } from "./telegram-bot";
import { startPriceFetcher } from "./price-fetcher";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stock routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getStocksWithLatestPrices();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stock = await storage.getStock(id);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  app.post("/api/stocks", async (req, res) => {
    try {
      const validatedData = insertStockSchema.parse(req.body);
      
      // Check if ticker already exists
      const existingStock = await storage.getStockByTicker(validatedData.ticker);
      if (existingStock) {
        return res.status(409).json({ error: "Stock ticker already exists" });
      }

      const stock = await storage.createStock(validatedData);
      res.status(201).json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid stock data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create stock" });
      }
    }
  });

  app.put("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStockSchema.partial().parse(req.body);
      
      const updatedStock = await storage.updateStock(id, validatedData);
      if (!updatedStock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      res.json(updatedStock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid stock data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update stock" });
      }
    }
  });

  app.delete("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStock(id);
      if (!deleted) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stock" });
    }
  });

  // Price history routes
  app.get("/api/stocks/:id/prices", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const prices = await storage.getPriceHistory(id, limit);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notes = await storage.getRecentNotes(limit);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/stocks/:id/notes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notes = await storage.getNotesByStock(id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid note data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStockStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Stock lookup route (for company name resolution)
  app.get("/api/lookup/:ticker", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      
      // Simple company name mapping - in production, this would use a real API
      const companyMap: Record<string, string> = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com Inc.',
        'TSLA': 'Tesla Inc.',
        'NVDA': 'NVIDIA Corporation',
        'META': 'Meta Platforms Inc.',
        'NFLX': 'Netflix Inc.',
      };

      const companyName = companyMap[ticker] || `${ticker} Corp.`;
      res.json({ ticker, companyName });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup ticker" });
    }
  });

  const httpServer = createServer(app);

  // Start background services
  try {
    await startTelegramBot();
    console.log("Telegram bot started successfully");
  } catch (error) {
    console.warn("Failed to start Telegram bot:", error);
  }

  try {
    startPriceFetcher();
    console.log("Price fetcher started successfully");
  } catch (error) {
    console.warn("Failed to start price fetcher:", error);
  }

  return httpServer;
}
