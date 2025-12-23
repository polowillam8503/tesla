
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, AlertTriangle, Lock, Unlock, Trash2, Edit, LayoutDashboard, Megaphone, Coins, LogOut, X, Share2, RefreshCw, Key, Shield, Activity, Wallet, Hammer } from 'lucide-react';
import { User } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, customToken, issueNewToken, updateCustomToken, deleteToken, deployedTokens, logout, updateUser, deleteUser, t, refreshMarketData } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'NEWS' | 'SETTINGS'>('USERS');
  
  const [newToken, setNewToken] = useState({
      symbol: '', name: '', price: 1.0, supply: 100000000, 
      priceChangePercent: 0, description: '', logoUrl: '', 
      contractAddress: '', enabled: true 
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ usdt: 0, tsla: 0, hashrate: 0, kyc: 0 });

  if (!currentUser?.isAdmin) return <div className="p-40 text-center font-black">ACCESS DENIED</div>;

  const handleIssue = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newToken.symbol || !newToken.name) {
          alert("Please fill in symbol and name");
          return;
      }
      issueNewToken(newToken as any);
      setNewToken({ symbol: '', name: '', price: 1.0, supply: 100000000, priceChangePercent: 0, description: '', logoUrl: '', contractAddress: '', enabled: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-80 bg-[#181a20] border-r border-white/5 p-8 flex flex-col shadow-2xl">
          <div className="text-[10px] font-black text-[#848e9c] uppercase tracking-[0.3em] mb-10">Admin Console</div>
          <div className="space-y-3 flex-1">
              {[ { id: 'USERS', label: 'User Hub', icon: Users }, { id: 'TOKEN', label: 'Token Factory', icon: Coins }, { id: 'NEWS', label: 'Broadcaster', icon: Megaphone }, { id: 'SETTINGS', label: 'System', icon: Settings } ].map(item => (
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
                    <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-[#0b0e11] text-[#848e9c] text-[10px] font-black uppercase tracking-widest"><tr><th className="p-8">Identity</th><th className="p-8">Status</th><th className="p-8">Funding Balance</th><th className="p-8 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{allUsers.map(u => (<tr key={u.id} className="hover:bg-white/5 transition-all group"><td className="p-8"><div className="font-black text-white text-lg">{u.email}</div><div className="text-xs text-[#848e9c] font-mono opacity-50">{u.id}</div></td><td className="p-8">{u.isFrozen ? <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black border border-red-500/20">FROZEN</span> : <span className="bg-[#0ecb81]/10 text-[#0ecb81] px-3 py-1 rounded-lg text-[10px] font-black border border-[#0ecb81]/20">ACTIVE</span>}</td><td className="p-8 font-mono text-white text-lg font-black">${(u.fundingWallet.find(a=>a.symbol==='USDT')?.amount || 0).toFixed(2)}</td><td className="p-8 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all"><button className="p-3 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9] hover:text-white transition-all"><Edit size={18}/></button><button onClick={()=>deleteUser(u.id)} className="p-3 bg-[#f6465d]/10 text-[#f6465d] rounded-xl hover:bg-[#f6465d] hover:text-white transition-all"><Trash2 size={18}/></button></div></td></tr>))}</tbody></table></div>
                </div>
            )}

            {activeTab === 'TOKEN' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 bg-[#181a20] p-10 lg:p-16 rounded-[50px] border border-white/5 shadow-2xl space-y-10">
                        <div className="space-y-2"><h2 className="text-4xl font-black text-white tracking-tighter">Token Factory</h2><p className="text-[#848e9c] font-bold">Issue new assets to the global spot market</p></div>
                        <form onSubmit={handleIssue} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Symbol</label><input type="text" placeholder="e.g. BTC" value={newToken.symbol} onChange={e=>setNewToken({...newToken, symbol: e.target.value.toUpperCase()})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9] shadow-inner" /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Name</label><input type="text" placeholder="e.g. Bitcoin" value={newToken.name} onChange={e=>setNewToken({...newToken, name: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9] shadow-inner" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Initial Price (USD)</label><input type="number" step="0.00000001" value={newToken.price} onChange={e=>setNewToken({...newToken, price: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black font-mono outline-none focus:border-[#0ea5e9] shadow-inner" /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Supply</label><input type="number" value={newToken.supply} onChange={e=>setNewToken({...newToken, supply: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black font-mono outline-none focus:border-[#0ea5e9] shadow-inner" /></div>
                            </div>
                            <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Logo URL</label><input type="text" placeholder="https://..." value={newToken.logoUrl} onChange={e=>setNewToken({...newToken, logoUrl: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9] shadow-inner" /></div>
                            <div className="space-y-3"><label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Description</label><textarea rows={3} placeholder="Project details..." value={newToken.description} onChange={e=>setNewToken({...newToken, description: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 p-5 rounded-3xl text-white font-black outline-none focus:border-[#0ea5e9] shadow-inner resize-none" /></div>
                            <button type="submit" className="w-full py-6 bg-[#0ea5e9] text-white rounded-[30px] font-black text-xl shadow-2xl shadow-[#0ea5e9]/30 hover:scale-[1.02] active:scale-95 transition-all">Launch Token</button>
                        </form>
                    </div>
                    
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-[#181a20] p-10 rounded-[40px] border border-white/5 shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Live Market</h3>
                            <div className="space-y-4">
                                {deployedTokens.map(t => (
                                    <div key={t.symbol} className="flex items-center justify-between p-5 bg-[#0b0e11] rounded-3xl border border-white/5 group">
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] font-black">{t.symbol[0]}</div><div><div className="font-black text-white">{t.symbol}</div><div className="text-[10px] text-[#848e9c] font-bold">{t.name}</div></div></div>
                                        <div className="text-right"><div className="font-mono text-white font-black">${t.price.toFixed(4)}</div><div className="text-[10px] text-[#0ecb81] font-black">+{t.priceChangePercent}%</div></div>
                                    </div>
                                ))}
                                {deployedTokens.length === 0 && <div className="py-20 text-center text-[#848e9c] font-black opacity-20">NO ASSETS DEPLOYED</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
      </main>
    </div>
  );
};
