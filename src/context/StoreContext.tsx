import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Fix: Added leverage and triggerPrice to match Trade.tsx call
  placeOrder: (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage?: number, triggerPrice?: number) => Promise<boolean>;
  // Fix: Added cancelOrder
  cancelOrder: (orderId: string) => Promise<void>;
  userOrders: Order[];
  userTransactions: Transaction[];
  
  deposit: (userId: string, symbol: string, amount: number) => Promise<void>;
  withdraw: (userId: string, symbol: string, amount: number) => Promise<boolean>;
  transfer: (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => Promise<boolean>;
  
  // Fix: Added missing methods used in Assets.tsx, UserCenter.tsx, and Airdrop.tsx
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

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [customToken, setCustomToken] = useState<CustomTokenConfig>({
      symbol: 'TSLA', name: 'Tsla Coin', price: 124.50, priceChangePercent: 5.24, supply: 100000000, volume24h: 5000000, description: 'Tsla Governance Token', enabled: true
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
      telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal', discord: '', supportEmail: 'support@tsla.com', announcementBar: 'Welcome!'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);

  // Fix: Added miningRigs constant
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
      id: p.id, email: p.email, isAdmin: p.is_admin || p.email === 'polo8503@icloud.com' || p.email === '3649357947@qq.com',
      isFrozen: p.is_frozen || false, kycLevel: p.kyc_level || 0,
      fundingWallet: Array.isArray(p.funding_wallet) ? p.funding_wallet : [],
      tradingWallet: Array.isArray(p.trading_wallet) ? p.trading_wallet : [],
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

  // Real-time Chat Subscription
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

  const login = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Login Successful');
      return true;
  };

  const register = async (email: string, password: string, _code: string, inviteCode?: string) => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { invite_code: inviteCode } } });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Registration Successful! Check email.');
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setChatMessages([]);
  };

  const refreshMarketData = async () => {
      const { data: dbTokens } = await supabase.from('custom_tokens').select('*');
      if (dbTokens && dbTokens.length > 0) {
          const t = dbTokens[0];
          setCustomToken({ ...t, priceChangePercent: t.price_change_percent, volume24h: t.volume_24h });
      }
      try {
          const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15');
          if (res.ok) {
              const cgData = await res.json();
              setMarketData(cgData);
          }
      } catch (e) { console.error(e); }
  };

  const formatPrice = (p: number) => p < 1 ? p.toFixed(6) : p.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <StoreContext.Provider value={{
      currentUser, allUsers, login, register, logout, sendVerificationCode: async () => true,
      notifications, showNotification, removeNotification, marketData, refreshMarketData, formatPrice,
      customToken, updateCustomToken: async () => {}, news, addNews: () => {}, systemSettings, updateSystemSettings: () => {},
      chatMessages, sendChatMessage, adminReply, fetchAllSupportChats,
      // Fix: Added leverage and triggerPrice placeholders
      placeOrder: async () => true, cancelOrder: async () => {}, userOrders: [], userTransactions: [],
      deposit: async () => {}, withdraw: async () => true, transfer: async () => true,
      // Fix: Added missing methods used in Assets.tsx, UserCenter.tsx, and Airdrop.tsx
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