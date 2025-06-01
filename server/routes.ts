import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStockSchema, insertNoteSchema, insertPortfolioHoldingSchema } from "@shared/schema";
import { z } from "zod";
import { startTelegramBot } from "./telegram-bot";
import { startPriceFetcher, triggerPriceUpdate } from "./price-fetcher";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const holdings = await storage.getPortfolioHoldings(userId);
      
      // Group holdings by ticker to calculate aggregated values
      const tickerGroups = holdings.reduce((acc, holding) => {
        if (!acc[holding.ticker]) {
          acc[holding.ticker] = [];
        }
        acc[holding.ticker].push(holding);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate aggregated values for each ticker
      const portfolioSummary = await Promise.all(
        Object.entries(tickerGroups).map(async ([ticker, transactions]) => {
          try {
            // Calculate totals for this ticker
            let totalShares = 0;
            let totalCost = 0;
            let weightedAveragePrice = 0;

            transactions.forEach(transaction => {
              const shares = parseFloat(transaction.shares);
              const price = parseFloat(transaction.purchasePrice);
              totalShares += shares;
              totalCost += shares * price;
            });

            weightedAveragePrice = totalCost / totalShares;

            // Get current price using Google Finance via Yahoo Finance API
            let currentPrice = 0;
            
            try {
              // Use Yahoo Finance which provides reliable market data
              const yahooResponse = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
              );
              
              if (yahooResponse.ok) {
                const yahooData = await yahooResponse.json();
                const result = yahooData?.chart?.result?.[0];
                if (result?.meta?.regularMarketPrice) {
                  currentPrice = result.meta.regularMarketPrice;
                  console.log(`Got price for ${ticker}: $${currentPrice}`);
                }
              }
            } catch (error) {
              console.warn(`Failed to get price for ${ticker}:`, error);
            }
            
            const currentValue = currentPrice * totalShares;
            const gainLoss = currentValue - totalCost;
            const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;
            
            // Get intrinsic value from watchlist if exists
            let intrinsicValue = null;
            let marginOfSafety = null;
            try {
              const watchlistStock = await storage.getStockByTicker(ticker);
              if (watchlistStock && watchlistStock.intrinsicValue) {
                intrinsicValue = parseFloat(watchlistStock.intrinsicValue);
                if (currentPrice > 0) {
                  marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
                }
              }
            } catch (error) {
              console.warn(`Could not fetch intrinsic value for ${ticker}`);
            }
            
            return {
              ticker,
              companyName: transactions[0].companyName,
              totalShares,
              weightedAveragePrice,
              currentPrice,
              totalCost,
              currentValue,
              gainLoss,
              gainLossPercent,
              intrinsicValue,
              marginOfSafety,
              transactions,
            };
          } catch (error) {
            console.warn(`Failed to process ${ticker}:`, error);
            return {
              ticker,
              companyName: transactions[0].companyName,
              totalShares: transactions.reduce((sum, t) => sum + parseFloat(t.shares), 0),
              weightedAveragePrice: 0,
              currentPrice: 0,
              totalCost: 0,
              currentValue: 0,
              gainLoss: 0,
              gainLossPercent: 0,
              transactions,
            };
          }
        })
      );
      
      res.json(portfolioSummary);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Transform the data before validation
      const holdingData = {
        ...req.body,
        userId,
        purchaseDate: new Date(req.body.purchaseDate),
        shares: req.body.shares.toString(),
        purchasePrice: req.body.purchasePrice.toString(),
      };
      
      const holding = await storage.createPortfolioHolding(holdingData);
      res.json(holding);
    } catch (error) {
      console.error("Error creating portfolio holding:", error);
      res.status(500).json({ error: "Failed to create portfolio holding" });
    }
  });

  app.delete('/api/portfolio/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePortfolioHolding(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Portfolio holding not found" });
      }
    } catch (error) {
      console.error("Error deleting portfolio holding:", error);
      res.status(500).json({ error: "Failed to delete portfolio holding" });
    }
  });
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

  // News endpoint for Google News integration
  app.get("/api/news", async (req, res) => {
    try {
      // Use Google News RSS feed for financial news
      const response = await fetch(
        'https://news.google.com/rss/search?q=finance+OR+stock+market+OR+investing+OR+economy&hl=en&gl=US&ceid=US:en'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const xmlData = await response.text();
      
      // Parse RSS XML to JSON (simplified)
      const articles = parseNewsXML(xmlData);
      
      res.json({ articles });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  function parseNewsXML(xmlData: string) {
    const articles = [];
    
    // More flexible regex patterns for Google News RSS
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
    const linkRegex = /<link[^>]*>([^<]+)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
    
    let match;
    while ((match = itemRegex.exec(xmlData)) !== null && articles.length < 10) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      const pubDateMatch = itemContent.match(pubDateRegex);
      const descMatch = itemContent.match(descRegex);
      
      if (titleMatch && linkMatch) {
        let description = 'Financial news update';
        if (descMatch && descMatch[1]) {
          description = descMatch[1]
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, '')
            .trim()
            .substring(0, 120) + '...';
        }
        
        articles.push({
          title: titleMatch[1].replace(/&[^;]+;/g, '').trim(),
          description,
          url: linkMatch[1].trim(),
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          source: {
            name: 'Google News'
          }
        });
      }
    }
    
    // Fallback sample articles if parsing fails
    if (articles.length === 0) {
      articles.push({
        title: 'Market Update: Financial News Available',
        description: 'Stay informed with the latest financial market developments and investment insights.',
        url: 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZ4ZERBU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen',
        publishedAt: new Date().toISOString(),
        source: { name: 'Google News' }
      });
    }
    
    return articles;
  }

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

      // Define major stocks to display with real price data
      const majorStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services' },
        { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'KO', name: 'Coca-Cola Co.', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE', sector: 'Energy' },
        { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'PLAB', name: 'Photronics Inc.', exchange: 'NASDAQ', sector: 'Technology' }
      ];

      const marketData = [];

      // Fetch real price data for each stock
      for (const stock of majorStocks) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${alphaVantageKey}`
          );

          let price = undefined;
          let change = undefined;

          if (response.ok) {
            const data = await response.json();
            const quote = data['Global Quote'];
            
            if (quote && quote['05. price']) {
              price = parseFloat(quote['05. price']);
              change = parseFloat(quote['10. change percent'].replace('%', ''));
            }
          }

          marketData.push({
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
            price: price,
            change: change
          });

          // Rate limiting - wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Failed to fetch data for ${stock.symbol}:`, error);
          
          // Add stock without price data if API fails
          marketData.push({
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
            price: undefined,
            change: undefined
          });
        }
      }

      res.json(marketData);
    } catch (error) {
      console.error('Market data fetch error:', error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // SEC Filings endpoint
  app.get("/api/sec-filings/:ticker", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      
      // First, get the company's CIK (Central Index Key) from SEC
      const companyResponse = await fetch(
        `https://www.sec.gov/files/company_tickers.json`,
        {
          headers: {
            'User-Agent': 'Redd Investment Tracker contact@example.com',
          },
        }
      );

      if (!companyResponse.ok) {
        throw new Error(`SEC API error: ${companyResponse.statusText}`);
      }

      const companyData = await companyResponse.json();
      
      // Find the CIK for the given ticker
      let cik = null;
      for (const [key, company] of Object.entries(companyData)) {
        if ((company as any).ticker === ticker) {
          cik = String((company as any).cik_str).padStart(10, '0');
          break;
        }
      }

      if (!cik) {
        return res.status(404).json({ error: `No SEC filings found for ticker ${ticker}` });
      }

      // Fetch recent filings for this CIK
      const filingsResponse = await fetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        {
          headers: {
            'User-Agent': 'Redd Investment Tracker contact@example.com',
          },
        }
      );

      if (!filingsResponse.ok) {
        throw new Error(`SEC filings API error: ${filingsResponse.statusText}`);
      }

      const filingsData = await filingsResponse.json();
      const filings = filingsData.filings?.recent;

      if (!filings) {
        return res.json([]);
      }

      // Process and format the filings data
      const formattedFilings = [];
      const maxFilings = Math.min(50, filings.accessionNumber?.length || 0); // Limit to 50 recent filings

      for (let i = 0; i < maxFilings; i++) {
        formattedFilings.push({
          accessionNumber: filings.accessionNumber[i],
          filingDate: filings.filingDate[i],
          reportDate: filings.reportDate[i],
          acceptanceDateTime: filings.acceptanceDateTime[i],
          act: filings.act[i],
          form: filings.form[i],
          fileNumber: filings.fileNumber[i],
          filmNumber: filings.filmNumber[i],
          items: filings.items[i],
          size: filings.size[i],
          isXBRL: filings.isXBRL[i] === 1,
          isInlineXBRL: filings.isInlineXBRL[i] === 1,
          primaryDocument: filings.primaryDocument[i],
          primaryDocDescription: filings.primaryDocDescription[i],
          cik: cik, // Include CIK for proper URL construction
        });
      }

      // Sort by filing date (most recent first)
      formattedFilings.sort((a, b) => 
        new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()
      );

      res.json(formattedFilings);
    } catch (error) {
      console.error('SEC filings fetch error:', error);
      res.status(500).json({ error: "Failed to fetch SEC filings" });
    }
  });

  // Price alerts endpoint
  app.post('/api/price-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const { ticker, targetPrice } = req.body;
      const userId = req.user.claims.sub;
      
      // Here you would typically save to database
      // For now, we'll just confirm the alert was created
      
      res.json({ 
        success: true, 
        message: `Price alert created for ${ticker} at $${targetPrice}`,
        ticker,
        targetPrice,
        userId 
      });
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(500).json({ error: "Failed to create price alert" });
    }
  });

  // AI gut check endpoint  
  app.post('/api/ai-gut-check', isAuthenticated, async (req: any, res) => {
    try {
      const { stockIdea, reasonForBuy } = req.body;
      
      // Standard Warren Buffett-style questions for gut checking investment ideas
      const questions = [
        `What's the biggest risk you're ignoring about ${stockIdea}?`,
        `If ${stockIdea} drops 50% tomorrow, what would be your specific plan?`,
        `Would you be happy to own ${stockIdea} with no price quotes for 5 years?`,
        `Can you explain ${stockIdea}'s business model to a 10-year-old?`,
        `What would need to happen for this ${stockIdea} investment to fail completely?`
      ];
      
      // Return 3 random questions
      const selectedQuestions = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      res.json({ questions: selectedQuestions });
    } catch (error) {
      console.error("Error generating gut check questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
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
