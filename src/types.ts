
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

export interface CoinRank {
    id: string;
    label: string;
    icon: any;
    color: string;
}

export interface CandleData {
  time: number | string; // Changed to allow timestamp (number)
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
  frozen: number; // For open orders
}

export interface MiningRig {
  id: string;
  name: string;
  hashrate: number; // MH/s
  cost: number; // USDT
  dailyOutput: number; // TSLA
  purchasedDate: string;
}

export interface ReferralStats {
    totalInvited: number;
    totalEarned: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isFrozen: boolean;
  kycLevel: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  feeRate?: number;
  fundingWallet: AssetBalance[];
  tradingWallet: AssetBalance[];
  miningBalance: number;
  hashrate: number; // Total Hashrate
  rigs: MiningRig[]; // Owned Rigs
  inviteCode: string;
  referralCount: number;
  referralEarnings: number; // USDT
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
  triggerPrice?: number; // For Stop Limit
  amount: number;
  total: number;
  leverage?: number;
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
  contractAddress?: string;
  logoUrl?: string;
  minWithdraw?: number;
  feeRate?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'TRADE_BUY' | 'TRADE_SELL' | 'MINING' | 'ADMIN_ADJUST' | 'RIG_PURCHASE' | 'ORDER_CANCEL';
  symbol: string;
  amount: number;
  price?: number; // For trades
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
}

export interface SystemSettings {
    telegram: string;
    twitter: string;
    discord: string;
    supportEmail: string;
    announcementBar: string;
}

export interface ChatMessage {
    user: string;
    text: string;
    time: string;
}
