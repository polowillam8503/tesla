import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderType, TradeType, CoinData } from '../types';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { ChevronDown, Search, Info, X, ArrowUp, ArrowDown, BarChart2, List, Clock, Zap, AlertTriangle, FileText } from 'lucide-react';

export const Trade: React.FC<{ defaultCoinId?: string }> = ({ defaultCoinId }) => {
  const { marketData, currentUser, placeOrder, userOrders, cancelOrder, t, showNotification, formatPrice } = useStore();
  const [selectedCoinId, setSelectedCoinId] = useState<string>(defaultCoinId || 'bitcoin');

  useEffect(() => {
      if (defaultCoinId) {
          setSelectedCoinId(defaultCoinId);
      }
  }, [defaultCoinId]);

  useEffect(() => {
      if (defaultCoinId && marketData.length > 0) {
          const exists = marketData.find(c => c.id === defaultCoinId);
          if (exists) {
              setSelectedCoinId(defaultCoinId);
          }
      }
  }, [marketData, defaultCoinId]);

  const [tradeType] = useState<TradeType>(TradeType.SPOT);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [priceType, setPriceType] = useState<'LIMIT' | 'MARKET' | 'STOP'>('LIMIT');
  const [inputPrice, setInputPrice] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [inputTotal, setInputTotal] = useState<string>('');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [timeframe, setTimeframe] = useState('15m');
  const [searchCoin, setSearchCoin] = useState('');
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const [mobileTab, setMobileTab] = useState<'CHART' | 'BOOK' | 'TRADES' | 'TRADE'>('CHART');
  const [mobileTradeSide, setMobileTradeSide] = useState<'BUY' | 'SELL' | null>(null);
  const [orderTab, setOrderTab] = useState<'OPEN' | 'HISTORY'>('OPEN');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeries = useRef<any>(null);

  const selectedCoin: CoinData = useMemo(() => {
      const coin = marketData.find(c => c.id === selectedCoinId);
      
      const fallbackCoin: CoinData = {
          id: 'bitcoin', 
          symbol: 'btc', 
          name: 'Loading...', 
          current_price: 0, 
          image: '', 
          price_change_percentage_24h: 0, 
          high_24h: 0, 
          total_volume: 0,
          market_cap: 0, 
          circulating_supply: 0, 
          isCustom: false,
          market_cap_rank: 0, 
          fully_diluted_valuation: 0, 
          low_24h: 0, 
          price_change_24h: 0,
          total_supply: 0, 
          max_supply: 0, 
          ath: 0, 
          atl: 0,
          sparkline_in_7d: { price: [] }
      };

      return coin || (marketData.length > 0 ? marketData[0] : fallbackCoin);
  }, [marketData, selectedCoinId]);

  const [marketTrades, setMarketTrades] = useState<{price: number, amount: number, time: string, type: 'buy'|'sell'}[]>([]);

  // Update input price when coin changes OR when admin updates price (re-render)
  useEffect(() => {
    if (selectedCoin && (selectedCoin.current_price || 0) > 0) {
      // Only auto-fill if input is empty or if we switched coins
      if(inputPrice === '' || selectedCoin.id !== selectedCoinId) {
          setInputPrice(Number(selectedCoin.current_price || 0).toString());
      }
    }
  }, [selectedCoin.id, selectedCoin.current_price]);

  const isValidNumber = (val: string) => /^\d*\.?\d*$/.test(val);

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isValidNumber(val)) return;
      setInputPrice(val);
      const p = parseFloat(val); const a = parseFloat(inputAmount);
      if (!isNaN(p) && !isNaN(a)) setInputTotal((p * a).toFixed(4)); 
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isValidNumber(val)) return;
      setInputAmount(val);
      const a = parseFloat(val); const p = parseFloat(inputPrice) || selectedCoin.current_price;
      if (!isNaN(a)) setInputTotal((a * p).toFixed(4)); else setInputTotal('');
  };

  const handleTotalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isValidNumber(val)) return;
      setInputTotal(val);
      const t = parseFloat(val); const p = parseFloat(inputPrice) || selectedCoin.current_price;
      if (!isNaN(t) && p > 0) setInputAmount((t / p).toFixed(6)); else setInputAmount('');
  };

  const handlePercentClick = (pct: number) => {
      const p = parseFloat(inputPrice) || Number(selectedCoin.current_price || 0);
      const wallet = currentUser?.tradingWallet || [];
      if (orderType === OrderType.BUY) {
          const usdt = wallet.find(a => a.symbol === 'USDT')?.amount || 0;
          const maxBuy = usdt * leverage;
          const useTotal = maxBuy * (pct / 100);
          setInputTotal(useTotal.toFixed(4));
          if (p > 0) setInputAmount((useTotal / p).toFixed(6));
      } else {
          const coin = wallet.find(a => a.symbol === selectedCoin.symbol)?.amount || 0;
          const useAmount = coin * (pct / 100);
          setInputAmount(useAmount.toFixed(6));
          if (p > 0) setInputTotal((useAmount * p).toFixed(4));
      }
  };

  const onBookClick = (p: number) => { setInputPrice(p.toString()); setPriceType('LIMIT'); };

  useEffect(() => {
    if (!chartContainerRef.current || !selectedCoin.id) return;
    
    // Dispose old chart if exists
    if (chartInstance.current) {
        try {
            chartInstance.current.remove();
        } catch(e) { console.warn("Chart remove error", e); }
        chartInstance.current = null;
    }

    try {
        const chart = createChart(chartContainerRef.current, { 
            layout: { 
                background: { type: 'Solid' as any, color: '#161a1e' }, // Use string literal to avoid enum import issues
                textColor: '#848e9c', 
            }, 
            grid: { 
                vertLines: { color: 'rgba(255,255,255,0.05)' }, 
                horzLines: { color: 'rgba(255,255,255,0.05)' } 
            }, 
            crosshair: { 
                mode: 1 // CrosshairMode.Normal = 1
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight
        });

        // Ensure chart is valid before adding series
        if (!chart) {
            console.error("Failed to create chart instance");
            return;
        }

        // Cast to any to avoid type check issues with different lightweight-charts versions
        const series = (chart as any).addCandlestickSeries({ 
            upColor: '#0ecb81', 
            downColor: '#f6465d', 
            borderDownColor: '#f6465d', 
            borderUpColor: '#0ecb81', 
            wickDownColor: '#f6465d', 
            wickUpColor: '#0ecb81' 
        });
        
        chartInstance.current = chart; 
        candleSeries.current = series;
        
        const fetchHistory = async () => {
            try {
                if (selectedCoin.isCustom) {
                   let c=Number(selectedCoin.current_price || 100); 
                   const now=Math.floor(Date.now()/1000); 
                   const arr=[];
                   for(let i=0;i<100;i++){
                       const t=now-i*900;
                       const v=c*0.01;
                       const cl=c+(Math.random()-0.5)*v;
                       const o=c;
                       const h=Math.max(o,cl)+v*0.2;
                       const l=Math.min(o,cl)-v*0.2;
                       arr.unshift({time:t as any,open:o,high:h,low:l,close:cl});
                       c=cl;
                   }
                   series.setData(arr);
                } else {
                   const res = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/ohlc?vs_currency=usd&days=1`);
                   if(res.ok) {
                       const data = await res.json();
                       series.setData(data.map((d:any)=>({time:d[0]/1000,open:d[1],high:d[2],low:d[3],close:d[4]})));
                   } else throw new Error();
                }
            } catch {
                // Fallback Generator
                let c=Number(selectedCoin.current_price || 100); 
                const now=Math.floor(Date.now()/1000); 
                const arr=[];
                for(let i=0;i<100;i++){
                    const t=now-i*900;
                    const v=c*0.01;
                    const cl=c+(Math.random()-0.5)*v;
                    const o=c;
                    const h=Math.max(o,cl)+v*0.2;
                    const l=Math.min(o,cl)-v*0.2;
                    arr.unshift({time:t as any,open:o,high:h,low:l,close:cl});
                    c=cl;
                }
                series.setData(arr);
            }
        };
        fetchHistory();

        const handleResize = () => {
            if(chartContainerRef.current && chartInstance.current) { 
                chartInstance.current.applyOptions({ 
                    width: chartContainerRef.current.clientWidth, 
                    height: chartContainerRef.current.clientHeight 
                }); 
            }
        };
        const resizeObserver = new ResizeObserver(() => { window.requestAnimationFrame(handleResize); });
        resizeObserver.observe(chartContainerRef.current);
        
        return () => { 
            resizeObserver.disconnect(); 
            if (chartInstance.current) { 
                try {
                    chartInstance.current.remove(); 
                } catch(e) {}
                chartInstance.current=null; 
            } 
        };
    } catch (err) {
        console.error("Error creating chart:", err);
    }
  }, [selectedCoin.id, timeframe, selectedCoin.current_price]); 

  useEffect(() => { const i = setInterval(()=>{ const t=Math.random()>0.5?'buy':'sell'; const p=(Number(selectedCoin.current_price || 100))*(1+(Math.random()-0.5)*0.001); const a=Math.random(); setMarketTrades(pre=>[{price:p, amount:a, time:new Date().toLocaleTimeString([],{hour12:false}), type:t}, ...pre.slice(0,30)]); },800); return ()=>clearInterval(i); }, [selectedCoin.id]);

  const handleOrder = async () => { 
      if(!currentUser) { showNotification('error', t('login_title')); return; } 
      const p = parseFloat(inputPrice); 
      const a = parseFloat(inputAmount); 
      if(isNaN(a) || a<=0) { showNotification('error', 'Invalid Amount'); return; } 
      const success = await placeOrder(selectedCoin.symbol, orderType, tradeType, p, a, leverage, parseFloat(triggerPrice)); 
      if(success) { 
          setInputAmount(''); 
          setInputTotal(''); 
          if(mobileTradeSide) setMobileTradeSide(null); 
      } 
  };
  const purchasingPower = (currentUser?.tradingWallet.find(a => a.symbol === 'USDT')?.amount || 0) * (orderType === OrderType.BUY ? leverage : 1);
  const estimatedCost = (parseFloat(inputPrice) || Number(selectedCoin.current_price || 0)) * parseFloat(inputAmount) || 0;

  const renderOrderList = () => {
      const filteredOrders = userOrders.filter(o => orderTab === 'OPEN' ? o.status === 'OPEN' : o.status !== 'OPEN');
      return (
          <div className="flex-1 bg-[#181a20] border-t border-white/5 flex flex-col min-h-[250px]">
              <div className="flex border-b border-white/5 px-4"><button onClick={() => setOrderTab('OPEN')} className={`py-3 mr-6 text-sm font-bold border-b-2 transition-colors ${orderTab === 'OPEN' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}>Open Orders</button><button onClick={() => setOrderTab('HISTORY')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${orderTab === 'HISTORY' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}>Order History</button></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar"><table className="w-full text-left text-xs"><thead className="text-[#848e9c] bg-[#0b0e11] sticky top-0"><tr><th className="px-4 py-2">Time</th><th className="px-4 py-2">Symbol</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Price</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Total</th><th className="px-4 py-2">Status</th>{orderTab === 'OPEN' && <th className="px-4 py-2 text-right">Action</th>}</tr></thead><tbody className="divide-y divide-white/5">{filteredOrders.map(o => (<tr key={o.id} className="hover:bg-white/5"><td className="px-4 py-2 text-[#848e9c]">{new Date(o.timestamp).toLocaleTimeString()}</td><td className="px-4 py-2 text-white">{o.symbol.toUpperCase()}</td><td className={`px-4 py-2 font-bold ${o.type === OrderType.BUY ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{o.type}</td><td className="px-4 py-2 text-white">{formatPrice(o.price)}</td><td className="px-4 py-2 text-white">{Number(o.amount || 0).toFixed(4)}</td><td className="px-4 py-2 text-white">{Number(o.total || 0).toFixed(2)}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded ${o.status === 'FILLED' ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : o.status === 'CANCELLED' ? 'bg-[#848e9c]/20 text-[#848e9c]' : 'bg-[#f0b90b]/20 text-[#f0b90b]'}`}>{o.status}</span></td>{orderTab === 'OPEN' && (<td className="px-4 py-2 text-right"><button onClick={() => cancelOrder(o.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded">Cancel</button></td>)}</tr>))}{filteredOrders.length === 0 && (<tr><td colSpan={orderTab === 'OPEN' ? 8 : 7} className="text-center py-8 text-[#848e9c]"><FileText size={24} className="mx-auto mb-2 opacity-50"/>No orders found</td></tr>)}</tbody></table></div>
          </div>
      );
  };

  const isBuy = orderType === OrderType.BUY;
  const btnColor = isBuy ? 'bg-[#0ecb81] shadow-[#0ecb81]/20' : 'bg-[#f6465d] shadow-[#f6465d]/20';
  const btnHover = isBuy ? 'hover:bg-[#0aa869]' : 'hover:bg-[#d9304e]';

  const TradeForm = () => (
      <div className="p-4 bg-[#181a20] h-full flex flex-col">
          <div className="flex bg-[#0b0e11] rounded p-1 mb-5 shrink-0"><button onClick={() => setOrderType(OrderType.BUY)} className={`flex-1 py-2.5 text-sm font-bold rounded transition-all ${isBuy ? 'bg-[#0ecb81] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>{t('buy')}</button><button onClick={() => setOrderType(OrderType.SELL)} className={`flex-1 py-2.5 text-sm font-bold rounded transition-all ${!isBuy ? 'bg-[#f6465d] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>{t('sell')}</button></div>
          <div className="flex justify-between items-center mb-4 shrink-0"><div className="flex gap-4 text-xs font-bold text-[#848e9c]"><button onClick={() => setPriceType('LIMIT')} className={`pb-1 border-b-2 ${priceType === 'LIMIT' ? 'text-white border-[#f0b90b]' : 'border-transparent'}`}>{t('order_limit')}</button><button onClick={() => setPriceType('MARKET')} className={`pb-1 border-b-2 ${priceType === 'MARKET' ? 'text-white border-[#f0b90b]' : 'border-transparent'}`}>{t('order_market')}</button></div><button onClick={() => setShowLeverageModal(true)} className="flex items-center gap-1 text-[#f0b90b] bg-[#2b3139] px-2 py-1 rounded border border-[#f0b90b]/30"><Zap size={12}/> {leverage}x</button></div>
          <div className="space-y-4">
              {priceType === 'STOP' && (<div className="bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors"><span className="text-xs text-[#848e9c] font-bold min-w-[60px]">{t('trigger')}</span><input type="text" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder="0.00"/><span className="text-xs text-[#848e9c] ml-2 font-bold">USDT</span></div>)}
              {priceType !== 'MARKET' ? (<div className={`bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border transition-colors focus-within:border-[#0ea5e9] ${isBuy ? 'border-transparent' : 'border-transparent'}`}><span className="text-xs text-[#848e9c] font-bold min-w-[50px]">{t('price')}</span><input type="text" value={inputPrice} onChange={handlePriceInput} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" /><span className="text-xs text-[#848e9c] ml-2 font-bold min-w-[35px] text-right">USDT</span></div>) : (<div className="w-full bg-[#2b3139]/50 border border-transparent rounded-lg h-10 flex items-center justify-center text-[#848e9c] text-sm italic cursor-not-allowed">Market Best Price</div>)}
              <div className={`bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors`}><span className="text-xs text-[#848e9c] font-bold min-w-[50px]">{t('amount')}</span><input type="text" value={inputAmount} onChange={handleAmountInput} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder="0.00" /><span className="text-xs text-[#848e9c] ml-2 font-bold min-w-[35px] text-right">{selectedCoin.symbol.toUpperCase()}</span></div>
              <div className={`bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors`}><span className="text-xs text-[#848e9c] font-bold min-w-[50px]">{t('total')}</span><input type="text" value={inputTotal} onChange={handleTotalInput} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder="0.00" /><span className="text-xs text-[#848e9c] ml-2 font-bold min-w-[35px] text-right">USDT</span></div>
              <div className="grid grid-cols-4 gap-2">{[25, 50, 75, 100].map(p => (<button key={p} onClick={() => handlePercentClick(p)} className="bg-[#2b3139] hover:bg-[#363c45] text-[10px] py-1 rounded text-[#848e9c] hover:text-white transition-colors">{p}%</button>))}</div>
              <div className="space-y-1 pt-2"><div className="flex justify-between items-center text-xs text-[#848e9c]"><span className="font-medium">{leverage > 1 && isBuy ? 'Buying Power' : 'Available'}</span><span className="text-white font-mono font-bold">{Number(purchasingPower || 0).toFixed(2)} {isBuy ? 'USDT' : selectedCoin.symbol.toUpperCase()}</span></div><div className="flex justify-between items-center text-xs text-[#848e9c]"><span className="font-medium">{t('est_cost')}</span><span className="text-white font-mono font-bold">{Number(estimatedCost || 0).toFixed(2)} USDT</span></div></div>
              <button onClick={handleOrder} className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg mt-2 text-sm uppercase tracking-wide transition-all active:scale-95 ${btnColor} ${btnHover}`}>{isBuy ? t('buy') : t('sell')} {selectedCoin.symbol.toUpperCase()}</button>
          </div>
      </div>
  );

  const renderOrderBook = () => (<div className="flex-1 flex flex-col h-full bg-[#181a20]"><div className="px-4 py-2 grid grid-cols-3 text-[10px] text-[#848e9c] font-bold uppercase border-b border-white/5"><span>{t('price')}</span><span className="text-right">{t('amount')}</span><span className="text-right">{t('total')}</span></div><div className="flex-1 overflow-hidden flex flex-col relative"><div className="flex-1 flex flex-col-reverse justify-end overflow-hidden pb-1">{[...Array(15)].map((_, i) => { const askPrice = (Number(selectedCoin.current_price || 0)) * (1 + (0.0005 * (i+1))); const amount = Math.random() * 2; return (<div key={i} className="grid grid-cols-3 px-4 py-[2px] text-xs relative group cursor-pointer hover:bg-[#1e2329]" onClick={() => onBookClick(askPrice)}><div className="absolute top-0 right-0 h-full bg-[#f6465d]/10 pointer-events-none" style={{ width: `${Math.random()*100}%` }}></div><span className="text-[#f6465d] relative z-10 font-mono group-hover:font-bold">{formatPrice(askPrice)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-90">{Number(amount || 0).toFixed(3)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-60">{Number((askPrice * amount) || 0).toFixed(1)}</span></div>); })}</div><div className="py-2 px-4 border-y border-white/5 bg-[#1e2329] flex items-center justify-between sticky top-0 z-20"><div className="flex items-center gap-2"><span className={`text-lg font-bold font-mono ${(Number(selectedCoin.price_change_percentage_24h || 0)) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(selectedCoin.current_price)}</span>{(Number(selectedCoin.price_change_percentage_24h || 0)) >= 0 ? <ArrowUp size={14} className="text-[#0ecb81]"/> : <ArrowDown size={14} className="text-[#f6465d]"/>}</div></div><div className="flex-1 overflow-hidden pt-1">{[...Array(15)].map((_, i) => { const bidPrice = (Number(selectedCoin.current_price || 0)) * (1 - (0.0005 * (i + 1))); const amount = Math.random() * 2; return (<div key={i} className="grid grid-cols-3 px-4 py-[2px] text-xs relative group cursor-pointer hover:bg-[#1e2329]" onClick={() => onBookClick(bidPrice)}><div className="absolute top-0 right-0 h-full bg-[#0ecb81]/10 pointer-events-none" style={{ width: `${Math.random()*100}%` }}></div><span className="text-[#0ecb81] relative z-10 font-mono group-hover:font-bold">{formatPrice(bidPrice)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-90">{Number(amount || 0).toFixed(3)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-60">{Number((bidPrice * amount) || 0).toFixed(1)}</span></div>); })}</div></div></div>);

  if (!selectedCoin) return <div className="flex items-center justify-center h-full text-[#848e9c]">Loading Market Data...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      <div className="h-14 lg:h-16 px-4 bg-[#181a20] border-b border-white/5 flex items-center justify-between shrink-0 relative z-40"><div className="flex items-center gap-4 lg:gap-8"><div className="relative"><button onClick={() => setShowCoinSelector(!showCoinSelector)} className="flex items-center gap-2 text-lg lg:text-xl font-bold text-white hover:text-[#f0b90b] transition-colors"><img src={selectedCoin.image} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full" onError={(e:any)=>{e.target.src='https://via.placeholder.com/32'}}/> {selectedCoin.symbol.toUpperCase()}/USDT<ChevronDown size={16} /></button>{showCoinSelector && (<div className="absolute top-full left-0 mt-2 w-72 lg:w-80 bg-[#1e2329] border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col max-h-[500px] animate-in fade-in zoom-in-95 duration-150"><div className="p-3 border-b border-white/5"><div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-[#848e9c]" /><input autoFocus type="text" placeholder={t('search_coin')} value={searchCoin} onChange={(e) => setSearchCoin(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded px-3 pl-9 py-2 text-xs focus:border-[#0ea5e9] outline-none text-white" /></div></div><div className="flex-1 overflow-y-auto custom-scrollbar">{marketData.filter(c => c.symbol.toLowerCase().includes(searchCoin.toLowerCase()) || c.name.toLowerCase().includes(searchCoin.toLowerCase())).map(c => (<button key={c.id} onClick={() => { setSelectedCoinId(c.id); setShowCoinSelector(false); }} className={`w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 ${selectedCoinId === c.id ? 'bg-white/5 border-l-2 border-[#0ea5e9]' : ''}`}><div className="flex items-center gap-2 font-bold text-white text-sm"><span>{c.symbol.toUpperCase()}</span><span className="text-[#848e9c] text-xs font-normal">/ USDT</span></div><span className={`text-xs ${(Number(c.price_change_percentage_24h || 0)) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{Number(c.price_change_percentage_24h || 0).toFixed(2)}%</span></button>))}</div></div>)}</div><div className={`text-lg font-mono font-bold lg:hidden ${(Number(selectedCoin.price_change_percentage_24h || 0)) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(selectedCoin.current_price)}</div><div className="flex gap-6 text-xs hidden lg:flex"><div><div className="text-[#848e9c] mb-0.5">{t('price')}</div><span className={`font-mono font-bold ${(Number(selectedCoin.price_change_percentage_24h || 0)) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(selectedCoin.current_price)}</span></div><div><div className="text-[#848e9c] mb-0.5">{t('change')}</div><span className={`font-mono ${(Number(selectedCoin.price_change_percentage_24h || 0)) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{Number(selectedCoin.price_change_percentage_24h || 0).toFixed(2)}%</span></div><div><div className="text-[#848e9c] mb-0.5">{t('high')}</div><span className="text-white font-mono">{formatPrice(selectedCoin.high_24h)}</span></div></div></div><div className="flex items-center gap-4 text-[#848e9c] text-xs"><button onClick={() => setShowCoinInfo(true)} className="hover:text-white flex items-center gap-1 bg-[#2b3139] px-2 py-1 rounded"><Info size={14} /> <span className="hidden lg:inline">Info</span></button></div></div>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="lg:hidden flex border-b border-white/5 bg-[#181a20] shrink-0"><button onClick={() => setMobileTab('CHART')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${mobileTab === 'CHART' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}><BarChart2 size={14}/> Chart</button><button onClick={() => setMobileTab('BOOK')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${mobileTab === 'BOOK' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}><List size={14}/> Book</button><button onClick={() => setMobileTab('TRADES')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${mobileTab === 'TRADES' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}`}><Clock size={14}/> Trades</button></div>
          <div className={`w-full lg:w-[320px] bg-[#181a20] lg:border-r border-white/5 flex flex-col shrink-0 lg:order-1 ${mobileTab === 'BOOK' ? 'flex flex-1' : 'hidden lg:flex'}`}><div className="hidden lg:flex px-4 py-3 border-b border-white/5 items-center justify-between"><span className="text-xs font-bold text-white uppercase">{t('order_book')}</span></div>{renderOrderBook()}</div>
          <div className={`flex-1 flex flex-col bg-[#161a1e] lg:order-2 ${mobileTab === 'CHART' ? 'flex flex-1' : 'hidden lg:flex'}`}><div className="h-10 px-4 border-b border-white/5 flex items-center justify-between bg-[#181a20] shrink-0"><div className="flex gap-1">{['15m', '1H', '4H', '1D'].map(t => (<button key={t} onClick={() => setTimeframe(t)} className={`text-xs font-bold px-3 py-1 rounded hover:bg-white/5 transition-colors ${timeframe === t ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' : 'text-[#848e9c]'}`}>{t}</button>))}</div></div><div className="flex-1 relative w-full h-full" ref={chartContainerRef}></div><div className="h-[35%] min-h-[250px] shrink-0 z-10 border-t border-white/5">{renderOrderList()}</div></div>
          <div className={`w-full lg:w-[350px] bg-[#181a20] border-l border-white/5 flex flex-col shrink-0 lg:order-3 ${mobileTab === 'TRADES' ? 'flex flex-1' : 'hidden lg:flex'}`}><div className="hidden lg:block border-b border-white/5">{TradeForm()}</div><div className="flex-1 flex flex-col overflow-hidden"><div className="px-4 py-2 text-xs font-bold text-[#848e9c] border-b border-white/5">Recent Trades</div><div className="overflow-y-auto flex-1 custom-scrollbar">{marketTrades.map((t,i)=>(<div key={i} className="grid grid-cols-3 px-4 py-1 text-xs"><span className={`font-mono ${t.type==='buy'?'text-[#0ecb81]':'text-[#f6465d]'}`}>{formatPrice(t.price)}</span><span className="text-right text-[#eaecef]">{Number(t.amount || 0).toFixed(4)}</span><span className="text-right text-[#848e9c]">{t.time}</span></div>))}</div></div></div>
      </div>
      <div className="lg:hidden p-2 grid grid-cols-2 gap-2 bg-[#181a20] border-t border-white/5 shrink-0 z-50 safe-area-bottom"><button onClick={() => { setOrderType(OrderType.BUY); setMobileTradeSide('BUY'); }} className="py-3 bg-[#0ecb81] rounded text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">{t('buy')}</button><button onClick={() => { setOrderType(OrderType.SELL); setMobileTradeSide('SELL'); }} className="py-3 bg-[#f6465d] rounded text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">{t('sell')}</button></div>
      {mobileTradeSide && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden flex flex-col justify-end animate-in fade-in duration-200"><div className="bg-[#181a20] rounded-t-2xl p-4 border-t border-white/10 animate-in slide-in-from-bottom duration-200"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">{mobileTradeSide} {selectedCoin.symbol.toUpperCase()}</h3><button onClick={() => setMobileTradeSide(null)} className="p-2 bg-[#2b3139] rounded-full text-white"><X size={16}/></button></div>{TradeForm()}</div></div>)}
      {showCoinInfo && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-[#1e2329] border border-[#2b3139] rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"><div className="flex items-center justify-between p-6 border-b border-white/5"><div className="flex items-center gap-3"><img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" /><div><h3 className="text-xl font-bold text-white">{selectedCoin.name}</h3><div className="text-sm text-[#848e9c] font-bold bg-[#2b3139] px-2 py-0.5 rounded inline-block mt-1">Rank #{selectedCoin.market_cap_rank || 'N/A'}</div></div></div><button onClick={() => setShowCoinInfo(false)} className="text-[#848e9c] hover:text-white"><X size={20}/></button></div><div className="p-6 space-y-6"><div className="grid grid-cols-2 gap-4"><div className="bg-[#0b0e11] p-4 rounded-lg border border-white/5"><div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Market Cap</div><div className="text-white font-mono">${Number(selectedCoin.market_cap || 0).toLocaleString()}</div></div><div className="bg-[#0b0e11] p-4 rounded-lg border border-white/5"><div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Circulating Supply</div><div className="text-white font-mono">{Number(selectedCoin.circulating_supply || 0).toLocaleString()} {selectedCoin.symbol.toUpperCase()}</div></div></div></div></div></div>)}
      {showLeverageModal && (<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-[#1e2329] border border-white/10 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95"><div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">Adjust Leverage</h3><button onClick={() => setShowLeverageModal(false)} className="text-[#848e9c] hover:text-white"><X size={20}/></button></div><div className="mb-8 text-center"><div className="text-4xl font-bold text-[#0ea5e9] font-mono mb-2">{leverage}x</div><p className="text-xs text-[#848e9c]">Max Position: ${(5000000 / leverage).toLocaleString()}</p></div><div className="relative h-2 bg-[#2b3139] rounded-full mb-8"><input type="range" min="1" max="125" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))} className="absolute w-full h-full opacity-0 cursor-pointer z-20" /><div className="absolute top-0 left-0 h-full bg-[#0ea5e9] rounded-full z-10" style={{ width: `${(leverage / 125) * 100}%` }}></div><div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg z-10 pointer-events-none" style={{ left: `${(leverage / 125) * 100}%`, transform: 'translate(-50%, -50%)' }}></div></div><div className="flex justify-between text-xs text-[#848e9c] font-bold"><span>1x</span><span>20x</span><span>50x</span><span>100x</span><span>125x</span></div><div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 rounded p-3 mt-6 flex gap-2"><AlertTriangle size={16} className="text-[#f0b90b] shrink-0" /><p className="text-[10px] text-[#f0b90b] leading-tight">High leverage increases liquidation risk. Please manage your risk accordingly.</p></div><button onClick={() => setShowLeverageModal(false)} className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg text-white font-bold mt-6">Confirm</button></div></div>)}
    </div>
  );
};
