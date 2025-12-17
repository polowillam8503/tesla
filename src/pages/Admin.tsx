
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, AlertTriangle, Lock, Unlock, Trash2, Edit, Megaphone, Coins, LogOut, X, MessageSquare, Send, UserCircle, RefreshCw, Share2 } from 'lucide-react';
import { User } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, customToken, updateCustomToken, addNews, updateUser, deleteUser, logout, t, fetchAllSupportChats, adminReply, systemSettings, updateSystemSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'SUPPORT' | 'NEWS' | 'SETTINGS'>('USERS');
  
  // Support Centre State
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Forms
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ usdt: 0, tsla: 0 });

  const loadSupportChats = async () => {
      const chats = await fetchAllSupportChats();
      setSupportChats(chats);
  };

  useEffect(() => {
      if (activeTab === 'SUPPORT') loadSupportChats();
  }, [activeTab]);

  useEffect(() => {
      if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [selectedChatUser, supportChats]);

  const groupedChats = useMemo(() => {
      const groups: Record<string, any[]> = {};
      supportChats.forEach(c => {
          if (!groups[c.user_id]) groups[c.user_id] = [];
          groups[c.user_id].push(c);
      });
      return groups;
  }, [supportChats]);

  const handleAdminReply = async () => {
      if (!selectedChatUser || !replyText.trim()) return;
      await adminReply(selectedChatUser, replyText);
      setReplyText('');
      loadSupportChats();
  };

  if (!currentUser?.isAdmin) {
    return <div className="p-20 text-center text-white font-bold text-2xl">Access Denied</div>;
  }

  const openEditUser = (user: User) => {
      const usdt = user.fundingWallet.find(a => a.symbol === 'USDT')?.amount || 0;
      const tsla = user.fundingWallet.find(a => a.symbol === customToken.symbol)?.amount || 0;
      setEditingUser(user);
      setEditForm({ usdt, tsla });
  };

  const saveUserEdit = () => {
      if (!editingUser) return;
      const newWallet = [...editingUser.fundingWallet];
      const uIdx = newWallet.findIndex(a => a.symbol === 'USDT');
      if (uIdx >= 0) newWallet[uIdx].amount = editForm.usdt; else newWallet.push({ symbol: 'USDT', amount: editForm.usdt, frozen: 0 });
      const tIdx = newWallet.findIndex(a => a.symbol === customToken.symbol);
      if (tIdx >= 0) newWallet[tIdx].amount = editForm.tsla; else newWallet.push({ symbol: customToken.symbol, amount: editForm.tsla, frozen: 0 });
      updateUser(editingUser.id, { fundingWallet: newWallet });
      setEditingUser(null);
  };

  const SidebarItem: React.FC<{ tab: any, icon: any, label: string }> = ({ tab, icon: Icon, label }) => (
      <button onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === tab ? 'bg-brand-600 text-white shadow-lg' : 'text-[#848e9c] hover:bg-white/5'}`}>
          <Icon size={18} />{label}
      </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-full lg:w-64 bg-[#181a20] border-r border-white/5 p-6 space-y-4 shrink-0">
          <div className="text-xs font-bold text-[#848e9c] uppercase tracking-wider mb-4">Management Console</div>
          <SidebarItem tab="USERS" icon={Users} label="User Registry" />
          <SidebarItem tab="SUPPORT" icon={MessageSquare} label="Support Centre" />
          <SidebarItem tab="TOKEN" icon={Coins} label="Token Config" />
          <SidebarItem tab="NEWS" icon={Megaphone} label="Broadcast News" />
          <SidebarItem tab="SETTINGS" icon={Settings} label="System Settings" />
          <div className="pt-8"><button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold"><LogOut size={18}/> Logout</button></div>
      </aside>

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        {activeTab === 'SUPPORT' ? (
          <div className="flex-1 bg-[#181a20] rounded-xl border border-white/5 flex overflow-hidden shadow-2xl animate-in fade-in duration-300">
            <div className="w-80 border-r border-white/5 flex flex-col bg-[#0b0e11]/20">
              <div className="p-4 border-b border-white/5 font-bold flex justify-between items-center text-white">Conversations <button onClick={loadSupportChats} className="hover:rotate-180 transition-transform"><RefreshCw size={14}/></button></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {Object.entries(groupedChats).map(([userId, msgs]: [string, any]) => {
                  const last = msgs[0];
                  return (
                    <button key={userId} onClick={() => setSelectedChatUser(userId)} className={`w-full text-left p-4 hover:bg-white/5 border-b border-white/5 transition-all ${selectedChatUser === userId ? 'bg-white/5 border-l-4 border-brand-500' : ''}`}>
                      <div className="flex items-center gap-3">
                        <UserCircle size={32} className="text-[#848e9c]" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-white font-bold text-sm truncate">{last.profiles?.email || 'User'}</div>
                          <div className="text-[#848e9c] text-xs truncate">{last.text}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {Object.keys(groupedChats).length === 0 && <div className="p-8 text-center text-[#848e9c] text-sm italic">No active chats</div>}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              {selectedChatUser ? (
                <>
                  <div className="p-4 bg-[#0b0e11] border-b border-white/5 font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {groupedChats[selectedChatUser][0]?.profiles?.email}
                  </div>
                  <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0b0e11]/30 custom-scrollbar">
                    {[...groupedChats[selectedChatUser]].reverse().map((m, i) => (
                      <div key={i} className={`flex ${m.sender_type === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-[75%] text-sm ${m.sender_type === 'ADMIN' ? 'bg-brand-600 text-white rounded-tr-none shadow-lg' : 'bg-[#1e2329] text-[#eaecef] rounded-tl-none border border-white/5'}`}>
                          {m.text}
                          <div className="text-[10px] opacity-40 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-[#181a20] border-t border-white/5 flex gap-3">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminReply()} placeholder="Type reply..." className="flex-1 bg-[#0b0e11] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-500" />
                    <button onClick={handleAdminReply} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold flex items-center gap-2 active:scale-95 transition-all"><Send size={16}/> Reply</button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#848e9c] opacity-50"><MessageSquare size={64} className="mb-4"/><p>Select a user to chat</p></div>
              )}
            </div>
          </div>
        ) : activeTab === 'USERS' ? (
            <div className="bg-[#181a20] rounded-xl border border-white/5 overflow-hidden shadow-lg animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0b0e11] text-[#848e9c] uppercase border-b border-white/5">
                            <tr><th className="px-6 py-4">ID / Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Balance</th><th className="px-6 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 group transition-colors">
                                    <td className="px-6 py-4"><div className="font-bold text-white">{u.email}</div><div className="text-[10px] text-[#848e9c] font-mono">ID: {u.id}</div>{u.isAdmin && <span className="text-[10px] bg-brand-500/20 text-brand-500 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">ADMIN</span>}</td>
                                    <td className="px-6 py-4">{u.isFrozen ? <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">Frozen</span> : <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">Active</span>}</td>
                                    <td className="px-6 py-4 font-mono text-xs"><div className="text-white">USDT: {u.fundingWallet.find(a=>a.symbol==='USDT')?.amount.toFixed(2)}</div><div className="text-[#848e9c]">{customToken.symbol}: {u.fundingWallet.find(a=>a.symbol===customToken.symbol)?.amount.toFixed(2)}</div></td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity"><div className="flex justify-end gap-2"><button onClick={()=>updateUser(u.id,{isFrozen:!u.isFrozen})} className="p-2 bg-orange-500/10 text-orange-500 rounded hover:bg-orange-500 hover:text-white"><AlertTriangle size={14}/></button><button onClick={()=>openEditUser(u)} className="p-2 bg-brand-500/10 text-brand-500 rounded hover:bg-brand-500 hover:text-white"><Edit size={14}/></button><button onClick={()=>{if(confirm('Delete?'))deleteUser(u.id)}} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'TOKEN' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#181a20] p-8 rounded-xl border border-white/5 animate-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold text-white mb-6">Token Configuration</h3>
                  <div className="space-y-4">
                      <div><label className="text-xs text-[#848e9c] font-bold uppercase mb-2 block">Price (USD)</label><input type="number" value={customToken.price} onChange={e=>updateCustomToken({price:parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white outline-none focus:border-brand-500" /></div>
                      <div><label className="text-xs text-[#848e9c] font-bold uppercase mb-2 block">24h Change (%)</label><input type="number" value={customToken.priceChangePercent} onChange={e=>updateCustomToken({priceChangePercent:parseFloat(e.target.value)})} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white outline-none focus:border-brand-500" /></div>
                      <button onClick={()=>alert('Saved')} className="w-full py-4 bg-brand-600 text-white font-bold rounded-lg shadow-lg hover:bg-brand-500 transition-all">Save Parameters</button>
                  </div>
              </div>
              <div className="bg-[#181a20] p-8 rounded-xl border border-white/5 h-fit">
                <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                <div className="p-6 bg-[#0b0e11] rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-4"><span className="text-white font-bold text-xl">{customToken.symbol}/USDT</span><span className={customToken.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>{customToken.priceChangePercent >= 0 ? '+' : ''}{customToken.priceChangePercent}%</span></div>
                  <div className="text-4xl font-mono text-white">${customToken.price.toFixed(2)}</div>
                </div>
              </div>
            </div>
        ) : activeTab === 'SETTINGS' ? (
          <div className="max-w-2xl bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Share2 size={24} className="text-purple-500"/> System Settings</h2>
              <div className="space-y-6">
                   <div><label className="block text-xs font-bold text-[#848e9c] mb-2 uppercase">Telegram URL</label><input type="text" value={systemSettings.telegram} onChange={(e) => updateSystemSettings({ telegram: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
                   <div><label className="block text-xs font-bold text-[#848e9c] mb-2 uppercase">Twitter URL</label><input type="text" value={systemSettings.twitter} onChange={(e) => updateSystemSettings({ twitter: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
                   <div><label className="block text-xs font-bold text-[#848e9c] mb-2 uppercase">Support Email</label><input type="text" value={systemSettings.supportEmail} onChange={(e) => updateSystemSettings({ supportEmail: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
              </div>
          </div>
        ) : (
            <div className="text-white p-8">Section under development</div>
        )}
      </div>

      {editingUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#181a20] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Edit User Assets</h3><button onClick={() => setEditingUser(null)} className="text-[#848e9c] hover:text-white"><X size={20}/></button></div>
                  <div className="space-y-4">
                      <div><div className="text-xs text-[#848e9c] mb-1">User Email</div><div className="text-white font-medium">{editingUser.email}</div></div>
                      <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Funding Wallet (USDT)</label><input type="number" value={editForm.usdt} onChange={e => setEditForm(prev => ({...prev, usdt: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div>
                      <div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Funding Wallet ({customToken.symbol})</label><input type="number" value={editForm.tsla} onChange={e => setEditForm(prev => ({...prev, tsla: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div>
                      <button onClick={saveUserEdit} className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold mt-2">Save Changes</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
