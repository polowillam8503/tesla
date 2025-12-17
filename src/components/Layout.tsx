import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu as MenuIcon, LogOut, Globe, X, User as UserIcon, AlertCircle, CheckCircle, Info, Twitter, Facebook, Instagram, ChevronDown, Activity, Zap, TrendingUp, Cpu, Gift, CreditCard, ChevronRight, MessageCircle, Mail, Shield, Download, Smartphone, Share, PlusSquare, MoreVertical, Send } from 'lucide-react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const TslaLogo = () => (
  <img src="/logo.png" alt="TSLA" className="w-8 h-8 object-contain" />
);

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, language, setLanguage, t, notifications, removeNotification, login, register, showNotification, systemSettings, chatMessages, sendChatMessage, isInstallModalOpen, setInstallModalOpen } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, showChat]);

  const handleSendMessage = async () => {
      if (!currentUser) { showNotification('error', 'Please login to chat'); return; }
      if (!chatInput.trim()) return;
      const text = chatInput;
      setChatInput('');
      await sendChatMessage(text);
  };

  const languages: {code: Language, label: string}[] = [ { code: 'en', label: 'English' }, { code: 'zh', label: '简体中文' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' } ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans relative selection:bg-[#0ea5e9]/30">
      {/* Notifications */}
      <div className="fixed top-24 right-6 z-[150] space-y-3 pointer-events-none">
         {notifications.map(n => (
           <div key={n.id} className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 p-4 bg-[#1e2329] border-l-4 rounded shadow-2xl min-w-[320px]" style={{ borderColor: n.type === 'success' ? '#0ecb81' : n.type === 'error' ? '#f6465d' : '#0ea5e9' }}>
             {n.type === 'success' ? <CheckCircle size={20} className="text-[#0ecb81]" /> : n.type === 'error' ? <AlertCircle size={20} className="text-[#f6465d]" /> : <Info size={20} className="text-[#0ea5e9]" />}
             <div className="flex-1 text-sm font-medium text-white">{n.message}</div>
             <button onClick={() => removeNotification(n.id)}><X size={14} /></button>
           </div>
         ))}
      </div>

      {/* Header */}
      <header className="h-16 bg-[#181a20] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                <div className="group-hover:rotate-180 transition-transform duration-700"><TslaLogo /></div>
                <span className="text-xl font-bold text-white hidden sm:block">TSLA<span className="text-[#0ea5e9]">Global</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-2">
                <button onClick={() => onNavigate('home')} className={`px-3 py-2 text-sm font-bold rounded-lg ${activePage === 'home' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('markets')}</button>
                <button onClick={() => onNavigate('trade')} className={`px-3 py-2 text-sm font-bold rounded-lg ${activePage === 'trade' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('trade')}</button>
                <button onClick={() => onNavigate('airdrop')} className={`px-3 py-2 text-sm font-bold rounded-lg ${activePage === 'airdrop' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('airdrop')}</button>
                <button onClick={() => onNavigate('assets')} className={`px-3 py-2 text-sm font-bold rounded-lg ${activePage === 'assets' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('assets')}</button>
                {currentUser?.isAdmin && <button onClick={() => onNavigate('admin')} className={`px-3 py-2 text-sm font-bold rounded-lg ${activePage === 'admin' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('admin')}</button>}
            </nav>
        </div>

        <div className="flex items-center gap-4 h-full">
          <button onClick={() => setInstallModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b3139] hover:bg-[#363c45] rounded-full text-white text-xs font-bold transition-all border border-white/5 hover:border-[#0ea5e9]/50">
            <Download size={14} className="text-[#0ea5e9]" />
            <span className="hidden sm:inline">App</span>
          </button>

          <div className="relative h-full flex items-center" onMouseEnter={() => setShowLangMenu(true)} onMouseLeave={() => setShowLangMenu(false)}>
            <button className="p-2 flex items-center gap-1 text-[#848e9c] hover:text-white"><Globe size={18} /><span className="text-xs uppercase font-semibold hidden sm:inline">{language}</span></button>
            {showLangMenu && (
              <div className="absolute top-full right-0 w-32 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">
                {languages.map(l => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} className={`block w-full text-left px-4 py-2 text-sm ${language === l.code ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{l.label}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative h-full flex items-center" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
              <button className={`w-9 h-9 rounded-full bg-[#2b3139] flex items-center justify-center text-white ${showUserMenu ? 'ring-2 ring-[#0ea5e9]' : ''}`}><UserIcon size={18} /></button>
              {showUserMenu && (
                <div className="absolute top-full right-0 w-64 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-white/5"><div className="text-white font-bold truncate">{currentUser.email}</div><div className="text-xs text-[#848e9c]">UID: {currentUser.id}</div></div>
                      <button onClick={() => {onNavigate('user_center'); setShowUserMenu(false);}} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/5"><Shield size={16}/> {t('security')}</button>
                      <button onClick={() => {logout(); setShowUserMenu(false);}} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#f6465d] hover:bg-white/5"><LogOut size={16}/> {t('logout')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {setShowAuthModal('login'); setShowUserMenu(false);}} className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-white/5">{t('login')}</button>
                      <button onClick={() => {setShowAuthModal('signup'); setShowUserMenu(false);}} className="w-full text-left px-4 py-3 text-sm font-bold text-[#0ea5e9] hover:bg-white/5">{t('signup')}</button>
                    </>
                  )}
                </div>
              )}
          </div>
          <button className="lg:hidden text-[#848e9c]" onClick={() => setShowMobileMenu(true)}><MenuIcon size={24} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button onClick={() => setShowChat(!showChat)} className="w-14 h-14 rounded-full bg-[#0ea5e9] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
          {showChat ? <X size={24} /> : <MessageCircle size={28} />}
        </button>
        {showChat && (
          <div className="absolute bottom-16 right-0 w-80 bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-10 duration-200">
            <div className="bg-[#0ea5e9] p-4 flex items-center gap-3 shrink-0"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><UserIcon size={16} /></div><div><div className="text-white font-bold text-sm">Customer Support</div><div className="text-white/80 text-xs">Online</div></div></div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b0e11] custom-scrollbar min-h-[300px]">
              <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white">S</div><div className="bg-[#1e2329] p-2 rounded-lg text-sm text-[#848e9c] border border-white/5">{t('chat_welcome')}</div></div>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.isAdmin ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${msg.isAdmin ? 'bg-[#0ea5e9]' : 'bg-[#2b3139]'}`}>{msg.isAdmin ? 'S' : 'U'}</div>
                  <div className={`p-2 rounded-lg text-sm max-w-[85%] ${msg.isAdmin ? 'bg-[#1e2329] text-[#eaecef]' : 'bg-[#0ea5e9]/20 text-white'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/5 bg-[#1e2329] flex gap-2 shrink-0">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type..." className="flex-1 bg-[#0b0e11] rounded p-2 text-xs text-white border border-white/5 outline-none focus:border-[#0ea5e9]" />
              <button onClick={handleSendMessage} className="p-2 bg-[#0ea5e9] rounded text-white"><Send size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* PWA Modal */}
      {isInstallModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <button onClick={() => setInstallModalOpen(false)} className="absolute top-4 right-4 text-[#848e9c]"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Download size={20} className="text-[#0ea5e9]"/> Install App</h3>
                  <div className="space-y-4">
                      <div className="bg-[#0b0e11] p-4 rounded-xl border border-white/5"><div className="flex items-center gap-2 text-white font-bold mb-2"><Smartphone size={16}/> iOS (Safari)</div><p className="text-sm text-[#848e9c]">Tap <Share size={14} className="inline mx-1"/> then <strong>Add to Home Screen</strong>.</p></div>
                      <div className="bg-[#0b0e11] p-4 rounded-xl border border-white/5"><div className="flex items-center gap-2 text-white font-bold mb-2"><Smartphone size={16}/> Android (Chrome)</div><p className="text-sm text-[#848e9c]">Tap <MoreVertical size={14} className="inline mx-1"/> then <strong>Install App</strong>.</p></div>
                  </div>
                  <button onClick={() => setInstallModalOpen(false)} className="w-full mt-6 py-3 bg-[#0ea5e9] rounded-lg text-white font-bold">Close</button>
              </div>
          </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                  <button onClick={() => setShowAuthModal(null)} className="absolute top-4 right-4 text-[#848e9c]"><X size={20} /></button>
                  <h2 className="text-2xl font-bold mb-6 text-center text-white">{showAuthModal === 'login' ? t('login_title') : t('signup')}</h2>
                  <div className="space-y-4">
                      <div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">{t('email')}</label><input type="text" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white focus:border-[#0ea5e9] outline-none" placeholder="Email" /></div>
                      <div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">Password</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white focus:border-[#0ea5e9] outline-none" placeholder="Password" /></div>
                      <button onClick={async () => { const ok = await login(authEmail, authPassword); if(ok) setShowAuthModal(null); }} className="w-full py-3 bg-[#0ea5e9] rounded-lg font-bold text-white mt-4">{t('confirm')}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
