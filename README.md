# Tsla Global Exchange

A professional cryptocurrency exchange simulation platform built with React, Vite, and Supabase.

## Features

- **Market Data**: Real-time simulated crypto prices and charts.
- **Trading Engine**: Spot and Futures trading interface with order book.
- **Assets Management**: Wallet simulation for Funding and Trading accounts.
- **Admin Console**: Comprehensive dashboard to manage users, issue tokens, and settings.
- **P2P & Mining**: Cloud mining simulation and referral system.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS
- **Charts**: Lightweight Charts (TradingView)
- **Icons**: Lucide React
- **Backend/Auth**: Supabase

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local server:
   ```bash
   npm run dev
   ```

## Deployment

Deployed on Vercel. Ensure the following environment variables are set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

_Last Updated: Production Build Fix_