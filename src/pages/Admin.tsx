
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, Lock, Unlock, Trash2, Edit, Megaphone, Coins, LogOut, X, RefreshCw, Key, Shield, Wallet, Hammer } from 'lucide-react';
import { User } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, issueNewToken, updateCustomToken, logout, updateUser, deleteUser, refreshMarketData } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'NEWS' | 'SETTINGS'>('USERS');
  
  const [newToken, setNewToken] = useState({ symbol: '', name: '', price: 1.0, supply: 100000000, priceChangePercent: 0, description: '', logoUrl: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ usdt_fund: 0, usdt_trade: 0, hashrate: 0, kyc: 0, referralEarnings: 0 });

  if (!currentUser?.isAdmin) return <div className="p-40 text-center font-black">ACCESS DENIED</div>;

  const handleIssue = (e: React.FormEvent) => {
      e.preventDefault();
      issueNewToken(newToken as any);
      setNewToken({ symbol: '', name: '', price: 1.0, supply: 100000000, priceChangePercent: 0, description: '', logoUrl: '' });
  };

  const openEdit = (user: User) => {
      setEditingUser(user);
      setEditForm({
          usdt_fund: user.fundingWallet.find(a=>a.symbol==='USDT')?.amount || 0,
          usdt_trade: user.tradingWallet.find(a=>a.symbol==='USDT')?.amount || 0,
          hashrate: user.hashrate,
          kyc: user.kycLevel,
          referralEarnings: user.referralEarnings
      });
  };

  const saveUserEdit = () => {
      if (!editingUser) return;
      const funding = [...editingUser.fundingWallet]; 
      const trade = [...editingUser.tradingWallet];
      const uIdxF = funding.findIndex(a=>a.symbol==='USDT'); if(uIdxF>=0) funding[uIdxF].amount = editForm.usdt_fund;
      const uIdxT = trade.findIndex(a=>a.symbol==='USDT'); if(uIdxT>=0) trade[uIdxT].amount = editForm.usdt_trade;
      
      updateUser(editingUser.id, { fundingWallet: funding, tradingWallet: trade, hashrate: editForm.hashrate, kycLevel: editForm.kyc, referralEarnings: editForm.referralEarnings });
      setEditingUser(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-80 bg-[#181a20] border-r border-white/5 p-8 flex flex-col shadow-2xl">
          <div className="text-[10px] font-black text-[#848e9c] uppercase tracking-[0.3em] mb-10">TSLA Command Center</div>
          <div className="space-y-3 flex-1">
              {[ { id: 'USERS', label: 'User Hub', icon: Users }, { id: 'TOKEN', label: 'Asset Control', icon: Coins }, { id: 'NEWS', label: 'Broadcast', icon: Megaphone }, { id: 'SETTINGS', label: 'System', icon: Settings } ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id ? 'bg-[#0ea5e9] text-white shadow-2xl shadow-[#0ea5e9]/20' : 'text-[#848e9c] hover:bg-white/5'}`}>
                      <item.icon size={20}/> {item.label}
                  </button>
              ))}
          </div>
          <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 text-[#f6465d] font-black text-sm hover:bg-[#f6465d]/10 rounded-2xl transition-all mt-10"><LogOut size={20}/> End Session</button>
      </aside>

      <main className="flex-1 p-12 lg:p-20 overflow-y-auto">
          <div className="max-w-5xl">
            {activeTab === 'USERS' && (
                <div className="bg-[#181a20] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center"><h2 className="text-3xl font-black text-white tracking-tighter">Member Database</h2><button onClick={refreshMarketData} className="p-3 bg-white/5 rounded-2xl hover:text-[#0ea5e9] transition-all"><RefreshCw size={24}/></button></div>
                    <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-[#0b0e11] text-[#848e9c] text-[10px] font-black uppercase tracking-widest"><tr><th className="p-8">Identity</th><th className="p-8">Hashrate</th><th className="p-8">Status</th><th className="p-8 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{allUsers.map(u => (<tr key={u.id} className="hover:bg-white/5 transition-all group"><td className="p-8 font-black text-white">{u.email}<div className="text-[10px] opacity-30">{u.id}</div></td><td className="p-8 font-mono text-[#0ea5e9] font-black">{u.hashrate} MH/s</td><td className="p-8">{u.isFrozen ? <span className="text-red-500 font-bold">FROZEN</span> : <span className="text-[#0ecb81] font-bold">ACTIVE</span>}</td><td className="p-8 text-right"><button onClick={()=>openEdit(u)} className="p-3 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9] hover:text-white transition-all"><Edit size={18}/></button></td></tr>))}</tbody></table></div>
                </div>
            )}

            {activeTab === 'TOKEN' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 bg-[#181a20] p-12 rounded-[50px] border border-white/5 shadow-2xl space-y-10">
                        <div className="space-y-2"><h2 className="text-4xl font-black text-white tracking-tighter">Asset Factory</h2><p className="text-[#848e9c] font-bold">Issue and govern ecosystem tokens</p></div>
                        <form onSubmit={handleIssue} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Symbol</label><input type="text" placeholder="e.g. BTC" value={newToken.symbol} onChange={e=>setNewToken({...newToken, symbol: e.target.value.toUpperCase()})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9]" /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Name</label><input type="text" placeholder="e.g. Bitcoin" value={newToken.name} onChange={e=>setNewToken({...newToken, name: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9]" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Initial Price</label><input type="number" step="0.00000001" value={newToken.price} onChange={e=>setNewToken({...newToken, price: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none" /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Logo URL</label><input type="text" placeholder="https://..." value={newToken.logoUrl} onChange={e=>setNewToken({...newToken, logoUrl: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none" /></div>
                            </div>
                            <button type="submit" className="w-full py-6 bg-[#0ea5e9] text-white rounded-[30px] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Launch Market Pair</button>
                        </form>
                    </div>
                </div>
            )}
          </div>
      </main>

      {/* User Edit Modal */}
      {editingUser && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-[300] backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="bg-[#181a20] border border-white/10 p-12 rounded-[40px] max-w-2xl w-full relative">
                  <button onClick={()=>setEditingUser(null)} className="absolute top-10 right-10 text-[#848e9c] hover:text-white"><X size={28}/></button>
                  <h3 className="text-4xl font-black text-white mb-10 tracking-tighter">Modify Account: {editingUser.email}</h3>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Funding Balance (USDT)</label>
                          <input type="number" value={editForm.usdt_fund} onChange={e=>setEditForm({...editForm, usdt_fund: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] p-5 rounded-2xl text-white font-mono" />
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Mining Hashrate (MH/s)</label>
                          <input type="number" value={editForm.hashrate} onChange={e=>setEditForm({...editForm, hashrate: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] p-5 rounded-2xl text-white font-mono text-[#0ea5e9]" />
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">KYC Level</label>
                          <select value={editForm.kyc} onChange={e=>setEditForm({...editForm, kyc: parseInt(e.target.value)})} className="w-full bg-[#0b0e11] p-5 rounded-2xl text-white font-black"><option value={0}>Tier 0 (Unverified)</option><option value={1}>Tier 1 (Basic)</option><option value={2}>Tier 2 (Pro)</option><option value={3}>Tier 3 (VIP)</option></select>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Risk Level</label>
                          <div className="flex gap-4 p-5 bg-[#0b0e11] rounded-2xl font-black text-sm">
                               <button onClick={()=>updateUser(editingUser.id, { isFrozen: !editingUser.isFrozen })} className={`px-6 py-2 rounded-lg ${editingUser.isFrozen ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{editingUser.isFrozen ? 'UNFREEZE' : 'FREEZE'}</button>
                          </div>
                      </div>
                  </div>
                  <button onClick={saveUserEdit} className="w-full py-6 bg-brand-600 text-white rounded-[30px] font-black text-xl shadow-2xl hover:scale-105 transition-all">Overwrite Database Record</button>
              </div>
          </div>
      )}
    </div>
  );
};
