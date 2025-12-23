import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderType, TradeType } from '../types';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { ChevronDown, Search, Info, X, ArrowUp, ArrowDown, BarChart2, List, Clock, Zap, Settings, Activity } from 'lucide-react';

export const Trade: React.FC<{ defaultCoinId?: string }> = ({ defaultCoinId }) => {
  const { marketData, currentUser, placeOrder, userOrders, cancelOrder, t, formatPrice } = useStore();
  const [selectedCoinId, setSelectedCoinId] = useState<string>(defaultCoinId || 'bitcoin');
  const [tradeMode, setTradeMode] = useState<TradeType>(TradeType.SPOT);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState(20);
  const [historyTab, setHistoryTab] = useState<'OPEN' | 'POSITIONS' | 'TRADES'>('OPEN');
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Fix: Added missing 'id' property to the fallback object to match CoinData type
  const coin = marketData.find(c => c.id === selectedCoinId) || marketData[0] || { id: 'bitcoin', symbol: 'BTC', current_price: 64000, price_change_percentage_24h: 0, image: '' };

  useEffect(() => {
      if (coin.current_price) setPrice(coin.current_price.toString());
  }, [coin.id]);

  useEffect(() => {
    if (!chartContainerRef.current || !coin.id) return;
    if (chartInstance.current) chartInstance.current.remove();

    // Fix: Cast createChart to any to allow access to addCandlestickSeries if library types are incomplete
    const chart = createChart(chartContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#848e9c' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
        crosshair: { mode: CrosshairMode.Normal },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        timeScale: { barSpacing: 12, timeVisible: true }
    }) as any;

    const series = chart.addCandlestickSeries({
        upColor: '#0ecb81', downColor: '#f6465d',
        borderUpColor: '#0ecb81', borderDownColor: '#f6465d',
        wickUpColor: '#0ecb81', wickDownColor: '#f6465d'
    });

    chartInstance.current = chart;
    const now = Math.floor(Date.now()/1000);
    series.setData(Array.from({length: 60}).map((_, i) => ({
        time: now - (60 - i) * 900,
        open: coin.current_price * (1 + (Math.random()-0.5)*0.01),
        high: coin.current_price * 1.01,
        low: coin.current_price * 0.99,
        close: coin.current_price
    })));

    return () => chart.remove();
  }, [coin.id]);

  const handleTrade = () => {
      const p = parseFloat(price); const a = parseFloat(amount);
      if (p > 0 && a > 0) placeOrder(coin.symbol, orderType, tradeMode, p, a, leverage);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0b0e11] overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-[#181a20] border-b border-white/5 flex items-center px-6 gap-8 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
              <img src={coin.image} className="w-6 h-6 rounded-full" />
              {coin.symbol?.toUpperCase()}/USDT
          </div>
          <div className="flex gap-6 text-sm">
              <div className="flex flex-col">
                  <span className="text-[#848e9c] text-[10px] uppercase">Mark Price</span>
                  <span className={`font-mono font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(coin.current_price)}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[#848e9c] text-[10px] uppercase">24h Change</span>
                  <span className={`font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{coin.price_change_percentage_24h?.toFixed(2)}%</span>
              </div>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          {/* Order Book */}
          <div className="w-64 bg-[#181a20] border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3 text-[10px] font-bold text-[#848e9c] border-b border-white/5 flex justify-between">
                  <span>Price(USDT)</span><span>Amount({coin.symbol})</span>
              </div>
              <div className="flex-1 flex flex-col-reverse overflow-hidden py-1">
                  {Array.from({length: 15}).map((_, i) => (
                      <div key={i} className="flex justify-between px-3 py-[2px] text-xs font-mono text-[#f6465d] hover:bg-white/5 cursor-pointer">
                          <span>{(coin.current_price * (1.001 + i*0.001)).toFixed(2)}</span>
                          <span className="text-[#848e9c]">{(Math.random()*1.5).toFixed(4)}</span>
                      </div>
                  ))}
              </div>
              <div className="py-3 px-3 bg-[#1e2329] border-y border-white/5 text-center font-bold text-lg font-mono">
                  {formatPrice(coin.current_price)}
              </div>
              <div className="flex-1 overflow-hidden py-1">
                  {Array.from({length: 15}).map((_, i) => (
                      <div key={i} className="flex justify-between px-3 py-[2px] text-xs font-mono text-[#0ecb81] hover:bg-white/5 cursor-pointer">
                          <span>{(coin.current_price * (0.999 - i*0.001)).toFixed(2)}</span>
                          <span className="text-[#848e9c]">{(Math.random()*1.5).toFixed(4)}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col">
              <div className="flex-1 relative" ref={chartContainerRef}></div>
              
              {/* History Panels */}
              <div className="h-[35%] bg-[#181a20] border-t border-white/5 flex flex-col overflow-hidden">
                  <div className="flex border-b border-white/5 px-6 gap-8">
                      {['OPEN', 'POSITIONS', 'TRADES'].map(tab => (
                          <button key={tab} onClick={() => setHistoryTab(tab as any)} className={`py-3 text-xs font-bold border-b-2 transition-all ${historyTab === tab ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}>
                              {tab}
                          </button>
                      ))}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {historyTab === 'OPEN' && (
                          <table className="w-full text-left text-[11px]">
                              <thead className="bg-[#0b0e11] text-[#848e9c] uppercase sticky top-0">
                                  <tr><th className="p-3">Time</th><th className="p-3">Symbol</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3">Amount</th><th className="p-3 text-right">Action</th></tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                  {userOrders.filter(o => o.status === 'OPEN').map(o => (
                                      <tr key={o.id} className="hover:bg-white/5">
                                          <td className="p-3 text-[#848e9c]">{new Date(o.timestamp).toLocaleTimeString()}</td>
                                          <td className="p-3 text-white font-bold">{o.symbol}</td>
                                          <td className={`p-3 font-bold ${o.type === 'BUY' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{o.tradeType} {o.type}</td>
                                          <td className="p-3 font-mono text-white">{o.price}</td>
                                          <td className="p-3 font-mono text-white">{o.amount}</td>
                                          <td className="p-3 text-right"><button onClick={() => cancelOrder(o.id)} className="text-[#f6465d] hover:underline font-bold">Cancel</button></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
              </div>
          </div>

          {/* Right Trade Sidebar */}
          <div className="w-72 bg-[#181a20] border-l border-white/5 p-4 flex flex-col gap-6 shrink-0">
              <div className="flex bg-[#0b0e11] p-1 rounded-xl">
                  <button onClick={() => setTradeMode(TradeType.SPOT)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tradeMode === TradeType.SPOT ? 'bg-[#2b3139] text-white shadow-xl' : 'text-[#848e9c]'}`}>Spot</button>
                  <button onClick={() => setTradeMode(TradeType.FUTURES)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tradeMode === TradeType.FUTURES ? 'bg-[#2b3139] text-white shadow-xl' : 'text-[#848e9c]'}`}>Futures</button>
              </div>

              <div className="flex p-1 bg-[#0b0e11] rounded-xl">
                  <button onClick={() => setOrderType(OrderType.BUY)} className={`flex-1 py-3 text-xs font-bold rounded-lg ${orderType === OrderType.BUY ? 'bg-[#0ecb81] text-white' : 'text-[#848e9c]'}`}>Buy</button>
                  <button onClick={() => setOrderType(OrderType.SELL)} className={`flex-1 py-3 text-xs font-bold rounded-lg ${orderType === OrderType.SELL ? 'bg-[#f6465d] text-white' : 'text-[#848e9c]'}`}>Sell</button>
              </div>

              {tradeMode === TradeType.FUTURES && (
                  <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[#848e9c] font-bold uppercase"><span>Leverage</span><span>{leverage}x</span></div>
                      <input type="range" min="1" max="125" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))} className="w-full accent-[#f0b90b]" />
                  </div>
              )}

              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-bold text-[#848e9c] uppercase mb-1 block">Price (USDT)</label>
                      <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#0ea5e9] font-mono" />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-[#848e9c] uppercase mb-1 block">Amount ({coin.symbol})</label>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#0ea5e9] font-mono" />
                  </div>
                  <button onClick={handleTrade} className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${orderType === OrderType.BUY ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`}>
                      {orderType === OrderType.BUY ? 'Buy' : 'Sell'} {coin.symbol}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};