
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, ArrowLeftRight, Download, Upload, Eye, EyeOff, Edit2, Link, Plus, Check, Copy, X, Activity, History, PieChart } from 'lucide-react';
import { AccountType } from '../types';

export const Assets: React.FC = () => {
  const { currentUser, transfer, deposit, withdraw, bindExternalWallet, userTransactions, marketData, t, showNotification } = useStore();
  const [activeAccount, setActiveAccount] = useState<AccountType>('FUNDING');
  const [view, setView] = useState<'BALANCES' | 'HISTORY'>('BALANCES');
  const [hideBalance, setHideBalance] = useState(false);
  const [modalType, setModalType] = useState<'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'BIND_WALLET' | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [assetSymbol, setAssetSymbol] = useState('USDT');
  const [walletInput, setWalletInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!currentUser) return <div className="flex flex-col items-center justify-center p-40 text-[#848e9c]"><Wallet size={80} className="mb-6 opacity-10 animate-pulse"/><p className="text-xl font-bold">Please Login to Access Assets</p></div>;

  const wallet = activeAccount === 'FUNDING' ? currentUser.fundingWallet : currentUser.tradingWallet;
  
  const totalUSDT = wallet.reduce((acc, curr) => {
      if (curr.symbol === 'USDT') return acc + (curr.amount || 0);
      const coin = marketData.find(c => c.symbol.toLowerCase() === curr.symbol.toLowerCase());
      const price = coin ? coin.current_price : 0;
      return acc + ((curr.amount || 0) * price);
  }, 0);

  const handleAction = () => {
      const num = parseFloat(amount);
      if (modalType === 'TRANSFER') transfer(currentUser.id, assetSymbol, num, activeAccount, activeAccount === 'FUNDING' ? 'TRADING' : 'FUNDING');
      else if (modalType === 'WITHDRAW') {
          if(!currentUser.externalWalletAddress) { showNotification('error', 'Please bind address first'); return; }
          withdraw(currentUser.id, assetSymbol, num);
      }
      else if (modalType === 'DEPOSIT') deposit(currentUser.id, assetSymbol, num);
      else if (modalType === 'BIND_WALLET') bindExternalWallet(walletInput);
      setModalType(null); setAmount('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 w-full space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-10 lg:p-14 rounded-[40px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[#0ea5e9]/5 skew-x-12 group-hover:bg-[#0ea5e9]/10 transition-colors duration-1000"></div>
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 text-[#848e9c] text-xs font-black uppercase tracking-[0.2em]">
                    Estimated Portfolio Value
                    <button onClick={() => setHideBalance(!hideBalance)} className="p-2 hover:text-white transition-colors">{hideBalance ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                </div>
                <div className="flex items-baseline gap-4">
                    <div className="text-6xl lg:text-8xl font-black text-white font-mono tracking-tighter">{hideBalance ? '******' : totalUSDT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <span className="text-2xl font-black text-[#0ea5e9]">USDT</span>
                </div>
                <div className="flex flex-wrap gap-5 pt-4">
                    <button onClick={() => setModalType('DEPOSIT')} className="px-10 py-5 bg-[#f0b90b] text-black font-black rounded-3xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#f0b90b]/30"><Download size={24}/> Deposit</button>
                    <button onClick={() => setModalType('WITHDRAW')} className="px-10 py-5 bg-[#2b3139] text-white font-black rounded-3xl flex items-center gap-3 hover:bg-[#363c45] hover:scale-105 transition-all"><Upload size={24}/> Withdraw</button>
                    <button onClick={() => setModalType('TRANSFER')} className="px-10 py-5 bg-[#2b3139] text-white font-black rounded-3xl flex items-center gap-3 hover:bg-[#363c45] hover:scale-105 transition-all"><ArrowLeftRight size={24}/> Transfer</button>
                </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-[#1e2329] p-10 rounded-[40px] border border-white/10 flex flex-col justify-between shadow-2xl">
             <div className="space-y-6">
                <div className="text-xs text-[#848e9c] font-black uppercase tracking-widest flex justify-between items-center">
                    Wallet Binding 
                    {currentUser.externalWalletAddress && <button onClick={()=>setModalType('BIND_WALLET')} className="text-[#0ea5e9] hover:underline font-black text-[10px]">REBIND</button>}
                </div>
                {currentUser.externalWalletAddress ? (
                    <div className="bg-[#0b0e11] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]"><Link size={24}/></div>
                            <div>
                                <div className="text-[10px] text-[#848e9c] font-black uppercase">Secure Chain</div>
                                <div className="text-white font-black text-sm">TRC20 Network</div>
                            </div>
                        </div>
                        <div className="text-[#848e9c] font-mono text-sm break-all bg-[#1e2329] p-3 rounded-xl border border-white/5">{currentUser.externalWalletAddress}</div>
                    </div>
                ) : (
                    <button onClick={() => setModalType('BIND_WALLET')} className="w-full py-10 border-2 border-dashed border-white/10 rounded-3xl text-[#848e9c] hover:text-[#0ea5e9] hover:border-[#0ea5e9] hover:bg-[#0ea5e9]/5 transition-all flex flex-col items-center justify-center gap-4 group"><Plus size={32} className="group-hover:rotate-90 transition-transform"/><span className="text-sm font-black uppercase">Bind External Wallet</span></button>
                )}
             </div>
             <div className="pt-8 border-t border-white/5 mt-8"><div className="flex justify-between items-center mb-2"><span className="text-xs font-black text-[#848e9c]">SECURITY STATUS</span><span className="text-[#0ecb81] font-black text-xs">ULTRA SECURE</span></div><div className="w-full h-2 bg-[#0b0e11] rounded-full overflow-hidden shadow-inner"><div className="w-full h-full bg-gradient-to-r from-[#0ea5e9] to-[#0ecb81]"></div></div></div>
          </div>
      </div>

      <div className="bg-[#181a20] rounded-[50px] border border-white/5 overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.6)]">
          <div className="flex border-b border-white/5 bg-[#1e2329]/30">
              <button onClick={() => setView('BALANCES')} className={`flex-1 py-8 font-black text-lg transition-all ${view === 'BALANCES' ? 'text-[#0ea5e9] bg-[#0ea5e9]/5 border-b-4 border-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>Balances</button>
              <button onClick={() => setView('HISTORY')} className={`flex-1 py-8 font-black text-lg transition-all ${view === 'HISTORY' ? 'text-[#0ea5e9] bg-[#0ea5e9]/5 border-b-4 border-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>Transactions</button>
          </div>
          
          <div className="p-8 lg:p-16">
              {view === 'BALANCES' && (
                  <div className="space-y-12">
                      <div className="flex gap-4 p-1.5 bg-[#0b0e11] w-fit rounded-2xl shadow-inner border border-white/5">
                          <button onClick={() => setActiveAccount('FUNDING')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeAccount === 'FUNDING' ? 'bg-[#2b3139] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>Funding Account</button>
                          <button onClick={() => setActiveAccount('TRADING')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeAccount === 'TRADING' ? 'bg-[#2b3139] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}`}>Trading Account</button>
                      </div>
                      <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="text-[#848e9c] text-xs font-black uppercase tracking-[0.2em]"><tr><th className="pb-8">Asset Pair</th><th className="pb-8">Available Balance</th><th className="pb-8">Locked / Frozen</th><th className="pb-8 text-right">Operations</th></tr></thead><tbody className="divide-y divide-white/5">{wallet.map(a => (<tr key={a.symbol} className="group hover:bg-white/5 transition-all"><td className="py-8 flex items-center gap-5"><div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-[#2b3139] to-[#1e2329] flex items-center justify-center text-white font-black text-xl shadow-xl">{a.symbol[0]}</div><span className="font-black text-white text-2xl tracking-tighter">{a.symbol}</span></td><td className="py-8 font-mono font-black text-white text-2xl">{a.amount.toFixed(4)}</td><td className="py-8 font-mono text-[#848e9c] text-lg">{a.frozen.toFixed(4)}</td><td className="py-8 text-right"><button onClick={()=>{setAssetSymbol(a.symbol); setModalType('TRANSFER');}} className="px-6 py-2 border-2 border-[#0ea5e9]/30 text-[#0ea5e9] rounded-xl font-black text-sm hover:bg-[#0ea5e9] hover:text-white transition-all">Transfer</button></td></tr>))}</tbody></table></div>
                  </div>
              )}

              {view === 'HISTORY' && (
                  <div className="overflow-x-auto rounded-[30px] border border-white/5 bg-[#0b0e11]/50"><table className="w-full text-left whitespace-nowrap"><thead className="bg-[#0b0e11] text-[#848e9c] text-xs font-black uppercase tracking-widest"><tr><th className="px-10 py-8">Timestamp</th><th className="px-10 py-8">Action</th><th className="px-10 py-8">Currency</th><th className="px-10 py-8">Quantity</th><th className="px-10 py-8">Status</th></tr></thead><tbody className="divide-y divide-white/5">{userTransactions.map(tx => (<tr key={tx.id} className="hover:bg-white/5 transition-colors"><td className="px-10 py-8 text-[#848e9c] font-mono text-sm">{new Date(tx.date).toLocaleString()}</td><td className="px-10 py-8 font-black text-white text-sm tracking-wide">{tx.type}</td><td className="px-10 py-8 text-white font-black">{tx.symbol}</td><td className={`px-10 py-8 font-mono font-black text-lg ${tx.type === 'DEPOSIT' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toFixed(4)}</td><td className="px-10 py-8"><span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/20">SUCCESS</span></td></tr>))}</tbody></table>{userTransactions.length === 0 && <div className="p-20 text-center text-[#848e9c] font-black uppercase tracking-widest opacity-20">NO RECORDS FOUND</div>}</div>
              )}
          </div>
      </div>
      
      {/* 所有的 Modal 保持原来的逻辑但美化外观 */}
      {modalType && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-[300] backdrop-blur-2xl">
              <div className="bg-[#1e2329] border border-white/10 p-10 rounded-[40px] max-w-lg w-full relative animate-in zoom-in-95 duration-300 shadow-[0_0_100px_rgba(0,0,0,1)]">
                  <button onClick={() => setModalType(null)} className="absolute top-8 right-8 text-[#848e9c] hover:text-white transition-colors"><X size={28} /></button>
                  <h3 className="text-3xl font-black mb-10 text-white tracking-tighter">{modalType}</h3>
                  <div className="space-y-8">
                        {modalType === 'DEPOSIT' && (
                            <div className="bg-[#0b0e11] p-8 rounded-[30px] border border-white/5 text-center shadow-inner">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0xEdd97C7577B9782369DC1E385D31c78f5515d272" className="mx-auto mb-6 border-8 border-white rounded-[20px] shadow-2xl" alt="QR" />
                                <div className="flex items-center gap-3 bg-[#1e2329] p-4 rounded-2xl cursor-pointer hover:bg-[#2b3139] border border-white/5 group" onClick={()=>{navigator.clipboard.writeText("0xEdd97C7577B9782369DC1E385D31c78f5515d272"); setCopied(true); setTimeout(()=>setCopied(false), 2000);}}>
                                    <span className="text-xs font-mono text-white truncate flex-1 opacity-70">0xEdd...d272</span>
                                    {copied ? <Check size={20} className="text-[#0ecb81]"/> : <Copy size={20} className="text-[#f0b90b] group-hover:scale-110 transition-transform"/>}
                                </div>
                            </div>
                        )}
                        <div className="space-y-6">
                            <div><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-[0.2em] mb-3 block">Select Asset</label><select className="w-full bg-[#0b0e11] border border-white/10 rounded-2xl p-5 text-white font-black outline-none focus:border-[#0ea5e9]" value={assetSymbol} onChange={e=>setAssetSymbol(e.target.value)}><option value="USDT">USDT</option><option value="BTC">BTC</option><option value="TSLA">TSLA</option></select></div>
                            <div><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-[0.2em] mb-3 block">Amount to {modalType}</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 rounded-2xl p-5 text-white font-black outline-none focus:border-[#0ea5e9] font-mono text-xl" placeholder="0.00" /></div>
                            {modalType === 'BIND_WALLET' && (<div><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-[0.2em] mb-3 block">Wallet Address (TRC20/ERC20)</label><input type="text" value={walletInput} onChange={e=>setWalletInput(e.target.value)} className="w-full bg-[#0b0e11] border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-[#0ea5e9] font-mono" placeholder="0x..."/></div>)}
                        </div>
                        <button onClick={handleAction} className="w-full py-6 bg-[#f0b90b] text-black font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg">Confirm Action</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
