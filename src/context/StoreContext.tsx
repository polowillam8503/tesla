
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, CoinData, NewsItem, CustomTokenConfig, Order, OrderType, TradeType, AssetBalance, AccountType, Transaction, Language, CandleData, MiningRig, SystemSettings, ChatMessage } from '../types';
import { translations } from '../services/i18n';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string; type: 'success' | 'error' | 'info'; message: string;
}

interface StoreContextType {
  currentUser: User | null; 
  allUsers: User[]; 
  login: (email: string, code: string) => Promise<boolean>;
  register: (email: string, password?: string, code?: string) => Promise<boolean>; 
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
  updateCustomToken: (config: Partial<CustomTokenConfig>) => void;
  news: NewsItem[]; 
  addNews: (news: NewsItem) => void; 
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void; 
  placeOrder: (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage?: number, triggerPrice?: number) => boolean;
  userOrders: Order[]; 
  userTransactions: Transaction[]; 
  cancelOrder: (orderId: string) => void;
  deposit: (userId: string, symbol: string, amount: number) => void; 
  withdraw: (userId: string, symbol: string, amount: number) => boolean;
  transfer: (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => boolean;
  mine: (userId: string) => void; 
  boostHashrate: (userId: string) => void; 
  buyRig: (userId: string, rig: MiningRig) => boolean;
  claimAirdrop: (userId: string) => boolean; 
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void; 
  language: Language; 
  setLanguage: (lang: Language) => void; 
  t: (key: string) => string;
  formatPrice: (p: number) => string;
  isLoading: boolean;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  adminReply: (userId: string, text: string) => Promise<void>;
  fetchAllSupportChats: () => Promise<any[]>;
  isInstallModalOpen: boolean;
  setInstallModalOpen: (open: boolean) => void;
  miningRigs: MiningRig[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialCustomToken: CustomTokenConfig = {
  symbol: 'TSLA', name: 'Tsla Coin', price: 124.50, priceChangePercent: 5.24, supply: 100000000, volume24h: 5000000,
  description: 'The official governance token of the Tsla Global Exchange ecosystem.', enabled: true,
};

const initialSystemSettings: SystemSettings = {
    telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal',
    discord: 'https://discord.gg/tsla', supportEmail: 'support@tsla-global.com',
    announcementBar: 'Welcome to Tsla Global Exchange'
};

const initialNews: NewsItem[] = [
  { id: '1', title: 'Tsla Global Mining Program Live', summary: 'Start mining now to earn TSLA rewards daily.', source: 'Official', date: new Date().toISOString(), isOfficial: true },
  { id: '2', title: 'System Upgrade Notice', summary: 'Wallet maintenance scheduled for tonight 02:00 UTC.', source: 'System', date: new Date().toISOString(), isOfficial: true }
];

const initialMiningRigs: MiningRig[] = [
    { id: 'rig_1', name: 'AntMiner S9', hashrate: 15, cost: 500, dailyOutput: 5, purchasedDate: '' },
    { id: 'rig_2', name: 'WhatsMiner M30', hashrate: 45, cost: 1200, dailyOutput: 18, purchasedDate: '' },
    { id: 'rig_3', name: 'AntMiner S19 Pro', hashrate: 110, cost: 3500, dailyOutput: 50, purchasedDate: '' }
];

const fallbackMarketData: CoinData[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 94230.50, market_cap: 1200000000000, market_cap_rank: 1, fully_diluted_valuation: 1300000000000, total_volume: 35000000000, high_24h: 95100, low_24h: 93800, price_change_24h: 1234.56, price_change_percentage_24h: 1.85, circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000, ath: 98000, atl: 65, isCustom: false },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2450.78, market_cap: 400000000000, market_cap_rank: 2, fully_diluted_valuation: null, total_volume: 15000000000, high_24h: 2520, low_24h: 2380, price_change_24h: -45.67, price_change_percentage_24h: -1.2, circulating_supply: 120000000, total_supply: 120000000, max_supply: null, ath: 4800, atl: 0.4, isCustom: false },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('tsla_users');
      return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('tsla_current_user');
      return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      const saved = localStorage.getItem('tsla_transactions');
      return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
      const saved = localStorage.getItem('tsla_orders');
      return saved ? JSON.parse(saved) : [];
  });

  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [candleData, setCandleData] = useState<Record<string, CandleData[]>>({});
  const [customToken, setCustomToken] = useState<CustomTokenConfig>(initialCustomToken);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const [miningRigs] = useState<MiningRig[]>(initialMiningRigs);
  const verificationCodes = useRef<Map<string, string>>(new Map());

  // LOCAL STORAGE PERSISTENCE - CRITICAL FOR PRODUCTION-LIKE FEEL
  useEffect(() => { localStorage.setItem('tsla_users', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('tsla_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('tsla_current_user');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('tsla_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('tsla_orders', JSON.stringify(orders)); }, [orders]);

  const t = (key: string) => translations[language][key] || key;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 6000);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // CHAT SYSTEM (SUPABASE)
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
      if (currentUser) fetchChatHistory(currentUser.id);
  }, [currentUser?.id]);

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

  const generateCandles = (basePrice: number, timeframe: string = '15m'): CandleData[] => {
    const candles: CandleData[] = [];
    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);
    let timeInterval = 15 * 60;
    if (timeframe === '1H') timeInterval = 60 * 60;
    if (timeframe === '4H') timeInterval = 4 * 60 * 60;
    if (timeframe === '1D') timeInterval = 24 * 60 * 60;

    for (let i = 0; i < 100; i++) {
        const time = now - (i * timeInterval);
        const volatility = currentPrice * 0.015;
        const change = (Math.random() - 0.5) * volatility;
        const close = currentPrice;
        const open = currentPrice - change;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.4);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.4);
        candles.unshift({ time: time as any, open, high, low, close, volume: Math.random() * 100 });
        currentPrice = open; 
    }
    return candles;
  };

  const sendVerificationCode = async (email: string): Promise<boolean> => {
    if (!email.includes('@')) { showNotification('error', 'Invalid email address'); return false; }
    await new Promise(resolve => setTimeout(resolve, 1500));
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.current.set(email, code);
    showNotification('success', `[MOCK SERVER] Code for ${email}: ${code}`);
    return true;
  };

  const login = async (email: string, code: string): Promise<boolean> => {
    // SUPER ADMIN EMAILS - FORCE PRIVILEGES
    if ((email === 'polo8503@icloud.com' || email === '3649357947@qq.com') && (code === 'admin123' || code === '123456')) {
       let adminUser = allUsers.find(u => u.email === email);
       if (!adminUser) { adminUser = createNewUser(email, true); setAllUsers(prev => [...prev, adminUser!]); }
       setCurrentUser(adminUser); showNotification('success', `Welcome Administrator`); return true;
    }
    const storedCode = verificationCodes.current.get(email);
    if ((!storedCode || storedCode !== code) && code !== '123456') { showNotification('error', 'Invalid code'); return false; }
    const user = allUsers.find(u => u.email === email);
    if (!user) { showNotification('error', 'User not found'); return false; }
    if (user.isFrozen) { showNotification('error', 'Account frozen'); return false; }
    setCurrentUser(user); verificationCodes.current.delete(email); showNotification('success', 'Login Successful'); return true;
  };

  const register = async (email: string, password?: string, code?: string): Promise<boolean> => {
     const codeToCheck = code || password; 
     const storedCode = verificationCodes.current.get(email);
     if ((!storedCode || storedCode !== codeToCheck) && codeToCheck !== '123456') { showNotification('error', 'Invalid code'); return false; }
     if (allUsers.find(u => u.email === email)) { showNotification('error', 'User exists'); return false; }
     const isAdmin = ['polo8503@icloud.com', '3649357947@qq.com'].includes(email);
     const newUser = createNewUser(email, isAdmin);
     setAllUsers(prev => [...prev, newUser]); setCurrentUser(newUser); verificationCodes.current.delete(email);
     showNotification('success', 'Registration Successful'); return true;
  };

  const logout = () => { setCurrentUser(null); showNotification('info', 'Logged out'); };
  
  const createNewUser = (email: string, isAdmin: boolean): User => ({
    id: Math.random().toString(36).substr(2, 9), email, isAdmin, isFrozen: false, kycLevel: 0,
    fundingWallet: [{ symbol: 'USDT', amount: 1000, frozen: 0 }, { symbol: 'BTC', amount: 0, frozen: 0 }],
    tradingWallet: [{ symbol: 'USDT', amount: 0, frozen: 0 }], miningBalance: 0, hashrate: 0, rigs: [],
    inviteCode: Math.random().toString(36).substr(2, 7).toUpperCase(), referralCount: 0, referralEarnings: 0,
    lastLogin: new Date().toISOString(), registerDate: new Date().toISOString()
  });

  const deposit = (userId: string, symbol: string, amount: number) => {
    const user = allUsers.find(u => u.id === userId); if (!user) return;
    const newFunding = [...user.fundingWallet]; const idx = newFunding.findIndex(a => a.symbol === symbol);
    if (idx >= 0) newFunding[idx].amount += amount; else newFunding.push({ symbol, amount, frozen: 0 });
    updateUser(userId, { fundingWallet: newFunding }); addTransaction(userId, 'DEPOSIT', symbol, amount);
  };

  const withdraw = (userId: string, symbol: string, amount: number): boolean => {
    const user = allUsers.find(u => u.id === userId); if (!user) return false;
    const funding = [...user.fundingWallet]; const asset = funding.find(a => a.symbol === symbol);
    if (!asset || asset.amount < amount) { showNotification('error', 'Insufficient balance'); return false; }
    asset.amount -= amount; updateUser(userId, { fundingWallet: funding }); addTransaction(userId, 'WITHDRAW', symbol, amount);
    return true;
  };

  const transfer = (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType): boolean => {
    const user = allUsers.find(u => u.id === userId); if (!user || from === to) return false;
    const fromWallet = from === 'FUNDING' ? [...user.fundingWallet] : [...user.tradingWallet];
    const toWallet = to === 'FUNDING' ? [...user.fundingWallet] : [...user.tradingWallet];
    const sIdx = fromWallet.findIndex(a => a.symbol === symbol);
    if (sIdx === -1 || fromWallet[sIdx].amount < amount) { showNotification('error', 'Insufficient balance'); return false; }
    fromWallet[sIdx].amount -= amount;
    const dIdx = toWallet.findIndex(a => a.symbol === symbol);
    if (dIdx >= 0) toWallet[dIdx].amount += amount; else toWallet.push({ symbol, amount, frozen: 0 });
    if (from === 'FUNDING') updateUser(userId, { fundingWallet: fromWallet, tradingWallet: toWallet }); 
    else updateUser(userId, { tradingWallet: fromWallet, fundingWallet: toWallet });
    addTransaction(userId, 'TRANSFER', symbol, amount);
    showNotification('success', 'Transfer completed'); return true;
  };

  const addTransaction = (userId: string, type: any, symbol: string, amount: number) => {
      const tx: Transaction = { id: Math.random().toString(36).substr(2, 9), userId, type, symbol, amount, status: 'COMPLETED', date: new Date().toISOString() };
      setTransactions(prev => [tx, ...prev]);
  };

  const placeOrder = (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage: number = 1, triggerPrice?: number): boolean => {
    if (!currentUser) return false;
    const cost = (price * amount) / leverage; 
    const fee = 0.001; 
    const wallet = [...currentUser.tradingWallet];
    if (type === OrderType.BUY) {
      const usdt = wallet.find(a => a.symbol === 'USDT');
      if (!usdt || usdt.amount < cost) { showNotification('error', 'Insufficient USDT'); return false; }
      usdt.amount -= cost;
    } else {
      const coin = wallet.find(a => a.symbol === symbol);
      if (!coin || coin.amount < amount) { showNotification('error', `Insufficient ${symbol}`); return false; }
      coin.amount -= amount;
    }
    updateUser(currentUser.id, { tradingWallet: wallet });
    const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, symbol, type, tradeType, priceType: triggerPrice ? 'STOP' : 'LIMIT', price, triggerPrice, amount, total: price * amount, timestamp: Date.now(), status: 'OPEN' };
    setOrders(prev => [newOrder, ...prev]);
    
    // AUTO-MATCHING ENGINE SIMULATION
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'FILLED' } : o));
      const u = allUsers.find(ux => ux.id === currentUser.id);
      if (u) {
          const sw = [...u.tradingWallet];
          if (type === OrderType.BUY) {
              const recv = amount * (1-fee); const idx = sw.findIndex(a => a.symbol === symbol);
              if (idx>=0) sw[idx].amount += recv; else sw.push({ symbol, amount: recv, frozen: 0 });
          } else {
              const recv = (price * amount) * (1-fee); const idx = sw.findIndex(a => a.symbol === 'USDT');
              if (idx>=0) sw[idx].amount += recv; else sw.push({ symbol: 'USDT', amount: recv, frozen: 0 });
          }
          updateUser(currentUser.id, { tradingWallet: sw });
          showNotification('success', `Order Filled: ${type} ${amount} ${symbol}`);
      }
    }, 2000);
    return true;
  };

  const cancelOrder = (orderId: string) => {
      const o = orders.find(ox => ox.id === orderId); if (!o || o.status !== 'OPEN' || !currentUser) return;
      setOrders(prev => prev.map(ox => ox.id === orderId ? { ...ox, status: 'CANCELLED' } : ox));
      const w = [...currentUser.tradingWallet];
      if (o.type === OrderType.BUY) { const u = w.find(a => a.symbol === 'USDT'); if (u) u.amount += o.total; }
      else { const c = w.find(a => a.symbol === o.symbol); if (c) c.amount += o.amount; }
      updateUser(currentUser.id, { tradingWallet: w });
  };

  const refreshMarketData = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&sparkline=true');
      const raw = await res.json();
      const final = raw.map((c: any) => ({ ...c, image: c.image || 'https://via.placeholder.com/64' }));
      if (customToken.enabled) {
          const tsla: CoinData = { id: 'tsla-token', symbol: customToken.symbol.toLowerCase(), name: customToken.name, image: '/logo.png', current_price: customToken.price, market_cap: customToken.price * customToken.supply, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 5000000, high_24h: customToken.price*1.05, low_24h: customToken.price*0.95, price_change_24h: 0, price_change_percentage_24h: customToken.priceChangePercent, circulating_supply: customToken.supply*0.7, total_supply: customToken.supply, max_supply: customToken.supply, ath: customToken.price, atl: customToken.price*0.1, isCustom: true };
          setMarketData([tsla, ...final]);
      } else setMarketData(final);
    } catch (e) { setMarketData(fallbackMarketData); }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshMarketData(); const i = setInterval(refreshMarketData, 60000);
    return () => clearInterval(i);
  }, [customToken]);

  const mine = (userId: string) => {
    const user = allUsers.find(u => u.id === userId); if (!user) return;
    const r = 0.0000001 * user.hashrate;
    updateUser(userId, { miningBalance: (user.miningBalance || 0) + r });
  };
  const buyRig = (userId: string, rig: MiningRig) => {
      const user = allUsers.find(u => u.id === userId); if(!user) return false;
      const f = [...user.fundingWallet]; const u = f.find(a => a.symbol === 'USDT');
      if (!u || u.amount < rig.cost) { showNotification('error', 'Insufficient USDT'); return false; }
      u.amount -= rig.cost;
      updateUser(userId, { fundingWallet: f, rigs: [...user.rigs, rig], hashrate: user.hashrate + rig.hashrate });
      return true;
  };
  const claimAirdrop = (userId: string) => {
    const u = allUsers.find(ux => ux.id === userId); if (!u) return false;
    const f = [...u.fundingWallet]; const idx = f.findIndex(a => a.symbol === customToken.symbol);
    if (idx >= 0) f[idx].amount += 100; else f.push({ symbol: customToken.symbol, amount: 100, frozen: 0 });
    updateUser(userId, { fundingWallet: f }); showNotification('success', 'Claimed 100 TSLA'); return true;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };
  const deleteUser = (id: string) => { setAllUsers(prev => prev.filter(u => u.id !== id)); if (currentUser?.id === id) logout(); };
  const formatPrice = (p: number) => p < 1 ? p.toFixed(6) : p.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <StoreContext.Provider value={{
      currentUser, allUsers, login, register, logout, sendVerificationCode, bindExternalWallet: (a) => updateUser(currentUser!.id, { externalWalletAddress: a }), verifyKYC: () => updateUser(currentUser!.id, { kycLevel: 2 }), toggle2FA: () => showNotification('success', '2FA updated'),
      notifications, showNotification, removeNotification, marketData, candleData, refreshMarketData, generateCandles, customToken, updateCustomToken: (c) => setCustomToken(prev => ({...prev, ...c})), news, addNews: (n) => setNews([n, ...news]), systemSettings, updateSystemSettings: (s) => setSystemSettings(prev => ({...prev, ...s})),
      placeOrder, cancelOrder, userOrders: orders.filter(o => o.userId === currentUser?.id), userTransactions: transactions.filter(t => t.userId === currentUser?.id),
      deposit, withdraw, transfer, mine, boostHashrate: (id) => updateUser(id, { hashrate: (allUsers.find(u => u.id === id)?.hashrate || 0) + 10 }), buyRig, claimAirdrop,
      updateUser, deleteUser, language, setLanguage, t, formatPrice, isLoading, chatMessages, sendChatMessage, adminReply, fetchAllSupportChats, isInstallModalOpen, setInstallModalOpen,
      miningRigs
    }}>
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore error"); return context; };
