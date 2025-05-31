import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStockSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";
import { startTelegramBot } from "./telegram-bot";
import { startPriceFetcher, triggerPriceUpdate } from "./price-fetcher";

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
      
      // Try to fetch from Yahoo Finance for real company data
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (result && result.meta && result.meta.longName) {
            return res.json({ 
              ticker, 
              companyName: result.meta.longName,
              exchange: result.meta.exchangeName || 'Unknown'
            });
          }
        }
      } catch (fetchError) {
        console.warn(`Failed to fetch company data for ${ticker}:`, fetchError);
      }

      // Enhanced fallback mapping for major stocks
      const companyMap: Record<string, string> = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'GOOG': 'Alphabet Inc.',
        'AMZN': 'Amazon.com Inc.',
        'TSLA': 'Tesla Inc.',
        'NVDA': 'NVIDIA Corporation',
        'META': 'Meta Platforms Inc.',
        'NFLX': 'Netflix Inc.',
        'JPM': 'JPMorgan Chase & Co.',
        'JNJ': 'Johnson & Johnson',
        'V': 'Visa Inc.',
        'PG': 'Procter & Gamble Co.',
        'UNH': 'UnitedHealth Group Inc.',
        'HD': 'Home Depot Inc.',
        'MA': 'Mastercard Inc.',
        'BAC': 'Bank of America Corp.',
        'XOM': 'Exxon Mobil Corp.',
        'DIS': 'Walt Disney Co.',
        'ADBE': 'Adobe Inc.',
        'CRM': 'Salesforce Inc.',
        'PYPL': 'PayPal Holdings Inc.',
        'INTC': 'Intel Corp.',
        'AMD': 'Advanced Micro Devices Inc.',
        'ORCL': 'Oracle Corp.',
        'PLAB': 'Photronics Inc.',
        'IBM': 'International Business Machines Corp.',
        'WMT': 'Walmart Inc.',
        'KO': 'Coca-Cola Co.',
        'PFE': 'Pfizer Inc.',
      };

      const companyName = companyMap[ticker] || `${ticker} Corporation`;
      res.json({ ticker, companyName, exchange: 'NASDAQ/NYSE' });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup ticker" });
    }
  });

  // Manual price update endpoint
  app.post("/api/prices/update", async (req, res) => {
    try {
      await triggerPriceUpdate();
      res.json({ message: "Price update triggered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger price update" });
    }
  });

  // Markets data endpoint for NASDAQ and NYSE
  app.get("/api/markets", async (req, res) => {
    try {
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
      
      if (!alphaVantageKey) {
        return res.status(503).json({ error: "Alpha Vantage API key not configured" });
      }

      // Fetch active listings from Alpha Vantage
      const listingsResponse = await fetch(
        `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${alphaVantageKey}`
      );

      if (!listingsResponse.ok) {
        throw new Error(`Alpha Vantage API error: ${listingsResponse.statusText}`);
      }

      const csvData = await listingsResponse.text();
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      const marketData = [];
      
      // Parse CSV and filter for major exchanges
      for (let i = 1; i < Math.min(lines.length, 200); i++) { // Limit to first 200 for performance
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = line.split(',');
        if (values.length < headers.length) continue;
        
        const symbol = values[0];
        const name = values[1];
        const exchange = values[2];
        const assetType = values[3];
        const status = values[5];
        
        // Filter for active stocks on major exchanges
        if (status === 'Active' && assetType === 'Stock' && 
            (exchange === 'NASDAQ' || exchange === 'NYSE')) {
          
          // Try to get real-time price data for major stocks
          let price = undefined;
          let change = undefined;
          
          // For performance, only fetch prices for well-known major stocks
          const majorStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'JPM', 'BAC', 'JNJ', 'PG', 'KO', 'XOM', 'PLAB'];
          
          if (majorStocks.includes(symbol)) {
            try {
              const priceResponse = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
              );
              
              if (priceResponse.ok) {
                const priceData = await priceResponse.json();
                const quote = priceData['Global Quote'];
                
                if (quote && quote['05. price']) {
                  price = parseFloat(quote['05. price']);
                  change = parseFloat(quote['10. change percent'].replace('%', ''));
                }
              }
              
              // Small delay to respect API rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (priceError) {
              console.warn(`Failed to fetch price for ${symbol}:`, priceError);
            }
          }
          
          marketData.push({
            symbol: symbol,
            name: name.replace(/"/g, ''), // Remove quotes from CSV
            exchange: exchange,
            sector: getSectorFromSymbol(symbol),
            price: price,
            change: change
          });
        }
      }

      res.json(marketData);
    } catch (error) {
      console.error('Market data fetch error:', error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Helper function to map sectors (simplified mapping)
  function getSectorFromSymbol(symbol: string): string {
    const sectorMap: Record<string, string> = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'NVDA': 'Technology',
      'META': 'Technology', 'NFLX': 'Technology', 'ADBE': 'Technology', 'CRM': 'Technology',
      'JPM': 'Financial Services', 'BAC': 'Financial Services', 'WFC': 'Financial Services', 'GS': 'Financial Services',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare',
      'PG': 'Consumer Staples', 'KO': 'Consumer Staples', 'PEP': 'Consumer Staples',
      'XOM': 'Energy', 'CVX': 'Energy',
      'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary',
      'CAT': 'Industrials', 'BA': 'Industrials', 'GE': 'Industrials',
      'PLAB': 'Technology'
    };
    
    return sectorMap[symbol] || 'Other';
  }

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
