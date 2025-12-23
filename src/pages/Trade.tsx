import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderType, TradeType } from '../types';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { ChevronDown, Search, Info, X, ArrowUp, ArrowDown, BarChart2, List, Clock, Zap, Settings, AlertTriangle, FileText } from 'lucide-react';

export const Trade: React.FC<{ defaultCoinId?: string }> = ({ defaultCoinId }) => {
  const { marketData, currentUser, placeOrder, userOrders, cancelOrder, t, showNotification, formatPrice } = useStore();
  const [selectedCoinId, setSelectedCoinId] = useState<string>(defaultCoinId || 'bitcoin');

  useEffect(() => {
      if (defaultCoinId && marketData.length > 0) {
          const exists = marketData.find(c => c.id === defaultCoinId);
          if (exists) setSelectedCoinId(defaultCoinId);
      }
  }, [marketData, defaultCoinId]);

  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [priceType, setPriceType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [inputPrice, setInputPrice] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [inputTotal, setInputTotal] = useState<string>('');
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [searchCoin, setSearchCoin] = useState('');
  const [orderTab, setOrderTab] = useState<'OPEN' | 'HISTORY'>('OPEN');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Fixed Error: Added missing image property to fallback object
  const selectedCoin = useMemo(() => marketData.find(c => c.id === selectedCoinId) || marketData[0] || { id: 'bitcoin', symbol: 'btc', current_price: 64000, price_change_percentage_24h: 0, image: 'https://via.placeholder.com/64' }, [marketData, selectedCoinId]);
  const [marketTrades, setMarketTrades] = useState<{price: number, amount: number, time: string, type: 'buy'|'sell'}[]>([]);

  useEffect(() => {
    if (selectedCoin?.current_price) setInputPrice(selectedCoin.current_price.toString());
  }, [selectedCoin.id]);

  useEffect(() => {
    if (!chartContainerRef.current || !selectedCoin.id) return;
    if (chartInstance.current) { chartInstance.current.remove(); }
    const chart = createChart(chartContainerRef.current, { layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#848e9c' }, grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } }, crosshair: { mode: CrosshairMode.Normal }, width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
    // Fixed Error: Cast chart to any to resolve missing addCandlestickSeries type definition
    const series = (chart as any).addCandlestickSeries({ upColor: '#0ecb81', downColor: '#f6465d' });
    chartInstance.current = chart;
    const now = Math.floor(Date.now()/1000);
    series.setData(Array.from({length:100}).map((_,i)=>({time:now-(100-i)*900, open:selectedCoin.current_price, high:selectedCoin.current_price*1.002, low:selectedCoin.current_price*0.998, close:selectedCoin.current_price+(Math.random()-0.5)*10})));
    return () => chart.remove();
  }, [selectedCoin.id]);

  const handleOrder = async () => {
      if(!currentUser) return showNotification('error', t('login_title'));
      const p = parseFloat(inputPrice); const a = parseFloat(inputAmount);
      if(isNaN(a) || a <= 0) return showNotification('error', 'Invalid Amount');
      const success = await placeOrder(selectedCoin.symbol, orderType, TradeType.SPOT, p, a, 1);
      if(success) { setInputAmount(''); setInputTotal(''); }
  };

  const isBuy = orderType === OrderType.BUY;
  const available = currentUser?.tradingWallet.find(a => a.symbol === (isBuy ? 'USDT' : selectedCoin.symbol))?.amount || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <div className="h-16 px-6 bg-[#181a20] border-b border-white/5 flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-8">
              <div className="relative">
                 <button onClick={() => setShowCoinSelector(!showCoinSelector)} className="flex items-center gap-3 text-2xl font-black text-white hover:text-[#0ea5e9] transition-all">
                     <img src={selectedCoin.image} className="w-8 h-8 rounded-full shadow-lg" />
                     {selectedCoin.symbol?.toUpperCase()}/USDT <ChevronDown size={20} />
                 </button>
                 {showCoinSelector && (
                     <div className="absolute top-full left-0 mt-3 w-80 bg-[#1e2329] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[500px] overflow-hidden">
                         <div className="p-4 border-b border-white/5"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#848e9c]" /><input autoFocus type="text" placeholder="Search..." value={searchCoin} onChange={e => setSearchCoin(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 rounded-xl px-4 pl-10 py-3 text-sm focus:border-[#0ea5e9] outline-none text-white" /></div></div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar">
                             {marketData.filter(c => (c.symbol || '').toLowerCase().includes(searchCoin.toLowerCase())).map(c => (
                                 <button key={c.id} onClick={() => { setSelectedCoinId(c.id); setShowCoinSelector(false); }} className={`w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 ${selectedCoinId === c.id ? 'bg-[#0ea5e9]/5 border-l-4 border-[#0ea5e9]' : ''}`}><div className="flex items-center gap-3"><img src={c.image} className="w-6 h-6 rounded-full" /><span className="font-black text-white">{c.symbol?.toUpperCase()}</span></div><span className={`text-xs font-bold ${c.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(c.current_price)}</span></button>
                             ))}
                         </div>
                     </div>
                 )}
              </div>
              <div className="hidden lg:flex gap-10 text-sm">
                  <div><div className="text-[#848e9c] font-bold text-[10px] uppercase mb-0.5">Last Price</div><div className={`font-black font-mono text-lg ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(selectedCoin.current_price)}</div></div>
                  <div><div className="text-[#848e9c] font-bold text-[10px] uppercase mb-0.5">24h Change</div><div className={`font-black font-mono ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{selectedCoin.price_change_percentage_24h?.toFixed(2)}%</div></div>
              </div>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          <div className="w-[320px] bg-[#181a20] border-r border-white/5 flex flex-col shrink-0">
              <div className="px-4 py-3 text-xs font-black text-[#848e9c] border-b border-white/5 uppercase tracking-widest">Order Book</div>
              <div className="flex-1 flex flex-col overflow-hidden py-2">
                  {[...Array(15)].map((_, i) => (
                      <div key={i} className="grid grid-cols-2 px-6 py-[3px] text-xs font-mono cursor-pointer hover:bg-white/5 group" onClick={()=>setInputPrice((selectedCoin.current_price*(1.0001+i*0.0001)).toFixed(6))}>
                          <span className="text-[#f6465d] font-bold group-hover:underline">{formatPrice(selectedCoin.current_price*(1.015-i*0.001))}</span>
                          <span className="text-right text-[#848e9c]">{(Math.random()*2).toFixed(4)}</span>
                      </div>
                  ))}
                  <div className="py-4 px-6 border-y border-white/5 my-2 bg-[#1e2329]/50"><div className={`text-2xl font-black font-mono ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(selectedCoin.current_price)}</div></div>
                  {[...Array(15)].map((_, i) => (
                      <div key={i} className="grid grid-cols-2 px-6 py-[3px] text-xs font-mono cursor-pointer hover:bg-white/5 group" onClick={()=>setInputPrice((selectedCoin.current_price*(0.9999-i*0.0001)).toFixed(6))}>
                          <span className="text-[#0ecb81] font-bold group-hover:underline">{formatPrice(selectedCoin.current_price*(0.985+i*0.001))}</span>
                          <span className="text-right text-[#848e9c]">{(Math.random()*2).toFixed(4)}</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#161a1e]">
              <div className="flex-1 relative" ref={chartContainerRef}></div>
              <div className="h-1/3 bg-[#181a20] border-t border-white/5 flex flex-col">
                  <div className="flex border-b border-white/5 px-6"><button onClick={()=>setOrderTab('OPEN')} className={`py-4 mr-10 text-sm font-black transition-all border-b-2 ${orderTab==='OPEN'?'text-[#0ea5e9] border-[#0ea5e9]':'text-[#848e9c] border-transparent'}`}>Open Orders</button><button onClick={()=>setOrderTab('HISTORY')} className={`py-4 text-sm font-black transition-all border-b-2 ${orderTab==='HISTORY'?'text-[#0ea5e9] border-[#0ea5e9]':'text-[#848e9c] border-transparent'}`}>Order History</button></div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar"><table className="w-full text-left text-xs"><thead className="text-[#848e9c] bg-[#0b0e11] sticky top-0 font-black uppercase"><tr className="border-b border-white/5"><th className="px-6 py-4">Time</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{userOrders.filter(o => orderTab==='OPEN'?o.status==='OPEN':o.status!=='OPEN').map(o => (<tr key={o.id} className="hover:bg-white/5"><td className="px-6 py-4 text-[#848e9c]">{new Date(o.timestamp).toLocaleTimeString()}</td><td className={`px-6 py-4 font-black ${o.type==='BUY'?'text-[#0ecb81]':'text-[#f6465d]'}`}>{o.type} {o.symbol}</td><td className="px-6 py-4 font-mono">{formatPrice(o.price)}</td><td className="px-6 py-4 font-mono">{o.amount}</td><td className="px-6 py-4 text-right">{o.status==='OPEN' && <button onClick={()=>cancelOrder(o.id)} className="text-[#f6465d] font-black hover:bg-[#f6465d]/10 px-3 py-1 rounded-lg border border-[#f6465d]/20 transition-all">Cancel</button>}</td></tr>))}</tbody></table></div>
              </div>
          </div>

          <div className="w-[360px] bg-[#181a20] border-l border-white/5 p-6 flex flex-col shrink-0">
              <div className="flex bg-[#0b0e11] rounded-2xl p-1.5 mb-8 shadow-inner"><button onClick={() => setOrderType(OrderType.BUY)} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${isBuy ? 'bg-[#0ecb81] text-white shadow-xl' : 'text-[#848e9c] hover:text-white'}`}>Buy</button><button onClick={() => setOrderType(OrderType.SELL)} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${!isBuy ? 'bg-[#f6465d] text-white shadow-xl' : 'text-[#848e9c] hover:text-white'}`}>Sell</button></div>
              <div className="space-y-6">
                  <div><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest mb-2 block">Price (USDT)</label><div className="relative"><input type="number" value={inputPrice} onChange={e=>setInputPrice(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 rounded-2xl p-4 text-white font-black font-mono outline-none focus:border-[#0ea5e9] shadow-xl" /><span className="absolute right-4 top-4 text-[#848e9c] text-xs font-black">USDT</span></div></div>
                  <div><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest mb-2 block">Amount ({selectedCoin.symbol?.toUpperCase()})</label><div className="relative"><input type="number" value={inputAmount} onChange={e=>setInputAmount(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 rounded-2xl p-4 text-white font-black font-mono outline-none focus:border-[#0ea5e9] shadow-xl" /><span className="absolute right-4 top-4 text-[#848e9c] text-xs font-black">{selectedCoin.symbol?.toUpperCase()}</span></div></div>
                  <div className="flex justify-between items-center bg-[#1e2329] p-4 rounded-2xl border border-white/5"><span className="text-xs font-bold text-[#848e9c]">Available</span><span className="text-white font-black font-mono">{available.toFixed(4)} {isBuy ? 'USDT' : selectedCoin.symbol?.toUpperCase()}</span></div>
                  <button onClick={handleOrder} className={`w-full py-5 rounded-3xl font-black text-white text-lg shadow-2xl transform active:scale-95 transition-all ${isBuy ? 'bg-[#0ecb81] shadow-[#0ecb81]/20' : 'bg-[#f6465d] shadow-[#f6465d]/20'}`}>Confirm {isBuy ? 'Buy' : 'Sell'} {selectedCoin.symbol?.toUpperCase()}</button>
              </div>
          </div>
      </div>
    </div>
  );
};