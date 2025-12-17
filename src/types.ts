
export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'ru' | 'fr' | 'es';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
  isCustom?: boolean;
}

export interface CandleData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
  isOfficial?: boolean;
}

export type AccountType = 'FUNDING' | 'TRADING';

export interface AssetBalance {
  symbol: string;
  amount: number;
  frozen: number;
}

export interface MiningRig {
  id: string;
  name: string;
  hashrate: number;
  cost: number;
  dailyOutput: number;
  purchasedDate: string;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isFrozen: boolean;
  kycLevel: number;
  fundingWallet: AssetBalance[];
  tradingWallet: AssetBalance[];
  miningBalance: number;
  hashrate: number;
  rigs: MiningRig[];
  inviteCode: string;
  referralCount: number;
  referralEarnings: number;
  lastLogin: string;
  registerDate: string;
  externalWalletAddress?: string;
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TradeType {
  SPOT = 'SPOT',
  FUTURES = 'FUTURES'
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: OrderType;
  tradeType: TradeType;
  priceType: 'LIMIT' | 'MARKET' | 'STOP';
  price: number;
  triggerPrice?: number;
  amount: number;
  total: number;
  timestamp: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
}

export interface CustomTokenConfig {
  symbol: string;
  name: string;
  price: number;
  priceChangePercent: number;
  supply: number;
  volume24h: number;
  description: string;
  enabled: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'TRADE_BUY' | 'TRADE_SELL' | 'MINING' | 'RIG_PURCHASE';
  symbol: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
}

export interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isAdmin: boolean;
    user_id?: string;
    created_at?: string;
}

export interface SystemSettings {
    telegram: string;
    twitter: string;
    discord: string;
    supportEmail: string;
    announcementBar: string;
}
