import { storage } from "./storage";

interface YahooFinanceResult {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
}

interface AlphaVantageResult {
  symbol: string;
  price: number;
  changePercent: number;
}

class PriceFetcher {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private alphaVantageKey: string | null = null;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || null;
  }

  async fetchStockPrice(ticker: string): Promise<YahooFinanceResult | null> {
    // Try Alpha Vantage first if API key is available
    if (this.alphaVantageKey) {
      const alphaResult = await this.fetchFromAlphaVantage(ticker);
      if (alphaResult) {
        return {
          symbol: alphaResult.symbol,
          regularMarketPrice: alphaResult.price,
          regularMarketChangePercent: alphaResult.changePercent,
          regularMarketTime: Date.now() / 1000,
        };
      }
    }

    // Fallback to Yahoo Finance
    return this.fetchFromYahooFinance(ticker);
  }

  async fetchFromAlphaVantage(ticker: string): Promise<AlphaVantageResult | null> {
    try {
      if (!this.alphaVantageKey) return null;

      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.alphaVantageKey}`
      );

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.statusText}`);
      }

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        return null;
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      };
    } catch (error) {
      console.error(`Failed to fetch price from Alpha Vantage for ${ticker}:`, error);
      return null;
    }
  }

  async fetchFromYahooFinance(ticker: string): Promise<YahooFinanceResult | null> {
    try {
      // Using Yahoo Finance API v8 (free tier)
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.meta) {
        throw new Error('Invalid response from Yahoo Finance');
      }

      const meta = result.meta;
      return {
        symbol: meta.symbol,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketChangePercent: (meta.regularMarketChangePercent || 0) * 100,
        regularMarketTime: meta.regularMarketTime,
      };
    } catch (error) {
      console.error(`Failed to fetch price from Yahoo Finance for ${ticker}:`, error);
      return null;
    }
  }

  async updateAllPrices() {
    console.log('Starting price update cycle...');
    
    try {
      const stocks = await storage.getAllStocks();
      const updatePromises = stocks.map(async (stock) => {
        try {
          const priceData = await this.fetchStockPrice(stock.ticker);
          
          if (priceData) {
            await storage.createPriceHistory({
              stockId: stock.id,
              price: priceData.regularMarketPrice.toFixed(2),
              changePercent: priceData.regularMarketChangePercent.toFixed(2),
            });
            
            console.log(`Updated price for ${stock.ticker}: $${priceData.regularMarketPrice}`);
          }
        } catch (error) {
          console.error(`Failed to update price for ${stock.ticker}:`, error);
        }
      });

      await Promise.all(updatePromises);
      console.log(`Price update cycle completed for ${stocks.length} stocks`);
    } catch (error) {
      console.error('Error during price update cycle:', error);
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Price fetcher started - will update every 5 minutes for active tracking');

    // Update immediately on start
    this.updateAllPrices();

    // Update every 5 minutes for real-time tracking (300000 ms)
    this.intervalId = setInterval(() => {
      this.updateAllPrices();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Price fetcher stopped');
  }

  // Method to manually trigger price updates (useful for testing)
  async triggerUpdate() {
    await this.updateAllPrices();
  }
}

const priceFetcherInstance = new PriceFetcher();

export function startPriceFetcher() {
  priceFetcherInstance.start();
}

export function stopPriceFetcher() {
  priceFetcherInstance.stop();
}

export function triggerPriceUpdate() {
  return priceFetcherInstance.triggerUpdate();
}
