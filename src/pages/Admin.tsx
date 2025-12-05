
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, AlertTriangle, Lock, Unlock, Trash2, Edit, Megaphone, Coins, LogOut, X, RefreshCw, Key, Wallet, Hammer, Activity } from 'lucide-react';
import { User, CustomTokenConfig } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, customToken, issueNewToken, updateCustomToken, deleteToken, deployedTokens, addNews, updateUser, adminUpdateUserPassword, deleteUser, t, logout, systemSettings, updateSystemSettings, refreshMarketData, miningRigs, updateMiningRig, addRigToUser } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'MINING' | 'NEWS' | 'SETTINGS'>('USERS');
  
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  
  const emptyToken: CustomTokenConfig = {
      symbol: '', name: '', price: 0, supply: 1000000, 
      description: '', enabled: true, logoUrl: '', 
      contractAddress: '', priceChangePercent: 0, volume24h: 1000000
  };
  const [newToken, setNewToken] = useState<CustomTokenConfig>(emptyToken);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editTab, setEditTab] = useState<'OVERVIEW' | 'ASSETS' | 'MINING' | 'SECURITY'>('OVERVIEW');
  
  const getSafeBalance = (wallet: any[], symbol: string): number => {
      if (!Array.isArray(wallet)) return 0;
      const asset = wallet.find(a => a && a.symbol === symbol);
      return asset && asset.amount != null ? Number(asset.amount) : 0;
  };

  const [editForm, setEditForm] = useState({ 
      usdtFunding: 0, btcFunding: 0, tslaFunding: 0,
      usdtTrading: 0, btcTrading: 0, tslaTrading: 0,
      miningBalance: 0, hashrate: 0, kycLevel: 0, riskLevel: 'LOW', newPassword: '' 
  });
  const [selectedRigToAdd, setSelectedRigToAdd] = useState(miningRigs[0]?.id || '');
  
  const [tokenEdits, setTokenEdits] = useState<Record<string, { price: string, change: string, volume: string }>>({});

  if (!currentUser?.isAdmin) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"><Lock size={40} /></div>
            <div className="text-2xl font-bold text-white">Access Denied</div>
            <p className="text-[#848e9c]">You do not have permission to view the Admin Console.</p>
        </div>
    );
  }

  const handleIssueToken = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      await issueNewToken(newToken); 
      setNewToken(emptyToken);
  };
  const handleAddNews = (e: React.FormEvent) => { e.preventDefault(); addNews({ id: Date.now().toString(), title: newsTitle, summary: newsSummary, source: 'Tsla Official', date: new Date().toISOString(), isOfficial: true }); setNewsTitle(''); setNewsSummary(''); alert("Announcement published!"); };
  
  const openEditUser = (user: User) => {
      setEditingUser(user);
      setEditForm({ 
          usdtFunding: getSafeBalance(user.fundingWallet, 'USDT'),
          btcFunding: getSafeBalance(user.fundingWallet, 'BTC'),
          tslaFunding: getSafeBalance(user.fundingWallet, customToken.symbol),
          usdtTrading: getSafeBalance(user.tradingWallet, 'USDT'),
          btcTrading: getSafeBalance(user.tradingWallet, 'BTC'),
          tslaTrading: getSafeBalance(user.tradingWallet, customToken.symbol),
          miningBalance: Number(user.miningBalance || 0), 
          hashrate: Number(user.hashrate || 0),
          kycLevel: user.kycLevel,
          riskLevel: user.riskLevel || 'LOW',
          newPassword: ''
      });
      setEditTab('OVERVIEW');
  };

  const saveUserEdit = () => {
      if (!editingUser) return;
      const newFunding = Array.isArray(editingUser.fundingWallet) ? [...editingUser.fundingWallet] : [];
      const newTrading = Array.isArray(editingUser.tradingWallet) ? [...editingUser.tradingWallet] : [];
      
      const updateBalance = (wallet: any[], sym: string, val: number) => {
          const idx = wallet.findIndex(a => a && a.symbol === sym);
          if (idx >= 0) {
              if (wallet[idx]) wallet[idx].amount = val;
          } else {
              wallet.push({ symbol: sym, amount: val, frozen: 0 });
          }
      };

      updateBalance(newFunding, 'USDT', editForm.usdtFunding);
      updateBalance(newFunding, 'BTC', editForm.btcFunding);
      updateBalance(newFunding, customToken.symbol, editForm.tslaFunding);

      updateBalance(newTrading, 'USDT', editForm.usdtTrading);
      updateBalance(newTrading, 'BTC', editForm.btcTrading);
      updateBalance(newTrading, customToken.symbol, editForm.tslaTrading);

      if (editForm.newPassword) {
          adminUpdateUserPassword(editingUser.id, editForm.newPassword);
      }

      updateUser(editingUser.id, { 
          fundingWallet: newFunding, 
          tradingWallet: newTrading, 
          miningBalance: editForm.miningBalance, 
          hashrate: editForm.hashrate,
          kycLevel: editForm.kycLevel,
          riskLevel: editForm.riskLevel as any
      });
      setEditingUser(null);
  };

  const handleAddRigToUser = () => {
      if(!editingUser || !selectedRigToAdd) return;
      const rig = miningRigs.find(r => r.id === selectedRigToAdd);
      if(rig) {
          addRigToUser(editingUser.id, rig);
          const updatedRigs = [...(editingUser.rigs || []), rig];
          setEditingUser({...editingUser, rigs: updatedRigs});
          alert(`Added ${rig.name} to user.`);
      }
  };

  const handleTokenEditChange = (symbol: string, field: 'price' | 'change' | 'volume', value: string) => { setTokenEdits(prev => ({ ...prev, [symbol]: { ...prev[symbol], [field]: value } })); };
  const saveTokenEdit = (token: any) => { 
      const edits = tokenEdits[token.symbol]; 
      const priceVal = edits?.price !== undefined ? edits.price : token.price.toString();
      const changeVal = edits?.change !== undefined ? edits.change : token.priceChangePercent.toString();
      const volumeVal = edits?.volume !== undefined ? edits.volume : (token.volume24h || token.volume_24h || 0).toString();
      
      const price = parseFloat(priceVal); 
      const change = parseFloat(changeVal); 
      const volume = parseFloat(volumeVal);
      
      updateCustomToken(token.symbol, { price, priceChangePercent: change, volume24h: volume }); 
  };
  
  const SidebarItem: React.FC<{ tab: 'USERS' | 'TOKEN' | 'MINING' | 'NEWS' | 'SETTINGS', icon: React.ReactNode, label: string }> = ({ tab, icon, label }) => (<button onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === tab ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-[#848e9c] hover:bg-white/5 hover:text-white'}`}>{icon}{label}</button>);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-full lg:w-64 bg-[#181a20] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-6"><div className="text-xs font-bold text-[#848e9c] uppercase tracking-wider mb-4">Management Console</div><div className="grid grid-cols-2 lg:grid-cols-1 gap-2"><SidebarItem tab="USERS" icon={<Users size={18} />} label={t('admin_users')} /><SidebarItem tab="TOKEN" icon={<Coins size={18} />} label={t('admin_token')} /><SidebarItem tab="MINING" icon={<Hammer size={18} />} label="Mining" /><SidebarItem tab="NEWS" icon={<Megaphone size={18} />} label={t('admin_news')} /><SidebarItem tab="SETTINGS" icon={<Settings size={18} />} label="System Settings" /></div></div>
          <div className="mt-auto p-6 border-t border-white/5 hidden lg:block"><div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20"><div className="text-red-500 font-bold text-xs mb-1 uppercase">Admin Session</div><div className="text-[#848e9c] text-xs mb-3">You are logged in with superuser privileges.</div><button onClick={logout} className="flex items-center gap-2 text-xs font-bold text-white hover:text-red-400 transition-colors"><LogOut size={14} /> End Session</button></div></div>
      </aside>
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{activeTab === 'USERS' && t('admin_users')}{activeTab === 'TOKEN' && t('admin_token')}{activeTab === 'MINING' && "Mining Management"}{activeTab === 'NEWS' && t('admin_news')}{activeTab === 'SETTINGS' && 'System Settings'}</h1><p className="text-[#848e9c] text-sm">System Overview & Configuration</p></div></div>
            {activeTab === 'USERS' && (<div className="bg-[#181a20] rounded-xl border border-white/5 overflow-hidden shadow-lg"><div className="overflow-x-auto"><table className="w-full text-left text-sm whitespace-nowrap"><thead className="bg-[#0b0e11] text-[#848e9c] uppercase border-b border-white/5"><tr><th className="px-6 py-4">ID / Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Wallet Balance (Fund/Trade)</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{allUsers && allUsers.length > 0 ? allUsers.map(u => (<tr key={u.id} className="hover:bg-white/5 group"><td className="px-6 py-4"><div className="font-medium text-white">{u.email}</div><div className="text-xs text-[#848e9c] font-mono">ID: {u.id}</div>{u.isAdmin && <span className="inline-block mt-1 px-1.5 py-0.5 bg-brand-500/20 text-brand-500 text-[10px] font-bold rounded">ADMIN</span>}</td><td className="px-6 py-4">{u.isFrozen ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20"><Lock size={12} /> Frozen</span> : <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20"><Unlock size={12} /> Active</span>}</td><td className="px-6 py-4 font-mono text-[#848e9c]"><div className="flex flex-col gap-1"><div className="flex justify-between w-48 text-xs"><span>USDT (Fund):</span><span className="text-white">{Number(getSafeBalance(u.fundingWallet, 'USDT') || 0).toFixed(2)}</span></div><div className="flex justify-between w-48 text-xs"><span>USDT (Trade):</span><span className="text-white">{Number(getSafeBalance(u.tradingWallet, 'USDT') || 0).toFixed(2)}</span></div></div></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity"><button onClick={() => updateUser(u.id, { isFrozen: !u.isFrozen })} className={`p-2 rounded border ${u.isFrozen ? 'text-green-500 border-green-500/30 hover:bg-green-500/10' : 'text-orange-500 border-orange-500/30 hover:bg-orange-500/10'}`} title={u.isFrozen ? "Unfreeze Account" : "Freeze Account"}><AlertTriangle size={16} /></button><button onClick={() => openEditUser(u)} className="p-2 rounded border border-brand-500/30 text-brand-500 hover:bg-brand-500/10" title="Edit Balance"><Edit size={16} /></button><button onClick={() => { if(confirm('Are you sure you want to permanently delete this user?')) deleteUser(u.id); }} className="p-2 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10" title="Delete User"><Trash2 size={16} /></button></div></td></tr>)) : (<tr><td colSpan={4} className="text-center py-8 text-[#848e9c]">No users found in database.</td></tr>)}</tbody></table></div></div>)}
            {activeTab === 'TOKEN' && (<div className="space-y-8"><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5"><div className="w-12 h-12 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-500"><Plus size={24} /></div><div><h2 className="text-xl font-bold text-white">Issue New Token</h2><p className="text-sm text-[#848e9c]">Create a custom asset for the market</p></div></div><form onSubmit={handleIssueToken} className="space-y-6"><div className="grid grid-cols-2 gap-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Symbol</label><input type="text" value={newToken.symbol} onChange={(e) => setNewToken({...newToken, symbol: e.target.value.toUpperCase()})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none uppercase" placeholder="e.g. BTC" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Name</label><input type="text" value={newToken.name} onChange={(e) => setNewToken({...newToken, name: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none" placeholder="e.g. Bitcoin" /></div></div><div className="grid grid-cols-2 gap-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Price (USD)</label><input type="number" value={newToken.price} onChange={(e) => setNewToken({...newToken, price: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Supply</label><input type="number" value={newToken.supply} onChange={(e) => setNewToken({...newToken, supply: parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none" /></div></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Logo URL</label><input type="text" value={newToken.logoUrl} onChange={(e) => setNewToken({...newToken, logoUrl: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none" placeholder="https://..." /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Description</label><textarea value={newToken.description} onChange={(e) => setNewToken({...newToken, description: e.target.value})} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none h-20 resize-none" placeholder="Token description..." /></div><button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"><Save size={18} /> Issue Token</button></form></div></div><div className="bg-[#181a20] rounded-xl border border-white/5 overflow-hidden shadow-lg"><div className="p-6 border-b border-white/5 flex items-center justify-between"><h3 className="text-lg font-bold text-white">Deployed Tokens</h3><button onClick={() => refreshMarketData()} className="p-2 hover:bg-white/5 rounded text-[#848e9c] hover:text-white"><RefreshCw size={16}/></button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#0b0e11] text-[#848e9c] uppercase border-b border-white/5"><tr><th className="px-6 py-4">Symbol</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Price (USD)</th><th className="px-6 py-4">24h Change (%)</th><th className="px-6 py-4">24h Vol</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{(!deployedTokens || deployedTokens.length === 0) ? (<tr><td colSpan={6} className="text-center py-8 text-[#848e9c]">No custom tokens found</td></tr>) : (deployedTokens.map((token) => (<tr key={token.symbol} className="hover:bg-white/5 group"><td className="px-6 py-4 font-bold text-white">{token.symbol}</td><td className="px-6 py-4 text-[#848e9c]">{token.name}</td><td className="px-6 py-4"><input type="number" defaultValue={token.price} onChange={(e) => handleTokenEditChange(token.symbol, 'price', e.target.value)} className="w-32 bg-[#0b0e11] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono" /></td><td className="px-6 py-4"><input type="number" defaultValue={token.priceChangePercent} onChange={(e) => handleTokenEditChange(token.symbol, 'change', e.target.value)} className={`w-32 bg-[#0b0e11] border border-white/10 rounded px-2 py-1 text-xs font-mono ${token.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`} /></td><td className="px-6 py-4"><input type="number" defaultValue={token.volume24h} onChange={(e) => handleTokenEditChange(token.symbol, 'volume', e.target.value)} className="w-32 bg-[#0b0e11] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono" /></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => saveTokenEdit(token)} className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold">Update</button><button onClick={() => { if(confirm(`Delete ${token.symbol}?`)) deleteToken(token.symbol); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button></div></td></tr>)))}</tbody></table></div></div></div>)}
            {activeTab === 'MINING' && (
                <div className="bg-[#181a20] rounded-xl border border-white/5 overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-bold text-white">Mining Rigs Configuration</h3>
                        <p className="text-sm text-[#848e9c]">Configure cloud mining rigs available for purchase.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {miningRigs.map((rig) => (
                            <div key={rig.id} className="bg-[#0b0e11] border border-white/10 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-white font-bold">{rig.name}</div>
                                    <div className="text-xs text-[#848e9c] bg-[#1e2329] px-2 py-1 rounded">{rig.id}</div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-[#848e9c] uppercase block mb-1">Hashrate (MH/s)</label>
                                        <input 
                                            type="number" 
                                            value={rig.hashrate} 
                                            onChange={(e) => updateMiningRig(rig.id, { hashrate: parseFloat(e.target.value) })}
                                            className="w-full bg-[#1e2329] border border-white/10 rounded p-2 text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#848e9c] uppercase block mb-1">Cost (USDT)</label>
                                        <input 
                                            type="number" 
                                            value={rig.cost} 
                                            onChange={(e) => updateMiningRig(rig.id, { cost: parseFloat(e.target.value) })}
                                            className="w-full bg-[#1e2329] border border-white/10 rounded p-2 text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#848e9c] uppercase block mb-1">Daily Output ({customToken.symbol})</label>
                                        <input 
                                            type="number" 
                                            value={rig.dailyOutput} 
                                            onChange={(e) => updateMiningRig(rig.id, { dailyOutput: parseFloat(e.target.value) })}
                                            className="w-full bg-[#1e2329] border border-white/10 rounded p-2 text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'NEWS' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5"><div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500"><Plus size={24} /></div><div><h2 className="text-xl font-bold text-white">Broadcast Announcement</h2><p className="text-sm text-[#848e9c]">Publish news to the main ticker</p></div></div><form onSubmit={handleAddNews} className="space-y-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Headline</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="e.g. System Maintenance Scheduled" className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors" required /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Content</label><textarea value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} placeholder="Enter the detailed announcement text here..." className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white h-40 focus:border-green-500 outline-none transition-colors resize-none" required /></div><button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold mt-2 shadow-lg shadow-green-500/20 transition-transform active:scale-95">Publish Announcement</button></form></div></div>)}
            {activeTab === 'SETTINGS' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><div className="space-y-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Telegram Group URL</label><input type="text" value={systemSettings.telegram} onChange={(e) => updateSystemSettings({ telegram: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Twitter / X URL</label><input type="text" value={systemSettings.twitter} onChange={(e) => updateSystemSettings({ twitter: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Discord Invite URL</label><input type="text" value={systemSettings.discord} onChange={(e) => updateSystemSettings({ discord: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Support Email</label><input type="text" value={systemSettings.supportEmail} onChange={(e) => updateSystemSettings({ supportEmail: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div></div></div></div>)}
        </div>
      </div>
      {editingUser && (<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-[#181a20] border border-white/10 rounded-xl w-full max-w-2xl p-0 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#1e2329]">
              <div><h3 className="text-xl font-bold text-white">Edit User Profile</h3><p className="text-sm text-[#848e9c]">{editingUser.email}</p></div>
              <button onClick={() => setEditingUser(null)} className="text-[#848e9c] hover:text-white"><X size={20}/></button>
          </div>
          <div className="flex border-b border-white/5 bg-[#161a1e]">
              <button onClick={() => setEditTab('OVERVIEW')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${editTab === 'OVERVIEW' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent hover:text-white'}`}>Overview</button>
              <button onClick={() => setEditTab('ASSETS')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${editTab === 'ASSETS' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent hover:text-white'}`}>Assets</button>
              <button onClick={() => setEditTab('MINING')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${editTab === 'MINING' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent hover:text-white'}`}>Mining</button>
              <button onClick={() => setEditTab('SECURITY')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${editTab === 'SECURITY' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent hover:text-white'}`}>Security</button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">
              {editTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">KYC Level (0-3)</label><input type="number" value={editForm.kycLevel} onChange={e => setEditForm(prev => ({...prev, kycLevel: parseInt(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white" /></div>
                          <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Risk Level</label><select value={editForm.riskLevel} onChange={e => setEditForm(prev => ({...prev, riskLevel: e.target.value}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded border border-blue-500/20 text-sm text-blue-400">User ID: <span className="font-mono text-white select-all">{editingUser.id}</span></div>
                  </div>
              )}
              {editTab === 'ASSETS' && (
                  <div className="space-y-6">
                      <div><h4 className="text-white font-bold mb-3 flex items-center gap-2"><Wallet size={16} className="text-[#0ecb81]"/> Funding Wallet</h4><div className="grid grid-cols-3 gap-3">
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">USDT</label><input type="number" value={editForm.usdtFunding} onChange={e => setEditForm(prev => ({...prev, usdtFunding: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">BTC</label><input type="number" value={editForm.btcFunding} onChange={e => setEditForm(prev => ({...prev, btcFunding: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">{customToken.symbol}</label><input type="number" value={editForm.tslaFunding} onChange={e => setEditForm(prev => ({...prev, tslaFunding: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                      </div></div>
                      <div className="border-t border-white/5 pt-6">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2"><Activity size={16} className="text-[#f0b90b]"/> Trading Wallet</h4><div className="grid grid-cols-3 gap-3">
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">USDT</label><input type="number" value={editForm.usdtTrading} onChange={e => setEditForm(prev => ({...prev, usdtTrading: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">BTC</label><input type="number" value={editForm.btcTrading} onChange={e => setEditForm(prev => ({...prev, btcTrading: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                          <div><label className="text-[10px] text-[#848e9c] uppercase mb-1 block">{customToken.symbol}</label><input type="number" value={editForm.tslaTrading} onChange={e => setEditForm(prev => ({...prev, tslaTrading: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-2 text-white font-mono text-sm" /></div>
                      </div></div>
                  </div>
              )}
              {editTab === 'MINING' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Total Hashrate (MH/s)</label><input type="number" value={editForm.hashrate} onChange={e => setEditForm(prev => ({...prev, hashrate: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div>
                          <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Pending Rewards ({customToken.symbol})</label><input type="number" value={editForm.miningBalance} onChange={e => setEditForm(prev => ({...prev, miningBalance: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div>
                      </div>
                      <div>
                          <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-[#848e9c] uppercase">Active Rigs</h4>
                              <div className="flex gap-2">
                                  <select 
                                      value={selectedRigToAdd}
                                      onChange={(e) => setSelectedRigToAdd(e.target.value)}
                                      className="bg-[#0b0e11] text-xs text-white border border-white/10 rounded px-2"
                                  >
                                      {miningRigs.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                  <button onClick={handleAddRigToUser} className="text-xs bg-brand-600 px-2 py-1 rounded text-white font-bold hover:bg-brand-500">Add</button>
                              </div>
                          </div>
                          {editingUser.rigs && editingUser.rigs.length > 0 ? (
                              <div className="space-y-2">
                                  {editingUser.rigs.map((rig, i) => (
                                      <div key={i} className="flex justify-between items-center p-3 bg-[#0b0e11] rounded border border-white/5">
                                          <div className="flex items-center gap-2">
                                              <Hammer size={14} className="text-[#848e9c]" />
                                              <span className="text-sm text-white">{rig.name}</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="text-xs text-[#0ecb81]">{rig.hashrate} MH/s</span>
                                              <button className="text-[#f6465d] hover:text-white" title="Remove Rig"><X size={14}/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : <div className="p-4 text-center text-[#848e9c] text-sm bg-[#0b0e11] rounded border border-white/5">No active rigs</div>}
                      </div>
                  </div>
              )}
              {editTab === 'SECURITY' && (
                  <div className="space-y-6">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-500 font-bold mb-2"><Key size={18} /> Admin Password Reset</div>
                          <p className="text-xs text-[#848e9c] mb-4">Directly changing a user's password bypasses 2FA. Use with caution.</p>
                          <label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">New Login Password</label>
                          <input type="text" value={editForm.newPassword} onChange={e => setEditForm(prev => ({...prev, newPassword: e.target.value}))} placeholder="Enter new password" className="w-full bg-[#0b0e11] border border-red-500/30 rounded p-3 text-white mb-2 focus:border-red-500 outline-none" />
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#0b0e11] rounded border border-white/5">
                          <span className="text-sm text-[#848e9c]">Account Freeze Status</span>
                          <button onClick={() => updateUser(editingUser.id, { isFrozen: !editingUser.isFrozen })} className={`px-3 py-1 rounded text-xs font-bold ${editingUser.isFrozen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {editingUser.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                          </button>
                      </div>
                  </div>
              )}
          </div>
          <div className="p-6 border-t border-white/10 bg-[#1e2329] flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="px-6 py-2 rounded-lg text-sm font-bold text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={saveUserEdit} className="px-6 py-2 rounded-lg text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-colors">Save Changes</button>
          </div>
      </div></div>)}
    </div>
  );
};
