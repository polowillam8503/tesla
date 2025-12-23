
import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Zap, Flame, Clock, ChevronRight, ChevronLeft, Search, ArrowRight } from 'lucide-react';

interface HomeProps { onNavigate: (page: string, params?: any) => void; }

const StatCard: React.FC<{ title: string; value: string; sub: string; positive?: boolean }> = ({ title, value, sub, positive }) => (
  <div className="bg-[#1e2329] border border-white/5 p-5 rounded-2xl hover:border-[#0ea5e9]/50 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between shadow-lg">
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
    <div className="text-[#848e9c] text-xs font-bold uppercase tracking-widest mb-3 relative z-10 flex justify-between">{title} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-[#0ea5e9]"/></div>
    <div className="text-2xl lg:text-3xl font-bold text-white mb-2 font-mono relative z-10">{value}</div>
    <div className={`text-sm font-bold flex items-center gap-1 relative z-10 ${positive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
      {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {sub}
    </div>
  </div>
);

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { marketData, customToken, news, t, formatPrice } = useStore();
  const [marketTab, setMarketTab] = useState<'HOT' | 'GAINERS' | 'LOSERS' | 'NEW'>('HOT');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const topCoins = useMemo(() => {
      if (!marketData || !Array.isArray(marketData)) return [];
      let data = [...marketData];
      if (marketTab === 'HOT') return data.sort((a,b) => (b.total_volume || 0) - (a.total_volume || 0)).slice(0, 5);
      if (marketTab === 'GAINERS') return data.sort((a,b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
      if (marketTab === 'LOSERS') return data.sort((a,b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);
      if (marketTab === 'NEW') return data.filter(c => c.isCustom).concat(data.slice(0, 4));
      return data.slice(0, 5);
  }, [marketData, marketTab]);

  const filteredCoins = useMemo(() => marketData.filter(c => (c.symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())), [marketData, searchTerm]);
  const paginatedCoins = useMemo(() => filteredCoins.slice((page - 1) * itemsPerPage, page * itemsPerPage), [filteredCoins, page]);
  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
  
  const featureCoinId = customToken ? `${customToken.symbol.toLowerCase()}-token` : 'tsla-token';

  return (
    <div className="space-y-0 pb-20 bg-[#0b0e11] w-full overflow-x-hidden">
      <div className="bg-[#161a1e] border-b border-white/5 h-12 flex items-center overflow-hidden relative z-20">
          <div className="flex animate-marquee whitespace-nowrap gap-12 items-center px-6">
              {marketData.slice(0, 20).map(c => (
                  <div key={c.id} className="flex items-center gap-3 text-xs font-mono cursor-pointer hover:text-[#0ea5e9]" onClick={() => onNavigate('trade', { coinId: c.id })}>
                      <span className="font-black text-white">{c.symbol?.toUpperCase()}</span>
                      <span className={(c.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                          {formatPrice(c.current_price)} ({(c.price_change_percentage_24h || 0).toFixed(2)}%)
                      </span>
                  </div>
              ))}
          </div>
      </div>

      <section className="relative py-16 lg:py-28 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-[#0ea5e9]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-8xl font-black leading-[1.1] text-white tracking-tighter">{t('home_title')}</h1>
            <p className="text-lg lg:text-xl text-[#848e9c] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">{t('home_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start">
              <button onClick={() => onNavigate('trade')} className="px-10 py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-[#0ea5e9]/30 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                {t('trade')} <ArrowRight size={22} />
              </button>
              <button onClick={() => onNavigate('signup')} className="px-10 py-4 bg-[#2b3139] hover:bg-[#363c45] text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center transform hover:-translate-y-1">
                {t('signup')}
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
             <div className="col-span-2 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group" onClick={() => onNavigate('trade', { coinId: featureCoinId })}>
                <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Zap size={180} /></div>
                <div className="relative z-10 space-y-4">
                    <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">New Listing Hot</div>
                    <div className="text-4xl font-black">{customToken.name}</div>
                    <div className="text-sm font-bold opacity-80 line-clamp-2">{customToken.description || "Leading the future of decentralized finance ecosystem."}</div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-mono font-black">${formatPrice(customToken.price)}</span>
                        <span className="bg-white/30 px-3 py-1 rounded-xl text-sm font-black">+{customToken.priceChangePercent}%</span>
                    </div>
                </div>
             </div>
             <StatCard title="BTC/USDT" value={`$${(marketData.find(c => c.symbol === 'btc')?.current_price || 0).toLocaleString()}`} sub={`${(marketData.find(c => c.symbol === 'btc')?.price_change_percentage_24h || 0).toFixed(2)}%`} positive={(marketData.find(c => c.symbol === 'btc')?.price_change_percentage_24h || 0) > 0} />
             <StatCard title="ETH/USDT" value={`$${(marketData.find(c => c.symbol === 'eth')?.current_price || 0).toLocaleString()}`} sub={`${(marketData.find(c => c.symbol === 'eth')?.price_change_percentage_24h || 0).toFixed(2)}%`} positive={(marketData.find(c => c.symbol === 'eth')?.price_change_percentage_24h || 0) > 0} />
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
             <div className="flex gap-2 p-1.5 bg-[#1e2329] rounded-2xl border border-white/5 shadow-inner">
                {[{ id: 'HOT', label: 'Hot', icon: Flame, color: 'text-[#f6465d]' }, { id: 'GAINERS', label: 'Gainers', icon: TrendingUp, color: 'text-[#0ecb81]' }, { id: 'NEW', label: 'New', icon: Clock, color: 'text-[#0ea5e9]' }].map((tab: any) => (
                    <button key={tab.id} onClick={() => setMarketTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${marketTab === tab.id ? 'bg-[#2b3139] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>
                        <tab.icon size={16} className={marketTab === tab.id ? tab.color : ''} /> {tab.label}
                    </button>
                ))}
            </div>
            <div className="relative w-full md:w-96 group">
                <Search size={18} className="absolute left-4 top-4 text-[#848e9c] group-focus-within:text-[#0ea5e9] transition-colors" />
                <input type="text" placeholder={t('search_coin')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="w-full bg-[#1e2329] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:border-[#0ea5e9] outline-none transition-all shadow-xl" />
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {topCoins.map(coin => (
                <div key={coin.id} className="bg-[#1e2329] p-6 rounded-3xl border border-white/5 hover:border-[#0ea5e9]/50 transition-all cursor-pointer shadow-xl group hover:-translate-y-1" onClick={() => onNavigate('trade', { coinId: coin.id })}>
                    <div className="flex items-center gap-3 mb-4"><img src={coin.image} alt="" className="w-8 h-8 rounded-full shadow-lg" /><span className="font-black text-white text-sm">{coin.symbol?.toUpperCase()}</span></div>
                    <div className="text-xl font-black text-white mb-2 font-mono">${formatPrice(coin.current_price)}</div>
                    <div className={`text-xs font-black ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                        {(coin.price_change_percentage_24h || 0) > 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-[#181a20] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1e2329]/30">
              <h3 className="text-2xl font-black text-white">Market Pairs</h3>
              <div className="flex gap-3">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 bg-[#2b3139] rounded-xl disabled:opacity-30 hover:bg-[#363c45] text-white transition-all"><ChevronLeft size={20} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-3 bg-[#2b3139] rounded-xl disabled:opacity-30 hover:bg-[#363c45] text-white transition-all"><ChevronRight size={20} /></button>
              </div>
          </div>
          <div className="overflow-x-auto px-4 pb-8"><table className="w-full text-left whitespace-nowrap"><thead className="text-[#848e9c] text-xs font-black uppercase tracking-widest border-b border-white/5"><tr className="bg-transparent"><th className="px-8 py-6">Pair</th><th className="px-8 py-6">Price</th><th className="px-8 py-6">Change</th><th className="px-8 py-6 hidden md:table-cell">24h High</th><th className="px-8 py-6 text-right pr-12">Action</th></tr></thead><tbody className="divide-y divide-white/5">{paginatedCoins.map((coin) => (<tr key={coin.id} className="hover:bg-white/5 transition-all group cursor-pointer" onClick={() => onNavigate('trade', { coinId: coin.id })}><td className="px-8 py-6 flex items-center gap-4"><img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full shadow-lg" /><div><div className="font-black text-white text-lg flex items-center gap-2">{coin.symbol?.toUpperCase()} {coin.isCustom && <span className="px-2 py-0.5 rounded-lg text-[9px] bg-[#f0b90b] text-black font-black">HOT</span>}</div><div className="text-xs text-[#848e9c] font-bold">{coin.name}</div></div></td><td className="px-8 py-6 font-black text-white font-mono text-lg">${formatPrice(coin.current_price)}</td><td className="px-8 py-6"><div className={`flex items-center gap-1 font-black text-lg ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%</div></td><td className="px-8 py-6 text-[#848e9c] hidden md:table-cell font-mono text-sm">${formatPrice(coin.high_24h || 0)}</td><td className="px-8 py-6 text-right pr-12"><button className="px-8 py-3 text-sm font-black text-[#0ea5e9] hover:text-white border-2 border-[#0ea5e9]/30 hover:bg-[#0ea5e9] rounded-2xl transition-all shadow-lg">Trade</button></td></tr>))}</tbody></table></div>
        </div>
      </section>
    </div>
  );
};
