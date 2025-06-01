# Railway Deployment Guide for Redd Investment Platform

## Overview
This guide helps you deploy your Redd investment tracking platform to Railway with proper database setup.

## Prerequisites
1. Railway account
2. GitHub repository with your code
3. Required API keys (see Environment Variables section)

## Step-by-Step Deployment

### 1. Create Railway Project
1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Add PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The DATABASE_URL will be automatically set for your main service

### 3. Configure Environment Variables
In your Railway project settings, add these environment variables:

**Required:**
- `DATABASE_URL` (automatically set when you add PostgreSQL)
- `SESSION_SECRET` (generate a random string)

**Optional (for full functionality):**
- `ALPHA_VANTAGE_API_KEY` (for stock prices)
- `OPENAI_API_KEY` (for AI analysis)
- `MAPBOX_ACCESS_TOKEN` (for trade map)
- `VITE_MAPBOX_ACCESS_TOKEN` (same as above, for frontend)
- `GOOGLE_CLIENT_ID` (for Google OAuth)
- `GOOGLE_CLIENT_SECRET` (for Google OAuth)

### 4. Deploy
1. Railway will automatically detect your Node.js app
2. It will run `npm run build` during build
3. Then start with `npm start`

### 5. Run Database Migrations
After successful deployment:
1. Go to your service in Railway
2. Open the "Deploy" tab
3. Click on the latest deployment
4. Open the terminal/console
5. Run: `npm run db:push`

## Common Issues and Solutions

### Issue: "DATABASE_URL must be set"
**Solution:** Make sure you've added a PostgreSQL service to your Railway project.

### Issue: Build fails
**Solution:** Ensure all required dependencies are in package.json and no dev dependencies are required at runtime.

### Issue: App starts but database operations fail
**Solution:** Run database migrations using `npm run db:push` in the Railway console.

## Environment Variables Reference

```bash
# Database (automatically set by Railway PostgreSQL service)
DATABASE_URL=postgresql://username:password@host:port/database

# Session security (generate random string)
SESSION_SECRET=your-super-secret-session-key

# Stock market data (get from Alpha Vantage)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# AI features (get from OpenAI)
OPENAI_API_KEY=your-openai-key

# Maps (get from Mapbox)
MAPBOX_ACCESS_TOKEN=your-mapbox-token
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Post-Deployment Checklist
- [ ] App loads without errors
- [ ] Database connection works
- [ ] Stock price updates are working
- [ ] User authentication functions
- [ ] All required environment variables are set

## Getting API Keys

### Alpha Vantage (Stock Data)
1. Visit https://www.alphavantage.co/support/#api-key
2. Sign up for free API key
3. Add to Railway environment variables

### OpenAI (AI Analysis)
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Add to Railway environment variables

### Mapbox (Trade Maps)
1. Visit https://account.mapbox.com/access-tokens/
2. Create new token
3. Add same token to both MAPBOX_ACCESS_TOKEN and VITE_MAPBOX_ACCESS_TOKEN

### Google OAuth
1. Visit Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add Railway domain to authorized origins
4. Add client ID and secret to environment variables

## Support
If you encounter issues, check the Railway logs in your project dashboard for specific error messages.