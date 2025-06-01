import { storage } from "./storage";

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

class TelegramBot {
  private botToken: string;
  private isRunning: boolean = false;
  private lastUpdateId: number = 0;
  private alertChatIds: Set<number> = new Set();

  constructor(token: string) {
    this.botToken = token;
  }

  async sendMessage(chatId: number, text: string) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  }

  async getUpdates() {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}`);
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Failed to get Telegram updates:', error);
      return [];
    }
  }

  async handleMessage(message: TelegramMessage) {
    const chatId = message.chat.id;
    const text = message.text?.trim() || '';
    const args = text.split(' ');
    const command = args[0]?.toLowerCase();

    try {
      switch (command) {
        case '/start':
          await this.sendMessage(chatId, 
            '🤖 *Investment Assistant Bot*\n\n' +
            'Available commands:\n' +
            '• `/watch TICKER` - Add stock to watchlist\n' +
            '• `/price TICKER` - Get current price & MoS\n' +
            '• `/note TICKER your note` - Save investment note\n' +
            '• `/log TICKER` - Get recent price history\n' +
            '• `/conviction TICKER 1-10` - Set conviction score\n' +
            '• `/alerts on/off` - Enable/disable price alerts\n' +
            '• `/list` - Show all watched stocks\n' +
            '• `/stats` - Portfolio statistics'
          );
          break;

        case '/watch':
          await this.handleWatchCommand(chatId, args.slice(1));
          break;

        case '/price':
          await this.handlePriceCommand(chatId, args.slice(1));
          break;

        case '/note':
          await this.handleNoteCommand(chatId, args.slice(1));
          break;

        case '/log':
          await this.handleLogCommand(chatId, args.slice(1));
          break;

        case '/conviction':
          await this.handleConvictionCommand(chatId, args.slice(1));
          break;

        case '/list':
          await this.handleListCommand(chatId);
          break;

        case '/stats':
          await this.handleStatsCommand(chatId);
          break;

        case '/alerts':
          await this.handleAlertsCommand(chatId, args.slice(1));
          break;

        default:
          await this.sendMessage(chatId, 
            '❓ Unknown command. Use /start to see available commands.'
          );
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await this.sendMessage(chatId, '❌ An error occurred processing your request.');
    }
  }

  async handleWatchCommand(chatId: number, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage(chatId, '❌ Please provide a ticker symbol.\nExample: `/watch AAPL`');
      return;
    }

    const ticker = args[0].toUpperCase();
    
    // Check if already watching
    const existingStock = await storage.getStockByTicker(ticker);
    if (existingStock) {
      await this.sendMessage(chatId, `📊 Already watching *${ticker}*`);
      return;
    }

    // For now, we'll add with default values - in production, this would fetch real data
    try {
      await storage.createStock({
        ticker,
        companyName: `${ticker} Corporation`,
        intrinsicValue: '100.00', // Default value
        convictionScore: 5, // Default medium conviction
      });

      await this.sendMessage(chatId, 
        `✅ Added *${ticker}* to watchlist!\n` +
        `💡 Don't forget to set your intrinsic value and conviction score.`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Failed to add ${ticker} to watchlist.`);
    }
  }

  async handlePriceCommand(chatId: number, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage(chatId, '❌ Please provide a ticker symbol.\nExample: `/price AAPL`');
      return;
    }

    const ticker = args[0].toUpperCase();
    const stock = await storage.getStockByTicker(ticker);
    
    if (!stock) {
      await this.sendMessage(chatId, `❌ *${ticker}* is not in your watchlist. Use \`/watch ${ticker}\` first.`);
      return;
    }

    const latestPrice = await storage.getLatestPrice(stock.id);
    const intrinsicValue = parseFloat(stock.intrinsicValue);

    if (!latestPrice) {
      await this.sendMessage(chatId, 
        `📊 *${ticker}* (${stock.companyName})\n` +
        `💰 Intrinsic Value: $${intrinsicValue.toFixed(2)}\n` +
        `❌ No current price data available`
      );
      return;
    }

    const currentPrice = parseFloat(latestPrice.price);
    const changePercent = latestPrice.changePercent ? parseFloat(latestPrice.changePercent) : 0;
    const marginOfSafety = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
    const changeIcon = changePercent >= 0 ? '📈' : '📉';
    const mosIcon = marginOfSafety > 0 ? '🟢' : '🔴';

    await this.sendMessage(chatId,
      `📊 *${ticker}* (${stock.companyName})\n` +
      `💰 Current: $${currentPrice.toFixed(2)} ${changeIcon} ${changePercent.toFixed(2)}%\n` +
      `🎯 Intrinsic Value: $${intrinsicValue.toFixed(2)}\n` +
      `${mosIcon} Margin of Safety: ${marginOfSafety.toFixed(1)}%\n` +
      `⭐ Conviction: ${stock.convictionScore}/10`
    );
  }

  async handleNoteCommand(chatId: number, args: string[]) {
    if (args.length < 2) {
      await this.sendMessage(chatId, '❌ Please provide ticker and note.\nExample: `/note AAPL Strong earnings this quarter`');
      return;
    }

    const ticker = args[0].toUpperCase();
    const noteContent = args.slice(1).join(' ');
    
    const stock = await storage.getStockByTicker(ticker);
    if (!stock) {
      await this.sendMessage(chatId, `❌ *${ticker}* is not in your watchlist. Use \`/watch ${ticker}\` first.`);
      return;
    }

    try {
      await storage.createNote({
        stockId: stock.id,
        userId: `telegram_${chatId}`,
        content: noteContent,
      });

      await this.sendMessage(chatId, `✅ Note added for *${ticker}*:\n"${noteContent}"`);
    } catch (error) {
      await this.sendMessage(chatId, `❌ Failed to save note for ${ticker}.`);
    }
  }

  async handleLogCommand(chatId: number, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage(chatId, '❌ Please provide a ticker symbol.\nExample: `/log AAPL`');
      return;
    }

    const ticker = args[0].toUpperCase();
    const stock = await storage.getStockByTicker(ticker);
    
    if (!stock) {
      await this.sendMessage(chatId, `❌ *${ticker}* is not in your watchlist.`);
      return;
    }

    const priceHistory = await storage.getPriceHistory(stock.id, 5);
    
    if (priceHistory.length === 0) {
      await this.sendMessage(chatId, `📊 *${ticker}*\n❌ No price history available.`);
      return;
    }

    let logMessage = `📊 *${ticker}* Recent Price History:\n\n`;
    
    priceHistory.forEach((price, index) => {
      const date = price.timestamp.toLocaleDateString();
      const priceValue = parseFloat(price.price);
      const change = price.changePercent ? parseFloat(price.changePercent) : 0;
      const changeIcon = change >= 0 ? '📈' : '📉';
      
      logMessage += `${index + 1}. ${date}: $${priceValue.toFixed(2)} ${changeIcon} ${change.toFixed(2)}%\n`;
    });

    await this.sendMessage(chatId, logMessage);
  }

  async handleConvictionCommand(chatId: number, args: string[]) {
    if (args.length < 2) {
      await this.sendMessage(chatId, '❌ Please provide ticker and conviction score (1-10).\nExample: `/conviction AAPL 8`');
      return;
    }

    const ticker = args[0].toUpperCase();
    const convictionScore = parseInt(args[1]);
    
    if (isNaN(convictionScore) || convictionScore < 1 || convictionScore > 10) {
      await this.sendMessage(chatId, '❌ Conviction score must be between 1 and 10.');
      return;
    }

    const stock = await storage.getStockByTicker(ticker);
    if (!stock) {
      await this.sendMessage(chatId, `❌ *${ticker}* is not in your watchlist.`);
      return;
    }

    try {
      await storage.updateStock(stock.id, { convictionScore });
      await this.sendMessage(chatId, `✅ Updated conviction for *${ticker}* to ${convictionScore}/10 ⭐`);
    } catch (error) {
      await this.sendMessage(chatId, `❌ Failed to update conviction for ${ticker}.`);
    }
  }

  async handleListCommand(chatId: number) {
    const stocks = await storage.getStocksWithLatestPrices();
    
    if (stocks.length === 0) {
      await this.sendMessage(chatId, '📊 Your watchlist is empty.\nUse `/watch TICKER` to add stocks.');
      return;
    }

    let listMessage = '📊 *Your Watchlist:*\n\n';
    
    stocks.forEach((stock, index) => {
      const mosIcon = (stock.marginOfSafety || 0) > 0 ? '🟢' : '🔴';
      const currentPrice = stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : 'N/A';
      const mos = stock.marginOfSafety ? `${stock.marginOfSafety.toFixed(1)}%` : 'N/A';
      
      listMessage += `${index + 1}. *${stock.ticker}*\n`;
      listMessage += `   💰 ${currentPrice} | ${mosIcon} MoS: ${mos} | ⭐ ${stock.convictionScore}/10\n\n`;
    });

    await this.sendMessage(chatId, listMessage);
  }

  async handleStatsCommand(chatId: number) {
    const stats = await storage.getStockStats();
    
    await this.sendMessage(chatId,
      `📈 *Portfolio Statistics:*\n\n` +
      `👁️ Total Watched: ${stats.totalWatched}\n` +
      `🟢 Undervalued: ${stats.undervalued}\n` +
      `🛡️ Avg. Margin of Safety: ${stats.avgMarginOfSafety.toFixed(1)}%\n` +
      `⭐ High Conviction (8+): ${stats.highConviction}`
    );
  }

  async handleAlertsCommand(chatId: number, args: string[]) {
    if (args.length === 0 || args[0] === 'status') {
      const isSubscribed = this.alertChatIds.has(chatId);
      await this.sendMessage(chatId,
        `🔔 *Price Alert Status:*\n\n` +
        `Status: ${isSubscribed ? '🟢 Active' : '🔴 Inactive'}\n\n` +
        `Commands:\n` +
        `• \`/alerts on\` - Enable price alerts\n` +
        `• \`/alerts off\` - Disable price alerts\n` +
        `• \`/alerts status\` - Check current status\n\n` +
        `💡 *How it works:*\n` +
        `You'll receive alerts when any stock in your watchlist drops below its intrinsic value (positive margin of safety).`
      );
      return;
    }

    const action = args[0].toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      this.alertChatIds.add(chatId);
      await this.sendMessage(chatId,
        `🔔 *Price alerts enabled!*\n\n` +
        `You'll now receive notifications when stocks in your watchlist reach attractive buying opportunities (below intrinsic value).\n\n` +
        `Use \`/alerts off\` to disable alerts.`
      );
    } else if (action === 'off' || action === 'disable') {
      this.alertChatIds.delete(chatId);
      await this.sendMessage(chatId,
        `🔕 *Price alerts disabled.*\n\n` +
        `You will no longer receive price notifications.\n\n` +
        `Use \`/alerts on\` to re-enable alerts.`
      );
    } else {
      await this.sendMessage(chatId,
        `❌ Invalid option. Use:\n` +
        `• \`/alerts on\` - Enable alerts\n` +
        `• \`/alerts off\` - Disable alerts\n` +
        `• \`/alerts status\` - Check status`
      );
    }
  }

  async sendPriceAlert(ticker: string, currentPrice: number, intrinsicValue: number, marginOfSafety: number) {
    if (this.alertChatIds.size === 0) return;

    const alertMessage = 
      `🚨 *PRICE ALERT* 🚨\n\n` +
      `📊 *${ticker}* is now trading below intrinsic value!\n\n` +
      `💰 Current Price: $${currentPrice.toFixed(2)}\n` +
      `🎯 Intrinsic Value: $${intrinsicValue.toFixed(2)}\n` +
      `🛡️ Margin of Safety: ${marginOfSafety.toFixed(1)}%\n\n` +
      `✅ This could be a good buying opportunity!`;

    // Send to all subscribed chats
    for (const chatId of Array.from(this.alertChatIds)) {
      try {
        await this.sendMessage(chatId, alertMessage);
      } catch (error) {
        console.error(`Failed to send alert to chat ${chatId}:`, error);
        // Remove chat if it's no longer accessible
        this.alertChatIds.delete(chatId);
      }
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Telegram bot started polling...');

    while (this.isRunning) {
      try {
        const updates: TelegramUpdate[] = await this.getUpdates();
        
        for (const update of updates) {
          this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
          
          if (update.message) {
            await this.handleMessage(update.message);
          }
        }
        
        // Poll every 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Telegram bot polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
      }
    }
  }

  stop() {
    this.isRunning = false;
  }
}

let botInstance: TelegramBot | null = null;

export async function startTelegramBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  
  if (!botToken) {
    console.warn('Telegram bot token not found. Bot will not start.');
    return;
  }

  botInstance = new TelegramBot(botToken);
  botInstance.start();
}

export function stopTelegramBot() {
  if (botInstance) {
    botInstance.stop();
    botInstance = null;
  }
}
