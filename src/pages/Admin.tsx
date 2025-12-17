import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, AlertTriangle, Lock, Unlock, Trash2, Edit, Megaphone, Coins, LogOut, X, MessageSquare, Send, UserCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, customToken, logout, t, fetchAllSupportChats, adminReply } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'SUPPORT' | 'SETTINGS'>('USERS');
  
  // Support Centre State
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
    return <div className="p-20 text-center text-white">Access Denied</div>;
  }

  const SidebarItem: React.FC<{ tab: any, icon: any, label: string }> = ({ tab, icon: Icon, label }) => (
      <button onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === tab ? 'bg-brand-600 text-white shadow-lg' : 'text-[#848e9c] hover:bg-white/5'}`}>
          <Icon size={18} />{label}
      </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-full lg:w-64 bg-[#181a20] border-r border-white/5 p-6 space-y-4">
          <div className="text-xs font-bold text-[#848e9c] uppercase tracking-wider">Admin Dashboard</div>
          <SidebarItem tab="USERS" icon={Users} label="User Management" />
          <SidebarItem tab="SUPPORT" icon={MessageSquare} label="Support Centre" />
          <SidebarItem tab="TOKEN" icon={Coins} label="Token Config" />
          <SidebarItem tab="SETTINGS" icon={Settings} label="System Settings" />
          <div className="pt-8"><button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold"><LogOut size={18}/> Logout</button></div>
      </aside>

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        {activeTab === 'SUPPORT' ? (
          <div className="flex-1 bg-[#181a20] rounded-xl border border-white/5 flex overflow-hidden shadow-2xl">
            <div className="w-80 border-r border-white/5 flex flex-col bg-[#0b0e11]/20">
              <div className="p-4 border-b border-white/5 font-bold flex justify-between items-center">Conversations <button onClick={loadSupportChats}><RefreshCw size={14}/></button></div>
              <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedChats).map(([userId, msgs]: [string, any]) => {
                  const last = msgs[0];
                  return (
                    <button key={userId} onClick={() => setSelectedChatUser(userId)} className={`w-full text-left p-4 hover:bg-white/5 border-b border-white/5 ${selectedChatUser === userId ? 'bg-white/5 border-l-4 border-brand-500' : ''}`}>
                      <div className="flex items-center gap-3">
                        <UserCircle size={32} className="text-[#848e9c]" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-white font-bold text-sm truncate">{last.profiles?.email}</div>
                          <div className="text-[#848e9c] text-xs truncate">{last.text}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              {selectedChatUser ? (
                <>
                  <div className="p-4 bg-[#0b0e11] border-b border-white/5 font-bold text-white">{groupedChats[selectedChatUser][0]?.profiles?.email}</div>
                  <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0b0e11]/30">
                    {[...groupedChats[selectedChatUser]].reverse().map((m, i) => (
                      <div key={i} className={`flex ${m.sender_type === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-[70%] text-sm ${m.sender_type === 'ADMIN' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-[#1e2329] text-[#eaecef] rounded-tl-none border border-white/5'}`}>
                          {m.text}
                          <div className="text-[10px] opacity-40 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-[#181a20] border-t border-white/5 flex gap-3">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminReply()} placeholder="Type reply..." className="flex-1 bg-[#0b0e11] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-500" />
                    <button onClick={handleAdminReply} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold flex items-center gap-2"><Send size={16}/> Send</button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#848e9c] opacity-50"><MessageSquare size={64} className="mb-4"/><p>Select a user to chat</p></div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-xl"><h2 className="text-2xl font-bold text-white mb-4">{activeTab} Management</h2><p className="text-[#848e9c]">Functionality is under synchronization with database...</p></div>
        )}
      </div>
    </div>
  );
};
