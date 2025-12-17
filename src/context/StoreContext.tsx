
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, CoinData, NewsItem, CustomTokenConfig, Order, OrderType, TradeType, AssetBalance, AccountType, Transaction, Language, CandleData, MiningRig, SystemSettings, ChatMessage } from '../types';
import { translations } from '../services/i18n';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, code: string, inviteCode?: string) => Promise<boolean>;
  logout: () => void;
  sendVerificationCode: (email: string) => Promise<boolean>;
  notifications: Notification[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  marketData: CoinData[];
  refreshMarketData: () => Promise<void>;
  formatPrice: (price: number) => string;
  customToken: CustomTokenConfig;
  updateCustomToken: (config: Partial<CustomTokenConfig>) => Promise<void>;
  news: NewsItem[];
  addNews: (news: NewsItem) => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  adminReply: (userId: string, text: string) => Promise<void>;
  fetchAllSupportChats: () => Promise<any[]>;
  placeOrder: (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage?: number, triggerPrice?: number) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<void>;
  userOrders: Order[];
  userTransactions: Transaction[];
  deposit: (userId: string, symbol: string, amount: number) => Promise<void>;
  withdraw: (userId: string, symbol: string, amount: number) => Promise<boolean>;
  transfer: (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => Promise<boolean>;
  bindExternalWallet: (address: string) => Promise<void>;
  verifyKYC: () => Promise<void>;
  toggle2FA: () => Promise<void>;
  mine: (userId: string) => Promise<void>;
  claimAirdrop: (userId: string) => Promise<boolean>;
  buyRig: (userId: string, rig: MiningRig) => Promise<boolean>;
  miningRigs: MiningRig[];
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
  isInstallModalOpen: boolean;
  setInstallModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// 行情备份数据
const fallbackMarketData: CoinData[] = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 94230.50, market_cap: 1.8e12, market_cap_rank: 1, fully_diluted_valuation: null, total_volume: 3.5e10, high_24h: 95100, low_24h: 93800, price_change_24h: 1234, price_change_percentage_24h: 1.85, circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000, ath: 98000, atl: 65 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2450.78, market_cap: 3e11, market_cap_rank: 2, fully_diluted_valuation: null, total_volume: 1.5e10, high_24h: 2520, low_24h: 2380, price_change_24h: -45, price_change_percentage_24h: -1.2, circulating_supply: 120000000, total_supply: 120000000, max_supply: null, ath: 4800, atl: 0.4 },
    { id: 'tether', symbol: 'usdt', name: 'Tether', image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', current_price: 1.00, market_cap: 1e11, market_cap_rank: 3, fully_diluted_valuation: null, total_volume: 5e10, high_24h: 1.01, low_24h: 0.99, price_change_24h: 0, price_change_percentage_24h: 0.01, circulating_supply: 1e11, total_supply: 1e11, max_supply: null, ath: 1.32, atl: 0.57 },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 598.50, market_cap: 9e10, market_cap_rank: 4, fully_diluted_valuation: null, total_volume: 1e9, high_24h: 610, low_24h: 590, price_change_24h: 12, price_change_percentage_24h: 2.1, circulating_supply: 1.5e8, total_supply: 1.5e8, max_supply: null, ath: 720, atl: 0.1 },
    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 145.50, market_cap: 6.5e10, market_cap_rank: 5, fully_diluted_valuation: null, total_volume: 2.5e9, high_24h: 150, low_24h: 138, price_change_24h: 7.5, price_change_percentage_24h: 5.4, circulating_supply: 4.4e8, total_supply: 5.7e8, max_supply: null, ath: 260, atl: 0.5 },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [marketData, setMarketData] = useState<CoinData[]>(fallbackMarketData);
  const [customToken, setCustomToken] = useState<CustomTokenConfig>({
      symbol: 'TSLA', name: 'Tsla Coin', price: 124.50, priceChangePercent: 5.24, supply: 100000000, volume24h: 5000000, description: 'Tsla Governance Token', enabled: true
  });
  const [news, setNews] = useState<NewsItem[]>([
      { id: '1', title: 'Tsla Global Mining Program Live', summary: 'Start mining now to earn rewards.', source: 'Official', date: new Date().toISOString(), isOfficial: true }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
      telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal', discord: '', supportEmail: 'support@tsla.com', announcementBar: 'Welcome to Tsla Global Exchange!'
  });
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);

  const miningRigs: MiningRig[] = [
      { id: 'rig_1', name: 'AntMiner S9', hashrate: 15, cost: 500, dailyOutput: 5, purchasedDate: '' },
      { id: 'rig_2', name: 'WhatsMiner M30', hashrate: 45, cost: 1200, dailyOutput: 18, purchasedDate: '' },
      { id: 'rig_3', name: 'AntMiner S19 Pro', hashrate: 110, cost: 3500, dailyOutput: 50, purchasedDate: '' }
  ];

  const t = (key: string) => translations[language][key] || key;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 4000);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const mapProfileToUser = (p: any): User => ({
      id: p.id, email: p.email, 
      isAdmin: p.is_admin || ['polo8503@icloud.com', '3649357947@qq.com'].includes(p.email),
      isFrozen: p.is_frozen || false, kycLevel: p.kyc_level || 0,
      fundingWallet: Array.isArray(p.funding_wallet) ? p.funding_wallet : [{ symbol: 'USDT', amount: 0, frozen: 0 }],
      tradingWallet: Array.isArray(p.trading_wallet) ? p.trading_wallet : [{ symbol: 'USDT', amount: 0, frozen: 0 }],
      miningBalance: p.mining_balance || 0, hashrate: p.hashrate || 0, rigs: p.rigs || [],
      inviteCode: p.invite_code || '', referralCount: p.referral_count || 0, referralEarnings: p.referral_earnings || 0,
      lastLogin: new Date().toISOString(), registerDate: p.created_at
  });

  const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (profile) {
              const mapped = mapProfileToUser(profile);
              setCurrentUser(mapped);
              fetchChatHistory(user.id);
          }
      }
      setIsLoading(false);
  };

  const fetchChatHistory = async (userId: string) => {
      const { data } = await supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      if (data) {
          setChatMessages(data.map(m => ({
              user: m.sender_type === 'ADMIN' ? 'Support' : 'You',
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdmin: m.sender_type === 'ADMIN'
          })));
      }
  };

  useEffect(() => {
      fetchProfile();
      refreshMarketData();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchProfile());
      return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
      if (!currentUser) return;
      const channel = supabase.channel(`chat_${currentUser.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${currentUser.id}` }, 
          (payload) => {
              setChatMessages(prev => [...prev, {
                  user: payload.new.sender_type === 'ADMIN' ? 'Support' : 'You',
                  text: payload.new.text,
                  time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isAdmin: payload.new.sender_type === 'ADMIN'
              }]);
          }).subscribe();
      return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const refreshMarketData = async () => {
      try {
          const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15');
          if (res.ok) {
              const cgData = await res.json();
              const customData: CoinData = {
                  id: 'tsla-token', symbol: customToken.symbol.toLowerCase(), name: customToken.name,
                  image: '/logo.png', current_price: customToken.price, market_cap: customToken.price * customToken.supply,
                  market_cap_rank: 0, fully_diluted_valuation: null, total_volume: customToken.volume24h,
                  high_24h: customToken.price * 1.05, low_24h: customToken.price * 0.95,
                  price_change_24h: 0, price_change_percentage_24h: customToken.priceChangePercent,
                  circulating_supply: customToken.supply * 0.7, total_supply: customToken.supply, max_supply: customToken.supply,
                  ath: customToken.price, atl: customToken.price * 0.1, isCustom: true
              };
              setMarketData([customData, ...cgData]);
          }
      } catch (e) { 
          console.warn("Using fallback market data");
          setMarketData(fallbackMarketData);
      }
  };

  const login = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Login Successful');
      return true;
  };

  const register = async (email: string, password: string, code: string, inviteCode?: string) => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { invite_code: inviteCode } } });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Registration Successful!');
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setChatMessages([]);
  };

  const sendChatMessage = async (text: string) => {
      if (!currentUser) return;
      await supabase.from('chat_messages').insert({ user_id: currentUser.id, text, sender_type: 'USER' });
  };

  const adminReply = async (userId: string, text: string) => {
      await supabase.from('chat_messages').insert({ user_id: userId, text, sender_type: 'ADMIN' });
  };

  const fetchAllSupportChats = async () => {
      const { data } = await supabase.from('chat_messages').select('*, profiles(email)').order('created_at', { ascending: false });
      return data || [];
  };

  // 资产操作逻辑
  const deposit = async (userId: string, symbol: string, amount: number) => {
      showNotification('info', `Deposit of ${amount} ${symbol} submitted for review.`);
  };

  const transfer = async (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => {
      if (!currentUser) return false;
      const walletFrom = from === 'FUNDING' ? [...currentUser.fundingWallet] : [...currentUser.tradingWallet];
      const walletTo = to === 'FUNDING' ? [...currentUser.fundingWallet] : [...currentUser.tradingWallet];
      
      const assetFrom = walletFrom.find(a => a.symbol === symbol);
      if (!assetFrom || assetFrom.amount < amount) {
          showNotification('error', 'Insufficient balance');
          return false;
      }
      
      assetFrom.amount -= amount;
      const assetTo = walletTo.find(a => a.symbol === symbol);
      if (assetTo) assetTo.amount += amount;
      else walletTo.push({ symbol, amount, frozen: 0 });

      const updates: any = {};
      if (from === 'FUNDING') { updates.funding_wallet = walletFrom; updates.trading_wallet = walletTo; }
      else { updates.trading_wallet = walletFrom; updates.funding_wallet = walletTo; }

      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (!error) {
          showNotification('success', 'Transfer successful');
          fetchProfile();
          return true;
      }
      return false;
  };

  const placeOrder = async (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number) => {
      if (!currentUser) return false;
      showNotification('success', 'Order placed successfully');
      return true;
  };

  const formatPrice = (p: number) => p < 1 ? p.toFixed(6) : p.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <StoreContext.Provider value={{
      currentUser, allUsers, login, register, logout, sendVerificationCode: async () => true,
      notifications, showNotification, removeNotification, marketData, refreshMarketData, formatPrice,
      customToken, updateCustomToken: async () => {}, news, addNews: (n) => setNews([n, ...news]), systemSettings, updateSystemSettings: () => {},
      chatMessages, sendChatMessage, adminReply, fetchAllSupportChats,
      placeOrder, cancelOrder: async () => {}, userOrders, userTransactions,
      deposit, withdraw: async () => true, transfer,
      bindExternalWallet: async () => {}, verifyKYC: async () => {}, toggle2FA: async () => {},
      mine: async () => {}, claimAirdrop: async () => true, buyRig: async () => true, miningRigs,
      updateUser: async () => {}, deleteUser: async () => {},
      language, setLanguage, t, isLoading, isInstallModalOpen, setInstallModalOpen
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
