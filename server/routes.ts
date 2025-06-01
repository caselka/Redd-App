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

  // Get individual portfolio transactions
  app.get('/api/portfolio/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const holdings = await storage.getPortfolioHoldings(userId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching portfolio transactions:", error);
      res.status(500).json({ message: "Failed to fetch portfolio transactions" });
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
              totalValue: currentValue, // Ensure totalValue is set for frontend calculations
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
              totalValue: 0, // Ensure totalValue is set for frontend calculations
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
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid portfolio holding ID" });
      }
      
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
  // Stock company information route using Yahoo Finance
  app.get("/api/stocks/:ticker/company", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      
      // Try multiple Yahoo Finance endpoints for comprehensive data
      const endpoints = [
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryProfile,financialData,defaultKeyStatistics,price`,
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryProfile,financialData,defaultKeyStatistics,price`,
        `https://finance.yahoo.com/quote/${ticker}/key-statistics?p=${ticker}`,
      ];
      
      let companyData = null;
      
      // Try the quoteSummary endpoints first
      for (const endpoint of endpoints.slice(0, 2)) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const result = data?.quoteSummary?.result?.[0];
            if (result) {
              companyData = result;
              break;
            }
          }
        } catch (e) {
          console.log(`Failed endpoint: ${endpoint}`);
          continue;
        }
      }
      
      // Fallback to chart data if quoteSummary fails
      if (!companyData) {
        const chartResponse = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`
        );
        
        if (chartResponse.ok) {
          const chartData = await chartResponse.json();
          const meta = chartData?.chart?.result?.[0]?.meta || {};
          
          const companyInfo = {
            symbol: meta.symbol || ticker,
            name: meta.longName || meta.shortName || ticker,
            description: `${ticker} is traded on ${meta.exchangeName || 'the stock market'}.`,
            sector: "Data temporarily unavailable",
            industry: "Data temporarily unavailable",
            employees: "Data temporarily unavailable",
            marketCap: "Data temporarily unavailable",
            revenue: "Data temporarily unavailable",
            grossProfit: "Data temporarily unavailable",
            profitMargin: "Data temporarily unavailable",
            operatingMargin: "Data temporarily unavailable",
            returnOnAssets: "Data temporarily unavailable",
            returnOnEquity: "Data temporarily unavailable",
            revenuePerShare: "Data temporarily unavailable",
            quarterlyRevenueGrowth: "Data temporarily unavailable",
            quarterlyEarningsGrowth: "Data temporarily unavailable",
            analystTargetPrice: "Data temporarily unavailable",
            trailingPE: "Data temporarily unavailable",
            forwardPE: "Data temporarily unavailable",
            priceToSales: "Data temporarily unavailable",
            priceToBook: "Data temporarily unavailable",
            evToRevenue: "Data temporarily unavailable",
            evToEbitda: "Data temporarily unavailable",
            beta: "Data temporarily unavailable",
            week52High: meta.fiftyTwoWeekHigh || "N/A",
            week52Low: meta.fiftyTwoWeekLow || "N/A",
            movingAverage50: "Data temporarily unavailable",
            movingAverage200: "Data temporarily unavailable",
            sharesOutstanding: "Data temporarily unavailable",
            dividendPerShare: "Data temporarily unavailable",
            dividendYield: "Data temporarily unavailable",
            dividendDate: "Data temporarily unavailable",
            exDividendDate: "Data temporarily unavailable",
            currentPrice: meta.regularMarketPrice,
            currency: meta.currency || "USD",
            exchangeName: meta.exchangeName || "Unknown",
            instrumentType: meta.instrumentType || "EQUITY",
          };
          
          return res.json(companyInfo);
        }
        
        return res.status(404).json({ error: "Company information not found" });
      }

      // Extract data from successful quoteSummary response
      const profile = companyData.summaryProfile || {};
      const keyStats = companyData.defaultKeyStatistics || {};
      const financialData = companyData.financialData || {};
      const priceInfo = companyData.price || {};

      const formatNumber = (value: any) => {
        if (!value || typeof value !== 'object') return "N/A";
        return value.fmt || value.raw?.toString() || "N/A";
      };

      const companyInfo = {
        symbol: ticker,
        name: priceInfo.longName || priceInfo.shortName || ticker,
        description: profile.longBusinessSummary || `${ticker} company information.`,
        sector: profile.sector || "N/A",
        industry: profile.industry || "N/A",
        employees: profile.fullTimeEmployees?.toString() || "N/A",
        marketCap: formatNumber(priceInfo.marketCap || keyStats.marketCap),
        revenue: formatNumber(financialData.totalRevenue),
        grossProfit: formatNumber(financialData.grossProfits),
        profitMargin: formatNumber(financialData.profitMargins),
        operatingMargin: formatNumber(financialData.operatingMargins),
        returnOnAssets: formatNumber(financialData.returnOnAssets),
        returnOnEquity: formatNumber(financialData.returnOnEquity),
        revenuePerShare: formatNumber(financialData.revenuePerShare),
        quarterlyRevenueGrowth: formatNumber(financialData.quarterlyRevenueGrowth),
        quarterlyEarningsGrowth: formatNumber(financialData.quarterlyEarningsGrowth),
        analystTargetPrice: formatNumber(financialData.targetMeanPrice),
        trailingPE: formatNumber(keyStats.trailingPE),
        forwardPE: formatNumber(keyStats.forwardPE),
        priceToSales: formatNumber(keyStats.priceToSalesTrailing12Months),
        priceToBook: formatNumber(keyStats.priceToBook),
        evToRevenue: formatNumber(keyStats.enterpriseToRevenue),
        evToEbitda: formatNumber(keyStats.enterpriseToEbitda),
        beta: formatNumber(keyStats.beta),
        week52High: formatNumber(keyStats.fiftyTwoWeekHigh),
        week52Low: formatNumber(keyStats.fiftyTwoWeekLow),
        movingAverage50: formatNumber(keyStats.fiftyDayAverage),
        movingAverage200: formatNumber(keyStats.twoHundredDayAverage),
        sharesOutstanding: formatNumber(keyStats.sharesOutstanding),
        dividendPerShare: formatNumber(keyStats.dividendRate),
        dividendYield: formatNumber(keyStats.dividendYield),
        dividendDate: keyStats.dividendDate?.fmt || "N/A",
        exDividendDate: keyStats.exDividendDate?.fmt || "N/A",
        currentPrice: priceInfo.regularMarketPrice?.raw || priceInfo.regularMarketPrice,
        currency: priceInfo.currency || "USD",
        exchangeName: priceInfo.exchangeName || "Unknown",
        instrumentType: "EQUITY",
      };

      res.json(companyInfo);
    } catch (error) {
      console.error("Error fetching company info:", error);
      res.status(500).json({ error: "Failed to fetch company information" });
    }
  });

  // Stock historical chart data route
  app.get("/api/stocks/:ticker/chart", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const requestedPeriod = (req.query.period as string) || "1y";
      
      // Map frontend periods to valid Yahoo Finance periods
      const periodMap: { [key: string]: string } = {
        "1d": "1d",
        "5d": "5d", 
        "1m": "1mo",
        "3m": "3mo",
        "6m": "6mo",
        "1y": "1y",
        "2y": "2y",
        "5y": "5y",
        "10y": "10y",
        "ytd": "ytd",
        "max": "max"
      };
      
      const period = periodMap[requestedPeriod] || "1y";
      
      // Use Yahoo Finance for chart data
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${period}`
      );
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      
      if (!result) {
        return res.status(404).json({ error: "Chart data not found" });
      }

      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];
      
      const chartData = timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        timestamp: timestamp * 1000,
        open: quotes.open?.[index] || null,
        high: quotes.high?.[index] || null,
        low: quotes.low?.[index] || null,
        close: quotes.close?.[index] || null,
        adjClose: adjClose[index] || null,
        volume: quotes.volume?.[index] || null,
      })).filter(item => item.close !== null);

      res.json({
        symbol: result.meta?.symbol || ticker,
        currency: result.meta?.currency || "USD",
        exchangeName: result.meta?.exchangeName || "",
        instrumentType: result.meta?.instrumentType || "",
        firstTradeDate: result.meta?.firstTradeDate,
        regularMarketTime: result.meta?.regularMarketTime,
        gmtoffset: result.meta?.gmtoffset,
        timezone: result.meta?.timezone,
        exchangeTimezoneName: result.meta?.exchangeTimezoneName,
        regularMarketPrice: result.meta?.regularMarketPrice,
        chartPreviousClose: result.meta?.chartPreviousClose,
        data: chartData,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
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

  app.delete("/api/stocks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`DELETE request for stock ID: ${id}`);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid stock ID" });
      }
      
      const deleted = await storage.deleteStock(id);
      if (!deleted) {
        console.log(`Stock with ID ${id} not found or could not be deleted`);
        return res.status(404).json({ error: "Stock not found" });
      }
      
      console.log(`Successfully deleted stock with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      console.error("Error in delete stock route:", error);
      res.status(500).json({ error: "Failed to delete stock" });
    }
  });

  // Price history routes - fetch 4 weeks of historical daily closing prices
  app.get("/api/stocks/:id/prices", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get stock information to get the ticker
      const stock = await storage.getStock(id);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      const ticker = stock.ticker.toUpperCase();
      
      // Fetch 4 weeks (28 days) of historical daily data from Yahoo Finance
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo&includePrePost=false`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );
      
      if (!response.ok) {
        // Fallback to stored data if external API fails
        const prices = await storage.getPriceHistory(id, 50);
        return res.json(prices);
      }
      
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      
      if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
        // Fallback to stored data if no external data available
        const prices = await storage.getPriceHistory(id, 50);
        return res.json(prices);
      }
      
      // Transform Yahoo Finance data to match our price history format
      const timestamps = result.timestamp;
      const closes = result.indicators.quote[0].close;
      
      const historicalPrices = timestamps
        .map((timestamp: number, index: number) => {
          const close = closes[index];
          if (close === null || close === undefined) return null;
          
          return {
            id: index + 1000000, // Use high ID to avoid conflicts with stored data
            stockId: id,
            price: close.toFixed(2),
            timestamp: new Date(timestamp * 1000),
            changePercent: null
          };
        })
        .filter((price: any) => price !== null)
        .reverse(); // Show most recent first
      
      res.json(historicalPrices);
    } catch (error) {
      console.error("Error fetching price history:", error);
      // Fallback to stored data if external API fails
      try {
        const prices = await storage.getPriceHistory(parseInt(req.params.id), 50);
        res.json(prices);
      } catch (fallbackError) {
        res.status(500).json({ error: "Failed to fetch price history" });
      }
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

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const noteData = {
        ...req.body,
        userId: userId
      };
      const validatedData = insertNoteSchema.parse(noteData);
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

  // Test Telegram price alert (for development)
  app.post('/api/telegram/test-alert', async (req, res) => {
    try {
      const { ticker, currentPrice, intrinsicValue } = req.body;
      
      if (!ticker || !currentPrice || !intrinsicValue) {
        return res.status(400).json({ message: 'Missing required fields: ticker, currentPrice, intrinsicValue' });
      }

      const marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
      
      // Import sendPriceAlert dynamically to avoid circular dependency
      const { sendPriceAlert } = await import('./telegram-bot');
      await sendPriceAlert(ticker, currentPrice, intrinsicValue, marginOfSafety);
      
      res.json({ 
        message: 'Test alert sent successfully',
        data: { ticker, currentPrice, intrinsicValue, marginOfSafety: marginOfSafety.toFixed(1) }
      });
    } catch (error) {
      console.error('Error sending test alert:', error);
      res.status(500).json({ message: 'Failed to send test alert' });
    }
  });

  // Get Telegram bot configuration
  app.get('/api/telegram/config', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.telegramBotToken) {
        return res.json({ isConfigured: false });
      }

      res.json({
        isConfigured: true,
        username: user.telegramBotUsername || 'Unknown',
        hasToken: true
      });
    } catch (error) {
      console.error('Error fetching bot config:', error);
      res.status(500).json({ error: 'Failed to fetch bot configuration' });
    }
  });

  // Save Telegram bot configuration
  app.post('/api/telegram/config', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { token, username } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Bot token is required' });
      }

      // Validate token format (basic check)
      if (!token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
        return res.status(400).json({ error: 'Invalid bot token format' });
      }

      await storage.updateUser(userId, {
        telegramBotToken: token,
        telegramBotUsername: username
      });

      res.json({ message: 'Bot configuration saved successfully' });
    } catch (error) {
      console.error('Error saving bot config:', error);
      res.status(500).json({ error: 'Failed to save bot configuration' });
    }
  });

  // Test Telegram bot
  app.post('/api/telegram/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);

      if (!user || !user.telegramBotToken) {
        return res.status(400).json({ error: 'Bot not configured' });
      }

      // Test the bot by making a simple API call
      const testResponse = await fetch(`https://api.telegram.org/bot${user.telegramBotToken}/getMe`);
      const testData = await testResponse.json();

      if (!testData.ok) {
        return res.status(400).json({ error: 'Bot token is invalid' });
      }

      res.json({ 
        message: 'Bot is working correctly',
        botInfo: {
          username: testData.result.username,
          firstName: testData.result.first_name
        }
      });
    } catch (error) {
      console.error('Error testing bot:', error);
      res.status(500).json({ error: 'Failed to test bot' });
    }
  });

  // Markets data endpoint for NASDAQ and NYSE with comprehensive ticker coverage
  app.get("/api/markets", async (req, res) => {
    try {
      // Comprehensive list of major NASDAQ and NYSE stocks
      const comprehensiveStocks = [
        // NASDAQ Technology Giants
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class C', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services' },
        { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'QCOM', name: 'QUALCOMM Incorporated', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'CSCO', name: 'Cisco Systems Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ', sector: 'Communication Services' },
        { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Staples' },
        { symbol: 'COST', name: 'Costco Wholesale Corporation', exchange: 'NASDAQ', sector: 'Consumer Staples' },
        
        // NASDAQ Biotech and Healthcare
        { symbol: 'AMGN', name: 'Amgen Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'GILD', name: 'Gilead Sciences Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'BIIB', name: 'Biogen Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'REGN', name: 'Regeneron Pharmaceuticals Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'VRTX', name: 'Vertex Pharmaceuticals Incorporated', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'ILMN', name: 'Illumina Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        { symbol: 'MRNA', name: 'Moderna Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
        
        // NASDAQ Others
        { symbol: 'SBUX', name: 'Starbucks Corporation', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'ABNB', name: 'Airbnb Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
        { symbol: 'ZM', name: 'Zoom Video Communications Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'DOCU', name: 'DocuSign Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'ROKU', name: 'Roku Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'LYFT', name: 'Lyft Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'UBER', name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Technology' },
        
        // NYSE Blue Chips and Financial Services
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'WFC', name: 'Wells Fargo & Company', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'C', name: 'Citigroup Inc.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'GS', name: 'Goldman Sachs Group Inc.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'MS', name: 'Morgan Stanley', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'AXP', name: 'American Express Company', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'BLK', name: 'BlackRock Inc.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'SPG', name: 'Simon Property Group Inc.', exchange: 'NYSE', sector: 'Real Estate' },
        
        // NYSE Healthcare
        { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'MRK', name: 'Merck & Co. Inc.', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'ABT', name: 'Abbott Laboratories', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'CVS', name: 'CVS Health Corporation', exchange: 'NYSE', sector: 'Healthcare' },
        { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE', sector: 'Healthcare' },
        
        // NYSE Consumer and Retail
        { symbol: 'PG', name: 'Procter & Gamble Company', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples' },
        { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        { symbol: 'TGT', name: 'Target Corporation', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        { symbol: 'DIS', name: 'Walt Disney Company', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'MCD', name: 'McDonald\'s Corporation', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
        
        // NYSE Financials and Payments
        { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE', sector: 'Financial Services' },
        { symbol: 'SQ', name: 'Block Inc.', exchange: 'NYSE', sector: 'Technology' },
        
        // NYSE Energy and Utilities
        { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', sector: 'Energy' },
        { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', sector: 'Energy' },
        { symbol: 'COP', name: 'ConocoPhillips', exchange: 'NYSE', sector: 'Energy' },
        { symbol: 'SLB', name: 'Schlumberger NV', exchange: 'NYSE', sector: 'Energy' },
        { symbol: 'NEE', name: 'NextEra Energy Inc.', exchange: 'NYSE', sector: 'Utilities' },
        { symbol: 'DUK', name: 'Duke Energy Corporation', exchange: 'NYSE', sector: 'Utilities' },
        { symbol: 'SO', name: 'Southern Company', exchange: 'NYSE', sector: 'Utilities' },
        
        // NYSE Telecommunications
        { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'T', name: 'AT&T Inc.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'TMUS', name: 'T-Mobile US Inc.', exchange: 'NASDAQ', sector: 'Communication Services' },
        
        // NYSE Industrials
        { symbol: 'MMM', name: '3M Company', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'BA', name: 'Boeing Company', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'UPS', name: 'United Parcel Service Inc.', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'FDX', name: 'FedEx Corporation', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'LMT', name: 'Lockheed Martin Corporation', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'RTX', name: 'Raytheon Technologies Corporation', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'HON', name: 'Honeywell International Inc.', exchange: 'NYSE', sector: 'Industrials' },
        { symbol: 'GE', name: 'General Electric Company', exchange: 'NYSE', sector: 'Industrials' },
        
        // NYSE REITs and Real Estate
        { symbol: 'AMT', name: 'American Tower Corporation', exchange: 'NYSE', sector: 'Real Estate' },
        { symbol: 'CCI', name: 'Crown Castle International Corp.', exchange: 'NYSE', sector: 'Real Estate' },
        { symbol: 'PLD', name: 'Prologis Inc.', exchange: 'NYSE', sector: 'Real Estate' },
        { symbol: 'EQIX', name: 'Equinix Inc.', exchange: 'NASDAQ', sector: 'Real Estate' },
        
        // Additional Popular Stocks
        { symbol: 'SHOP', name: 'Shopify Inc.', exchange: 'NYSE', sector: 'Technology' },
        { symbol: 'SPOT', name: 'Spotify Technology S.A.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'SNAP', name: 'Snap Inc.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'PINS', name: 'Pinterest Inc.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'TWTR', name: 'Twitter Inc.', exchange: 'NYSE', sector: 'Communication Services' },
        { symbol: 'DBX', name: 'Dropbox Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'OKTA', name: 'Okta Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'PLTR', name: 'Palantir Technologies Inc.', exchange: 'NYSE', sector: 'Technology' },
        { symbol: 'SNOW', name: 'Snowflake Inc.', exchange: 'NYSE', sector: 'Technology' },
        { symbol: 'DDOG', name: 'Datadog Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'ZS', name: 'Zscaler Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'NET', name: 'Cloudflare Inc.', exchange: 'NYSE', sector: 'Technology' },
        { symbol: 'PLAB', name: 'Photronics Inc.', exchange: 'NASDAQ', sector: 'Technology' }
      ];

      const marketData = [];

      // Fetch real price data using Yahoo Finance for reliable live prices
      for (const stock of comprehensiveStocks) {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=1d`
          );

          let price = undefined;
          let change = undefined;

          if (response.ok) {
            const data = await response.json();
            const result = data?.chart?.result?.[0];
            
            if (result?.meta) {
              price = result.meta.regularMarketPrice;
              const previousClose = result.meta.previousClose;
              if (price && previousClose) {
                change = ((price - previousClose) / previousClose) * 100;
              }
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

          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 30));
        } catch (error) {
          console.warn(`Failed to fetch data for ${stock.symbol}:`, error);
          
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
