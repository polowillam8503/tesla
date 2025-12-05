
import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Zap, Flame, Clock, ChevronRight, ChevronLeft, Search, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

const StatCard: React.FC<{ title: string; value: string; sub: string; positive?: boolean }> = ({ title, value, sub, positive }) => (
  <div className="bg-[#1e2329] border border-white/5 p-4 rounded-xl hover:border-[#0ea5e9]/50 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between">
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
    <div className="text-[#848e9c] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between relative z-10">
        {title}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0ea5e9]"/>
    </div>
    <div className="text-xl lg:text-2xl font-bold text-white mb-1 font-mono relative z-10">{value}</div>
    <div className={`text-sm font-medium flex items-center gap-1 relative z-10 ${positive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {sub}
    </div>
  </div>
);

// High Quality SVG Logos for Partners
const PartnerLogos = {
    ETH: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L15.755 2.835L8.5 14.895L16 19.585L23.5 14.895L16.245 2.835L16 2ZM16 21.655L8.5 17.205L16 28.25L23.5 17.205L16 21.655Z" fill="#627EEA"/></svg>,
    BSC: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L4 9L4 23L16 30L28 23V9L16 2Z" fill="#F3BA2F"/></svg>,
    SOL: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 9.5L7.5 6.5H24.5L21.5 9.5H4.5ZM27.5 16L24.5 19H7.5L10.5 16H27.5ZM4.5 22.5L7.5 25.5H24.5L21.5 22.5H4.5Z" fill="#9945FF"/></svg>,
    MATIC: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L6 8V24L16 30L26 24V8L16 2ZM22 16L16 19.5L10 16V12.5L16 9L22 12.5V16Z" fill="#8247E5"/></svg>,
    LINK: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L8 6.5V25.5L16 30L24 25.5V6.5L16 2ZM16 23.5L11 20.5V11.5L16 8.5L21 11.5V20.5L16 23.5Z" fill="#2A5ADA"/></svg>
};

const PartnerLogo: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center justify-center p-4 lg:p-6 bg-[#1e2329] border border-white/5 rounded-xl hover:border-[#0ea5e9] hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all cursor-pointer group w-24 h-24 lg:w-32 lg:h-32">
        <div className="mb-2 lg:mb-3 transform group-hover:scale-110 transition-transform duration-300 scale-75 lg:scale-100">
            {icon}
        </div>
        <span className="text-[10px] lg:text-xs font-bold text-[#848e9c] group-hover:text-white transition-colors">{name}</span>
    </div>
);

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { marketData, customToken, news, t, formatPrice } = useStore();
  const [marketTab, setMarketTab] = useState<'HOT' | 'GAINERS' | 'LOSERS' | 'NEW'>('HOT');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const topCoins = useMemo(() => {
      if (!marketData || !Array.isArray(marketData)) return [];
      let data = [...marketData];
      if (marketTab === 'HOT') return data.sort((a,b) => (b.total_volume || 0) - (a.total_volume || 0)).slice(0, 5);
      if (marketTab === 'GAINERS') return data.sort((a,b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
      if (marketTab === 'LOSERS') return data.sort((a,b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);
      if (marketTab === 'NEW') return data.filter(c => c.isCustom).concat(data.slice(0, 4));
      return data;
  }, [marketData, marketTab]);

  const filteredCoins = useMemo(() => {
      if (!marketData || !Array.isArray(marketData)) return [];
      return marketData.filter(c => 
          (c.symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
          (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
  }, [marketData, searchTerm]);

  const paginatedCoins = useMemo(() => {
      const start = (page - 1) * itemsPerPage;
      return filteredCoins.slice(start, start + itemsPerPage);
  }, [filteredCoins, page]);

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
  
  const featureCoinId = customToken ? `${customToken.symbol.toLowerCase()}-token` : 'bitcoin';

  const getCoinPrice = (sym: string) => {
      const c = marketData.find(c => c.symbol === sym);
      return c ? (c.current_price || 0) : 0;
  };
  const getCoinChange = (sym: string) => {
      const c = marketData.find(c => c.symbol === sym);
      return c ? (c.price_change_percentage_24h || 0) : 0;
  };

  return (
    <div className="space-y-0 pb-12 bg-[#0b0e11]">
      <div className="bg-[#161a1e] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-20">
          <div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-4">
              {(marketData || []).slice(0, 20).map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-xs font-mono cursor-pointer hover:bg-white/5 px-2 rounded" onClick={() => onNavigate('trade', { coinId: c.id })}>
                      <span className="font-bold text-white">{c.symbol?.toUpperCase() || 'UNK'}</span>
                      <span className={(c.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                          {formatPrice(c.current_price)} ({Number(c.price_change_percentage_24h || 0).toFixed(2)}%)
                      </span>
                  </div>
              ))}
          </div>
      </div>

      <section className="relative py-8 lg:py-20 px-4 lg:px-6 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0ecb81]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl lg:text-7xl font-bold leading-tight tracking-tight text-white">{t('home_title')}</h1>
            <p className="text-sm lg:text-lg text-[#848e9c] max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">{t('home_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <button onClick={() => onNavigate('trade')} className="px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-base lg:text-lg transition-all shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2">{t('trade')} <ArrowRight size={20} /></button>
              <button onClick={() => onNavigate('signup')} className="px-8 py-3 bg-[#2b3139] hover:bg-[#363c45] text-white rounded-xl font-bold text-base lg:text-lg transition-all flex items-center justify-center">{t('signup')}</button>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                 <div className="flex items-center gap-2 text-[#848e9c] font-medium text-xs lg:text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Shield size={14} className="text-[#0ecb81]"/> Bank-Grade Security</div>
                 <div className="flex items-center gap-2 text-[#848e9c] font-medium text-xs lg:text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Zap size={14} className="text-[#f0b90b]"/> 200k TPS Matching</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 order-1 lg:order-2">
             <div className="col-span-2 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] p-5 rounded-xl text-white relative overflow-hidden shadow-2xl cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onNavigate('trade', { coinId: featureCoinId })}>
                <div className="absolute -right-6 -bottom-6 opacity-20 rotate-12"><Zap size={120} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 font-bold text-white/80 text-[10px] uppercase tracking-wider">Premier Listing</div>
                    <div className="text-2xl lg:text-3xl font-bold mb-1">{customToken.name}</div>
                    <div className="text-xs lg:text-sm font-medium opacity-90 mb-4 line-clamp-1">{customToken.description || "The future of decentralized governance"}</div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl lg:text-2xl font-mono font-bold">${formatPrice(customToken.price)}</span>
                        <span className={`bg-white/20 px-2 py-0.5 rounded text-xs font-bold`}>{Number(customToken.priceChangePercent || 0) > 0 ? '+' : ''}{Number(customToken.priceChangePercent || 0)}%</span>
                    </div>
                </div>
             </div>
             
             <StatCard title="BTC/USDT" value={`$${Number(getCoinPrice('btc')).toLocaleString()}`} sub={`${Number(getCoinChange('btc')).toFixed(2)}%`} positive={getCoinChange('btc') > 0} />
             <StatCard title="ETH/USDT" value={`$${Number(getCoinPrice('eth')).toLocaleString()}`} sub={`${Number(getCoinChange('eth')).toFixed(2)}%`} positive={getCoinChange('eth') > 0} />
          </div>
        </div>
      </section>

      <section className="bg-[#181a20] border-y border-white/5 py-3">
         <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-4 text-sm">
            <span className="text-[#f0b90b] font-bold flex items-center gap-2 shrink-0"><TrendingUp size={16} /> Notice</span>
            <div className="flex-1 overflow-hidden">
               <div className="flex gap-12 animate-marquee whitespace-nowrap">{(news || []).map(n => (<span key={n.id} className="text-[#eaecef] hover:text-[#0ea5e9] cursor-pointer transition-colors font-medium">{n.title}</span>))}</div>
            </div>
         </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
             <div className="flex gap-2 p-1 bg-[#1e2329] rounded-lg overflow-x-auto w-full md:w-auto no-scrollbar border border-white/5">
                {[{ id: 'HOT', label: 'Hot', icon: Flame, color: 'text-[#f6465d]' }, { id: 'GAINERS', label: 'Gainers', icon: TrendingUp, color: 'text-[#0ecb81]' }, { id: 'NEW', label: 'New', icon: Clock, color: 'text-[#0ea5e9]' }].map((tab: any) => (<button key={tab.id} onClick={() => setMarketTab(tab.id as any)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-xs lg:text-sm transition-all whitespace-nowrap ${marketTab === tab.id ? 'bg-[#2b3139] text-white shadow ring-1 ring-white/5' : 'text-[#848e9c] hover:text-white'}`}><tab.icon size={14} className={marketTab === tab.id ? tab.color : ''} />{tab.label}</button>))}
            </div>
            <div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-3 text-[#848e9c]" /><input type="text" placeholder={t('search_coin')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="w-full bg-[#1e2329] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#0ea5e9] outline-none transition-all focus:bg-[#2b3139]"/></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8 lg:mb-12">
            {topCoins.map(coin => (
                <div key={coin.id} className="bg-[#1e2329] p-3 lg:p-4 rounded-xl border border-white/5 hover:border-[#0ea5e9]/30 transition-all cursor-pointer group" onClick={() => onNavigate('trade', { coinId: coin.id })}>
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                        <img src={coin.image} alt="" className="w-5 h-5 lg:w-6 lg:h-6 rounded-full group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-white text-xs lg:text-sm">{coin.symbol?.toUpperCase()}</span>
                    </div>
                    <div className="text-sm lg:text-lg font-mono font-bold text-white mb-1">${formatPrice(coin.current_price)}</div>
                    <div className={`text-[10px] lg:text-xs font-bold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{(coin.price_change_percentage_24h || 0) > 0 ? '+' : ''}{Number(coin.price_change_percentage_24h || 0).toFixed(2)}%</div>
                </div>
            ))}
        </div>

        <div className="bg-[#1e2329] rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/5"><h3 className="text-lg font-bold text-white">{t('markets')}</h3><div className="flex gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-[#2b3139] rounded disabled:opacity-50 hover:bg-[#363c45] text-white transition-colors"><ChevronLeft size={16} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-[#2b3139] rounded disabled:opacity-50 hover:bg-[#363c45] text-white transition-colors"><ChevronRight size={16} /></button></div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead><tr className="text-[#848e9c] text-xs uppercase bg-[#2b3139]/30 border-b border-white/5"><th className="px-4 lg:px-6 py-4 font-bold pl-8 tracking-wider">{t('pair')}</th><th className="px-4 lg:px-6 py-4 font-bold tracking-wider">{t('price')}</th><th className="px-4 lg:px-6 py-4 font-bold tracking-wider">{t('change')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden md:table-cell tracking-wider">{t('high')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden md:table-cell tracking-wider">{t('low')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden lg:table-cell tracking-wider">{t('vol')}</th><th className="px-4 lg:px-6 py-4 font-bold text-right pr-8 tracking-wider">{t('action')}</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {paginatedCoins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onNavigate('trade', { coinId: coin.id })}>
                    <td className="px-4 lg:px-6 py-4 pl-8"><div className="flex items-center gap-3 lg:gap-4">{coin.image ? (<img src={coin.image} alt={coin.name} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full shadow-sm" />) : (<div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white">{coin.symbol ? coin.symbol[0].toUpperCase() : '?'}</div>)}<div><div className="font-bold text-white flex items-center gap-2 text-sm lg:text-base">{coin.symbol?.toUpperCase()}{coin.isCustom && <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#f0b90b]/20 text-[#f0b90b] font-bold border border-[#f0b90b]/20">HOT</span>}</div><div className="text-xs text-[#848e9c] font-medium hidden sm:block">{coin.name}</div></div></div></td>
                    <td className="px-4 lg:px-6 py-4 font-medium text-white font-mono text-sm lg:text-base">${formatPrice(coin.current_price)}</td>
                    <td className="px-4 lg:px-6 py-4"><div className={`flex items-center gap-1 font-bold text-sm lg:text-base ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{(coin.price_change_percentage_24h || 0) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</div></td>
                    <td className="px-4 lg:px-6 py-4 text-white hidden md:table-cell font-mono text-sm opacity-90">${formatPrice(coin.high_24h)}</td>
                    <td className="px-4 lg:px-6 py-4 text-white hidden md:table-cell font-mono text-sm opacity-90">${formatPrice(coin.low_24h)}</td>
                    <td className="px-4 lg:px-6 py-4 text-[#848e9c] hidden lg:table-cell font-mono text-sm">${(Number(coin.total_volume || 0) / 1000000).toFixed(2)}M</td>
                    <td className="px-4 lg:px-6 py-4 text-right pr-8"><button className="px-4 lg:px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-[#0ea5e9] hover:text-white border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] rounded-lg transition-all">{t('trade')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
       <section className="py-12 lg:py-20 bg-[#0b0e11]"><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-10 lg:mb-16"><h2 className="text-2xl font-bold text-white mb-2">{t('partners')}</h2><div className="h-1 w-20 bg-[#0ea5e9] mx-auto rounded-full"></div></div><div className="flex flex-wrap justify-center gap-4 lg:gap-10"><PartnerLogo name="Ethereum" icon={PartnerLogos.ETH} /><PartnerLogo name="Binance Chain" icon={PartnerLogos.BSC} /><PartnerLogo name="Solana" icon={PartnerLogos.SOL} /><PartnerLogo name="Polygon" icon={PartnerLogos.MATIC} /><PartnerLogo name="Chainlink" icon={PartnerLogos.LINK} /></div></div></section>
    </div>
  );
};
