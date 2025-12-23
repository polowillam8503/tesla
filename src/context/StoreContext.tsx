
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
  bindExternalWallet: (address: string) => void;
  verifyKYC: () => void;
  toggle2FA: () => void;
  
  notifications: Notification[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;

  marketData: CoinData[];
  candleData: Record<string, CandleData[]>;
  refreshMarketData: () => Promise<void>;
  generateCandles: (basePrice: number, timeframe?: string) => CandleData[];
  
  customToken: CustomTokenConfig;
  deployedTokens: CustomTokenConfig[];
  updateCustomToken: (symbol: string, config: Partial<CustomTokenConfig>) => Promise<void>;
  issueNewToken: (config: CustomTokenConfig) => Promise<void>;
  deleteToken: (symbol: string) => Promise<void>;
  
  news: NewsItem[];
  addNews: (news: NewsItem) => void;
  
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  miningRigs: MiningRig[];
  updateMiningRig: (rigId: string, updates: Partial<MiningRig>) => void;

  placeOrder: (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage: number, triggerPrice?: number) => Promise<boolean>;
  userOrders: Order[];
  userTransactions: Transaction[];
  cancelOrder: (orderId: string) => Promise<void>;
  
  deposit: (userId: string, symbol: string, amount: number) => Promise<void>;
  withdraw: (userId: string, symbol: string, amount: number) => Promise<boolean>;
  transfer: (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => Promise<boolean>;
  mine: (userId: string) => void;
  boostHashrate: (userId: string) => void;
  buyRig: (userId: string, rig: MiningRig) => boolean;
  addRigToUser: (userId: string, rig: MiningRig) => void;
  claimAirdrop: (userId: string) => boolean;
  
  updateUser: (userId: string, data: Partial<User>) => void;
  adminUpdateUserPassword: (userId: string, newPass: string) => Promise<void>;
  deleteUser: (userId: string) => void;
  
  fetchPendingDeposits: () => Promise<Transaction[]>;
  approveDeposit: (txId: string, action: 'APPROVE' | 'REJECT') => Promise<void>;

  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (p: number) => string;
  
  isLoading: boolean;
  isInstallModalOpen: boolean;
  setInstallModalOpen: (val: boolean) => void;

  // Chat implementation
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialCustomToken: CustomTokenConfig = {
  symbol: 'TSLA', name: 'Tsla Coin', price: 124.50, priceChangePercent: 5.24, supply: 100000000, volume24h: 5000000,
  description: 'The official governance token of the Tsla Global Exchange ecosystem.', enabled: true,
  contractAddress: '0x123...abc', minWithdraw: 10, feeRate: 0.001, logoUrl: 'https://via.placeholder.com/64/0ea5e9/ffffff?text=T'
};

const initialSystemSettings: SystemSettings = {
    telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal',
    discord: 'https://discord.gg/tsla', supportEmail: 'support@tsla-global.com',
    announcementBar: 'Welcome to Tsla Global Exchange'
};

const coinIcons: Record<string, string> = {
    btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    usdt: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
};

const fallbackMarketData: CoinData[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: coinIcons.btc, current_price: 64230.50, market_cap: 1200000000000, market_cap_rank: 1, fully_diluted_valuation: null, total_volume: 35000000000, high_24h: 65100, low_24h: 63800, price_change_24h: 1234.56, price_change_percentage_24h: 1.85, circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000, ath: 73700, atl: 65, isCustom: false },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: coinIcons.eth, current_price: 3450.78, market_cap: 400000000000, market_cap_rank: 2, fully_diluted_valuation: null, total_volume: 15000000000, high_24h: 3520, low_24h: 3380, price_change_24h: -45.67, price_change_percentage_24h: -1.2, circulating_supply: 120000000, total_supply: 120000000, max_supply: null, ath: 4800, atl: 0.4, isCustom: false },
  { id: 'tether', symbol: 'usdt', name: 'Tether', image: coinIcons.usdt, current_price: 1.00, market_cap: 103000000000, market_cap_rank: 3, fully_diluted_valuation: null, total_volume: 50000000000, high_24h: 1.001, low_24h: 0.999, price_change_24h: 0.00, price_change_percentage_24h: 0.00, circulating_supply: 103000000000, total_supply: 103000000000, max_supply: null, ath: 1.01, atl: 0.99, isCustom: false },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [marketData, setMarketData] = useState<CoinData[]>(fallbackMarketData);
  const [deployedTokens, setDeployedTokens] = useState<CustomTokenConfig[]>([]);
  const [customToken, setCustomToken] = useState<CustomTokenConfig>(initialCustomToken);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const t = (key: string) => translations[language][key] || key;
  const formatPrice = (p: number) => p < 1 ? p.toFixed(8) : p.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const sendChatMessage = (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'USER', timestamp: Date.now() };
      setChatMessages(prev => [...prev, userMsg]);
      // Simulated response
      setTimeout(() => {
          const sysMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: "Thank you for reaching out. A customer service agent will be with you shortly.", sender: 'SYSTEM', timestamp: Date.now() };
          setChatMessages(prev => [...prev, sysMsg]);
      }, 1000);
  };

  const mapProfileToUser = (profile: any): User => ({
      id: profile.id,
      email: profile.email,
      isAdmin: profile.is_admin || profile.email === 'polo8503@icloud.com' || profile.email === '3649357947@qq.com', 
      isFrozen: profile.is_frozen || false,
      kycLevel: profile.kyc_level || 0,
      fundingWallet: Array.isArray(profile.funding_wallet) ? profile.funding_wallet : [],
      tradingWallet: Array.isArray(profile.trading_wallet) ? profile.trading_wallet : [],
      miningBalance: profile.mining_balance || 0,
      hashrate: profile.hashrate || 0,
      rigs: Array.isArray(profile.rigs) ? profile.rigs : [],
      inviteCode: profile.invite_code || '',
      referralCount: profile.referral_count || 0,
      referralEarnings: profile.referral_earnings || 0,
      lastLogin: profile.last_login || new Date().toISOString(),
      registerDate: profile.created_at || new Date().toISOString()
  });

  const fetchAllUsers = async () => {
      try {
          const { data: profiles } = await supabase.from('profiles').select('*');
          if (profiles) setAllUsers(profiles.map(mapProfileToUser));
      } catch (e) { console.error(e); }
  };

  const fetchProfile = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
              if (profile) {
                  const mapped = mapProfileToUser(profile);
                  setCurrentUser(mapped);
                  if (mapped.isAdmin) fetchAllUsers();
              }
          }
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
      fetchProfile();
      refreshMarketData();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Login Successful');
      fetchProfile();
      return true;
  };

  const register = async (email: string, password: string, code: string, inviteCode?: string): Promise<boolean> => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { invite_code: inviteCode } } });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Registration Successful');
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      showNotification('info', 'Logged out');
  };

  const refreshMarketData = async () => {
      let finalData: CoinData[] = [];
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true');
        if (res.ok) {
            const raw = await res.json();
            finalData = raw.map((c: any) => ({ ...c, image: c.image || coinIcons[c.symbol.toLowerCase()] || 'https://via.placeholder.com/64' }));
        } else { finalData = [...fallbackMarketData]; }
      } catch { finalData = [...fallbackMarketData]; }

      const { data: tokens } = await supabase.from('custom_tokens').select('*').order('created_at', { ascending: false });
      const deployed: CustomTokenConfig[] = [];
      
      if (tokens && Array.isArray(tokens)) {
          tokens.forEach((t: any, index: number) => {
              const tokenId = `${t.symbol.toLowerCase()}-token`;
              const coinData: CoinData = {
                  id: tokenId, symbol: t.symbol.toLowerCase(), name: t.name,
                  image: t.logo_url || `https://via.placeholder.com/64/0ea5e9/ffffff?text=${t.symbol[0]}`,
                  current_price: Number(t.price), market_cap: Number(t.price) * Number(t.supply), market_cap_rank: 999, fully_diluted_valuation: null,
                  total_volume: 50000000, high_24h: Number(t.price) * 1.02, low_24h: Number(t.price) * 0.98,
                  price_change_24h: Number(t.price) * (Number(t.price_change_percent) / 100), price_change_percentage_24h: Number(t.price_change_percent),
                  circulating_supply: Number(t.supply), total_supply: Number(t.supply), max_supply: Number(t.supply),
                  ath: Number(t.price), atl: Number(t.price), sparkline_in_7d: { price: Array(168).fill(Number(t.price)) }, isCustom: true
              };
              finalData.unshift(coinData);
              const config: CustomTokenConfig = { symbol: t.symbol, name: t.name, price: Number(t.price), priceChangePercent: Number(t.price_change_percent), supply: Number(t.supply), volume24h: 5000000, description: t.description || '', enabled: true, logoUrl: t.logo_url };
              deployed.push(config);
              if (index === 0) setCustomToken(config);
          });
      }
      setMarketData(finalData);
      setDeployedTokens(deployed);
      setIsLoading(false);
  };

  const issueNewToken = async (config: CustomTokenConfig) => {
      const { error } = await supabase.from('custom_tokens').insert({
          symbol: config.symbol.toUpperCase(),
          name: config.name,
          price: config.price,
          supply: config.supply,
          logo_url: config.logoUrl || '',
          description: config.description || '',
          price_change_percent: config.priceChangePercent || 0
      });
      if (!error) { showNotification('success', 'Token Issued Successfully'); refreshMarketData(); }
      else showNotification('error', 'Token Issue Failed: ' + error.message);
  };

  const updateCustomToken = async (symbol: string, config: Partial<CustomTokenConfig>) => {
      const { error } = await supabase.from('custom_tokens').update(config).eq('symbol', symbol);
      if (!error) { showNotification('success', 'Token Updated'); refreshMarketData(); }
  };

  const deleteToken = async (symbol: string) => {
      const { error } = await supabase.from('custom_tokens').delete().eq('symbol', symbol);
      if (!error) { showNotification('success', 'Token Deleted'); refreshMarketData(); }
  };

  const placeOrder = async (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage: number) => {
      if (!currentUser) return false;
      const wallet = [...currentUser.tradingWallet];
      const total = price * amount;
      if (type === OrderType.BUY) {
          const usdt = wallet.find(a => a.symbol === 'USDT');
          if (!usdt || usdt.amount < total) { showNotification('error', 'Insufficient USDT'); return false; }
          usdt.amount -= total; usdt.frozen = (usdt.frozen || 0) + total;
      } else {
          const asset = wallet.find(a => a.symbol === symbol);
          if (!asset || asset.amount < amount) { showNotification('error', `Insufficient ${symbol}`); return false; }
          asset.amount -= amount; asset.frozen = (asset.frozen || 0) + amount;
      }
      const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, symbol, type, tradeType, priceType: 'LIMIT', price, amount, total, timestamp: Date.now(), status: 'OPEN' };
      setUserOrders(prev => [newOrder, ...prev]);
      await supabase.from('profiles').update({ trading_wallet: wallet }).eq('id', currentUser.id);
      showNotification('success', 'Order Placed');
      return true;
  };

  const cancelOrder = async (orderId: string) => {
      const order = userOrders.find(o => o.id === orderId);
      if (!order || !currentUser) return;
      const wallet = [...currentUser.tradingWallet];
      if (order.type === OrderType.BUY) {
          const usdt = wallet.find(a => a.symbol === 'USDT');
          if (usdt) { usdt.frozen = Math.max(0, (usdt.frozen || 0) - order.total); usdt.amount += order.total; }
      } else {
          const asset = wallet.find(a => a.symbol === order.symbol);
          if (asset) { asset.frozen = Math.max(0, (asset.frozen || 0) - order.amount); asset.amount += order.amount; }
      }
      setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      await supabase.from('profiles').update({ trading_wallet: wallet }).eq('id', currentUser.id);
      showNotification('success', 'Order Cancelled');
  };

  const deposit = async (userId: string, symbol: string, amount: number) => {
      const { error } = await supabase.from('transactions').insert({ user_id: userId, type: 'DEPOSIT', symbol, amount, status: 'PENDING' });
      if (!error) { showNotification('success', 'Deposit Submitted'); }
  };

  const transfer = async (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => {
      if (!currentUser) return false;
      const fromKey = from === 'FUNDING' ? 'funding_wallet' : 'trading_wallet';
      const toKey = to === 'FUNDING' ? 'funding_wallet' : 'trading_wallet';
      const fromWallet = from === 'FUNDING' ? [...currentUser.fundingWallet] : [...currentUser.tradingWallet];
      const toWallet = to === 'FUNDING' ? [...currentUser.fundingWallet] : [...currentUser.tradingWallet];
      const src = fromWallet.find(a => a.symbol === symbol);
      if (!src || src.amount < amount) { showNotification('error', 'Insufficient Balance'); return false; }
      src.amount -= amount;
      const dst = toWallet.find(a => a.symbol === symbol);
      if (dst) dst.amount += amount; else toWallet.push({ symbol, amount, frozen: 0 });
      const { error } = await supabase.from('profiles').update({ [fromKey]: fromWallet, [toKey]: toWallet }).eq('id', userId);
      if (!error) { showNotification('success', 'Transfer Success'); fetchProfile(); return true; }
      return false;
  };

  const updateMiningRig = (rigId: string, updates: Partial<MiningRig>) => {
    showNotification('info', 'Mining rig updated');
  };

  return (
    <StoreContext.Provider value={{
      currentUser, allUsers, login, register, logout, sendVerificationCode: async () => true, bindExternalWallet: () => {}, verifyKYC: () => {}, toggle2FA: () => {},
      notifications, showNotification, removeNotification, marketData, candleData: {}, refreshMarketData, generateCandles: () => [],
      customToken, deployedTokens, updateCustomToken, issueNewToken, deleteToken, news, addNews: () => {}, systemSettings, updateSystemSettings: () => {},
      placeOrder, userOrders, userTransactions, cancelOrder, deposit, withdraw: async () => true, transfer, mine: () => {}, boostHashrate: () => {}, buyRig: () => true, addRigToUser: () => {}, claimAirdrop: () => true,
      updateUser: () => {}, adminUpdateUserPassword: async () => {}, deleteUser: (id) => setAllUsers(prev => prev.filter(u => u.id !== id)), fetchPendingDeposits: async () => [], approveDeposit: async () => {},
      language, setLanguage, t, formatPrice, isLoading, miningRigs: [],
      updateMiningRig, isInstallModalOpen, setInstallModalOpen,
      chatMessages, sendChatMessage
    }}>
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore error"); return context; };
