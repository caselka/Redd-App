import { storage } from "./storage";

interface YahooFinanceResult {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
}

class PriceFetcher {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  async fetchStockPrice(ticker: string): Promise<YahooFinanceResult | null> {
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
      console.error(`Failed to fetch price for ${ticker}:`, error);
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
    console.log('Price fetcher started - will update every 2 hours');

    // Update immediately on start
    this.updateAllPrices();

    // Then update every 2 hours (7200000 ms)
    this.intervalId = setInterval(() => {
      this.updateAllPrices();
    }, 2 * 60 * 60 * 1000);
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
