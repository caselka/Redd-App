# Redd - Investment Tracking Platform

A comprehensive investment tracking platform that provides intelligent stock insights and global trade intelligence with advanced technological capabilities and a user-centric design approach.

## Features

- **Portfolio Tracking**: Track multiple transactions per ticker with cost basis calculations
- **Stock Watchlist**: Monitor stocks with real-time price updates and margin of safety calculations
- **Daily Price Logging**: Automated price fetching and historical data storage
- **Investment Analysis**: EPV calculators, DCF models, and value investing tools
- **Global Trade Intelligence**: Interactive trade map with commodity flow visualization
- **Telegram Alerts**: Price notifications and portfolio updates via Telegram bot
- **Email & Google Authentication**: Secure user authentication with multiple options
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with email/password and Google OAuth
- **External APIs**: Alpha Vantage, Yahoo Finance, Mapbox
- **Real-time Features**: WebSocket connections, Telegram bot integration

## Railway Deployment

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push this code to a GitHub repository
3. **PostgreSQL Database**: Railway provides PostgreSQL add-ons

### Environment Variables

Set these environment variables in Railway:

```env
# Database (automatically provided by Railway PostgreSQL add-on)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
SESSION_SECRET=your-random-session-secret-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# External APIs
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Node Environment
NODE_ENV=production
```

### Deployment Steps

1. **Create Railway Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Create new project
   railway new
   ```

2. **Connect GitHub Repository**:
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL

4. **Configure Environment Variables**:
   - Go to your service settings
   - Add all required environment variables listed above

5. **Deploy**:
   - Railway will automatically build and deploy
   - Build command: `npm run build`
   - Start command: `npm start`

### Database Setup

After deployment, run database migrations:

```bash
# Connect to your Railway project
railway link

# Push database schema
railway run npm run db:push
```

## Local Development

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd redd-investment-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create `.env` file with required variables (see Railway section above)

4. **Setup Database**:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## API Keys Setup

### Required APIs

1. **Alpha Vantage** (Stock Data):
   - Get free API key at: https://www.alphavantage.co/support/#api-key
   - 25 requests per day on free tier

2. **Google OAuth** (Authentication):
   - Go to: https://console.developers.google.com/
   - Create new project → Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins

3. **Mapbox** (Trade Map):
   - Get API key at: https://account.mapbox.com/
   - Free tier includes 50,000 map loads per month

### Optional APIs

1. **OpenAI** (AI Analysis):
   - Get API key at: https://platform.openai.com/api-keys
   - Required for AI-powered stock analysis features

2. **Telegram Bot** (Notifications):
   - Create bot via @BotFather on Telegram
   - Get bot token for price alerts

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Express backend
│   ├── auth.ts           # Authentication setup
│   ├── db.ts             # Database configuration
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── price-fetcher.ts  # Stock price automation
│   └── telegram-bot.ts   # Telegram integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
├── railway.json          # Railway deployment config
├── Procfile              # Process definition
└── drizzle.config.ts     # Database migration config
```

## Features Overview

### Investment Tracking
- Add stocks to watchlist with intrinsic value calculations
- Track portfolio holdings with multiple transactions per stock
- Real-time price updates every 5 minutes during market hours

### Analysis Tools
- Earnings Power Value (EPV) calculator
- Discounted Cash Flow (DCF) modeling
- Margin of safety calculations
- Financial ratio analysis

### Global Trade Intelligence
- Interactive world map showing trade flows
- Commodity import/export data visualization
- Country-level trade statistics

### Notifications
- Telegram bot for price alerts
- Email notifications for significant events
- Real-time price change notifications

## Support

For issues and questions:
- Email: support@redd.com
- Documentation: See individual component README files
- GitHub Issues: Report bugs and feature requests

## License

MIT License - see LICENSE file for details

---

**Built by Redgum & Birch, a subsidiary of Caselka Capital**