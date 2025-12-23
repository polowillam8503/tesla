
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, ArrowLeftRight, Download, Upload, Eye, EyeOff, Link, Copy, History, X } from 'lucide-react';
import { AccountType } from '../types';

export const Assets: React.FC = () => {
  const { currentUser, transfer, deposit, withdraw, marketData, showNotification } = useStore();
  const [activeAccount, setActiveAccount] = useState<AccountType>('FUNDING');
  const [modal, setModal] = useState<'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | null>(null);
  const [form, setForm] = useState({ symbol: 'USDT', amount: '', address: '', from: 'FUNDING' as AccountType, to: 'TRADING' as AccountType });

  if (!currentUser) return <div className="p-20 text-center text-[#848e9c]">Please Log In</div>;

  const wallet = activeAccount === 'FUNDING' ? currentUser.fundingWallet : currentUser.tradingWallet;
  
  const totalValue = wallet.reduce((acc, curr) => {
      const coin = marketData.find(c => c.symbol.toLowerCase() === curr.symbol.toLowerCase());
      return acc + (curr.amount * (coin?.current_price || (curr.symbol === 'USDT' ? 1 : 0)));
  }, 0);

  const handleAction = async () => {
      const amt = parseFloat(form.amount);
      if (modal === 'TRANSFER') await transfer(currentUser.id, form.symbol, amt, form.from, form.to);
      if (modal === 'WITHDRAW') await withdraw(currentUser.id, form.symbol, amt, form.address);
      setModal(null); setForm({ ...form, amount: '', address: '' });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-10 w-full">
      {/* Portfolio Banner */}
      <div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-12 rounded-[40px] border border-white/5 shadow-2xl flex justify-between items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#0ea5e9]/5 skew-x-12 group-hover:bg-[#0ea5e9]/10 transition-all duration-1000"></div>
          <div className="relative z-10 space-y-4">
              <h2 className="text-[#848e9c] text-xs font-bold uppercase tracking-widest">Total Estimated Balance</h2>
              <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-black text-white font-mono tracking-tighter">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-xl font-bold text-[#0ea5e9]">USDT</span>
              </div>
              <div className="flex gap-4 pt-6">
                  <button onClick={() => setModal('DEPOSIT')} className="px-10 py-4 bg-[#f0b90b] text-black font-bold rounded-2xl hover:scale-105 transition-all">Deposit</button>
                  <button onClick={() => setModal('WITHDRAW')} className="px-10 py-4 bg-[#2b3139] text-white font-bold rounded-2xl hover:scale-105 transition-all">Withdraw</button>
                  <button onClick={() => setModal('TRANSFER')} className="px-10 py-4 bg-[#2b3139] text-white font-bold rounded-2xl hover:scale-105 transition-all flex items-center gap-2"><ArrowLeftRight size={18}/> Transfer</button>
              </div>
          </div>
          <div className="hidden lg:block relative z-10 p-8 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/5">
              <div className="text-xs font-bold text-[#848e9c] mb-4 uppercase">Security Status</div>
              <div className="flex gap-2 items-center text-[#0ecb81] font-bold"><div className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse"></div> Secure Account</div>
          </div>
      </div>

      {/* Asset Table */}
      <div className="bg-[#181a20] rounded-[40px] border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
              <button onClick={() => setActiveAccount('FUNDING')} className={`flex-1 py-6 font-bold transition-all ${activeAccount === 'FUNDING' ? 'text-[#0ea5e9] bg-[#0ea5e9]/5 border-b-2 border-[#0ea5e9]' : 'text-[#848e9c]'}`}>Funding Account</button>
              <button onClick={() => setActiveAccount('TRADING')} className={`flex-1 py-6 font-bold transition-all ${activeAccount === 'TRADING' ? 'text-[#0ea5e9] bg-[#0ea5e9]/5 border-b-2 border-[#0ea5e9]' : 'text-[#848e9c]'}`}>Trading Account</button>
          </div>
          <div className="p-8"><table className="w-full text-left whitespace-nowrap"><thead className="text-[#848e9c] text-xs font-bold uppercase tracking-widest"><tr><th className="pb-6">Asset</th><th className="pb-6">Available</th><th className="pb-6">Locked</th><th className="pb-6 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{wallet.map(a => (<tr key={a.symbol} className="hover:bg-white/5 transition-all"><td className="py-6 flex items-center gap-4 font-bold text-lg text-white"> <div className="w-10 h-10 rounded-xl bg-[#2b3139] flex items-center justify-center">{a.symbol[0]}</div> {a.symbol}</td><td className="py-6 font-mono font-bold text-white">{a.amount.toFixed(4)}</td><td className="py-6 font-mono text-[#848e9c]">{a.frozen.toFixed(4)}</td><td className="py-6 text-right"><button onClick={()=>{setForm({...form, symbol: a.symbol}); setModal('TRANSFER');}} className="text-[#0ea5e9] font-bold hover:underline">Transfer</button></td></tr>))}</tbody></table></div>
      </div>

      {/* Modal Overlays */}
      {modal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[200] backdrop-blur-sm">
              <div className="bg-[#1e2329] border border-white/10 p-10 rounded-[30px] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95">
                  <button onClick={() => setModal(null)} className="absolute top-6 right-6 text-[#848e9c] hover:text-white"><X size={24}/></button>
                  <h3 className="text-2xl font-bold text-white mb-8">{modal} Assets</h3>
                  <div className="space-y-6">
                      {modal === 'TRANSFER' && (
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-[10px] text-[#848e9c] font-bold uppercase block mb-1">From</label><select value={form.from} onChange={e=>setForm({...form, from: e.target.value as any})} className="w-full bg-[#0b0e11] border border-white/10 rounded-xl p-3 text-white outline-none"><option value="FUNDING">Funding</option><option value="TRADING">Trading</option></select></div>
                              <div><label className="text-[10px] text-[#848e9c] font-bold uppercase block mb-1">To</label><select value={form.to} onChange={e=>setForm({...form, to: e.target.value as any})} className="w-full bg-[#0b0e11] border border-white/10 rounded-xl p-3 text-white outline-none"><option value="FUNDING">Funding</option><option value="TRADING">Trading</option></select></div>
                          </div>
                      )}
                      {modal === 'WITHDRAW' && (
                          <div><label className="text-[10px] text-[#848e9c] font-bold uppercase block mb-1">Destination Wallet Address</label><input type="text" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 rounded-xl p-3 text-white outline-none font-mono text-sm" placeholder="0x..." /></div>
                      )}
                      <div><label className="text-[10px] text-[#848e9c] font-bold uppercase block mb-1">Amount</label><input type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 rounded-xl p-3 text-white outline-none font-mono text-lg" placeholder="0.00" /></div>
                      <button onClick={handleAction} className="w-full py-4 bg-[#f0b90b] text-black font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all">Confirm {modal}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
