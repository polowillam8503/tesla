
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu as MenuIcon, LogOut, Globe, X, User as UserIcon, AlertCircle, CheckCircle, Info, Twitter, ChevronDown, Activity, Zap, TrendingUp, Cpu, Gift, CreditCard, ChevronRight, MessageCircle, Mail, Shield, Download, Smartphone, Share } from 'lucide-react';
import { Language, ChatMessage } from '../types';

const TslaLogo = () => (
  <img src="/logo.png" alt="TSLA" className="w-8 h-8 object-contain" />
);

export const Layout: React.FC<{ children: React.ReactNode; activePage: string; onNavigate: (page: string) => void; }> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, language, setLanguage, t, notifications, removeNotification, login, sendVerificationCode, showNotification, systemSettings, isInstallModalOpen, setInstallModalOpen, chatMessages, sendChatMessage } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => { let interval: any; if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000); return () => clearInterval(interval); }, [timer]);

  const handleAuth = async () => {
      const success = await login(authEmail, authPassword);
      if (success) setShowAuthModal(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      sendChatMessage(chatInput);
      setChatInput('');
  };

  const languages: {code: Language, label: string}[] = [ { code: 'en', label: 'English' }, { code: 'zh', label: '简体中文' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' } ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans relative">
      <div className="fixed top-24 right-6 z-[150] space-y-3 pointer-events-none">
         {notifications.map(n => (
           <div key={n.id} className="pointer-events-auto flex items-center gap-3 p-4 bg-[#1e2329] border-l-4 rounded shadow-2xl min-w-[320px]" style={{ borderColor: n.type === 'success' ? '#0ecb81' : n.type === 'error' ? '#f6465d' : '#0ea5e9' }}>
             {n.type === 'success' ? <CheckCircle size={20} className="text-[#0ecb81]" /> : n.type === 'error' ? <AlertCircle size={20} className="text-[#f6465d]" /> : <Info size={20} className="text-[#0ea5e9]" />}
             <div className="flex-1 text-sm font-medium text-white">{n.message}</div>
             <button onClick={() => removeNotification(n.id)}><X size={14} /></button>
           </div>
         ))}
      </div>

      <header className="h-16 bg-[#181a20] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
                <TslaLogo /><span className="text-xl font-bold text-white hidden sm:block">TSLA<span className="text-[#0ea5e9]">Global</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-6 h-full">
                <button onClick={() => onNavigate('home')} className={`text-sm font-bold transition-colors ${activePage === 'home' ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{t('markets')}</button>
                <button onClick={() => onNavigate('trade')} className={`text-sm font-bold transition-colors ${activePage === 'trade' ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{t('trade')}</button>
                <button onClick={() => onNavigate('airdrop')} className={`text-sm font-bold transition-colors ${activePage === 'airdrop' ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{t('airdrop')}</button>
                <button onClick={() => onNavigate('assets')} className={`text-sm font-bold transition-colors ${activePage === 'assets' ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{t('assets')}</button>
                {currentUser?.isAdmin && (<button onClick={() => onNavigate('admin')} className="text-sm font-bold text-[#848e9c] transition-colors">Admin</button>)}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setInstallModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b3139] rounded-full text-white text-xs font-bold transition-all border border-white/5"><Download size={14} className="text-[#0ea5e9]" /><span>App</span></button>
          <div className="relative h-full flex items-center" onMouseEnter={() => setShowLangMenu(true)} onMouseLeave={() => setShowLangMenu(false)}>
            <Globe size={18} className="text-[#848e9c]" />
            {showLangMenu && ( <div className="absolute top-full right-0 w-32 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">{languages.map(l => ( <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${language === l.code ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{l.label}</button> ))}</div> )}
          </div>
          <div className="relative h-full flex items-center" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
              <button className="w-9 h-9 rounded-full bg-[#2b3139] flex items-center justify-center text-white"><UserIcon size={18} /></button>
              {showUserMenu && (
                <div className="absolute top-full right-0 w-64 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-white/5"><div className="text-white font-bold truncate">{currentUser.email}</div></div>
                      <button onClick={() => { onNavigate('user_center'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-[#848e9c] hover:text-white flex items-center gap-3"><Shield size={16}/> Security</button>
                      <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-[#f6465d] hover:bg-white/5 flex items-center gap-3"><LogOut size={16}/> Logout</button>
                    </>
                  ) : (
                    <><button onClick={() => setShowAuthModal('login')} className="w-full text-left px-4 py-3 text-sm text-white font-bold">{t('login')}</button><button onClick={() => setShowAuthModal('signup')} className="w-full text-left px-4 py-3 text-sm text-white font-bold">{t('signup')}</button></>
                  )}
                </div>
              )}
          </div>
          <button className="lg:hidden text-[#848e9c]" onClick={() => setShowMobileMenu(true)}><MenuIcon size={24} /></button>
        </div>
      </header>

      {showMobileMenu && (
          <div className="fixed inset-0 z-[200] lg:hidden"><div className="absolute inset-0 bg-black/80" onClick={() => setShowMobileMenu(false)} /><div className="absolute top-0 left-0 w-4/5 max-w-xs h-full bg-[#181a20] p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8"><div className="text-xl font-bold text-white flex items-center gap-2"><TslaLogo /><span>TSLA</span></div><button onClick={() => setShowMobileMenu(false)}><X size={24} /></button></div>
              <nav className="flex flex-col gap-4">{['home', 'trade', 'airdrop', 'assets'].map(p => ( <button key={p} onClick={() => { onNavigate(p); setShowMobileMenu(false); }} className={`text-left p-2 rounded text-lg ${activePage === p ? 'text-[#0ea5e9]' : 'text-[#848e9c]'}`}>{t(p === 'home' ? 'markets' : p)}</button> ))}</nav>
          </div></div>
      )}

      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Support Chat */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button onClick={() => setShowChat(!showChat)} className="w-14 h-14 rounded-full bg-[#0ea5e9] text-white shadow-2xl flex items-center justify-center hover:bg-[#0284c7] transition-all hover:scale-110">{showChat ? <X size={24} /> : <MessageCircle size={28} />}</button>
        {showChat && (
          <div className="absolute bottom-16 right-0 w-80 bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
            <div className="bg-[#0ea5e9] p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><UserIcon size={16} /></div>
              <div><div className="text-white font-bold text-sm">Customer Support</div><div className="text-white/80 text-xs flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]"></div> Online</div></div>
            </div>
            <div className="h-64 p-4 overflow-y-auto space-y-3 bg-[#0b0e11]">
              <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#0ea5e9] shrink-0 flex items-center justify-center text-xs text-white">S</div><div className="bg-[#1e2329] p-2 rounded-lg rounded-tl-none text-sm text-[#848e9c] border border-white/5">Welcome to TSLA Global. How can we help you today?</div></div>
              {chatMessages.map((msg: ChatMessage, i: number) => (
                <div key={msg.id || i} className={`flex gap-2 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs text-white ${msg.sender === 'USER' ? 'bg-[#2b3139]' : 'bg-[#0ea5e9]'}`}>{msg.sender === 'USER' ? 'U' : 'S'}</div>
                  <div className={`p-2 rounded-lg text-sm border border-white/5 ${msg.sender === 'USER' ? 'bg-[#0ea5e9]/10 text-white rounded-tr-none' : 'bg-[#1e2329] text-[#848e9c] rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-[#1e2329] flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[#0b0e11] rounded p-2 text-xs text-white border border-white/5 outline-none focus:border-[#0ea5e9]" />
              <button type="submit" className="p-2 bg-[#2b3139] hover:bg-[#0ea5e9] rounded text-white transition-colors"><ChevronRight size={16} /></button>
            </form>
          </div>
        )}
      </div>

      {isInstallModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <button onClick={() => setInstallModalOpen(false)} className="absolute top-4 right-4 text-[#848e9c]"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Download size={20} className="text-[#0ea5e9]"/> Download App</h3>
                  <div className="space-y-4">
                      <a href="/tsla-exchange.apk" download className="block bg-[#0b0e11] p-4 rounded-xl border border-white/5 hover:border-[#0ea5e9] transition-all">
                        <div className="flex items-center gap-3"><Smartphone size={24} className="text-[#0ea5e9]"/><div className="text-white font-bold">Android Download</div></div>
                        <p className="text-xs text-[#848e9c] mt-2">Click to download the latest APK directly.</p>
                      </a>
                      <div className="bg-[#0b0e11] p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3"><Smartphone size={24} className="text-[#0ea5e9]"/><div className="text-white font-bold">iOS Installation</div></div>
                        <p className="text-xs text-[#848e9c] mt-2">Safari: Tap <Share size={12} className="inline"/> then "Add to Home Screen".</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <footer className="bg-[#0b0e11] border-t border-white/5 pt-16 pb-8"><div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 lg:col-span-1"><div className="flex items-center gap-2 mb-6"><TslaLogo /><span className="text-2xl font-bold text-white">TSLA<span className="text-[#0ea5e9]">Global</span></span></div></div>
          <div><h4 className="text-white font-bold mb-6">Trade</h4><ul className="space-y-4 text-[#848e9c] text-sm"><li><button onClick={() => onNavigate('trade')}>Spot</button></li><li><button onClick={() => onNavigate('airdrop')}>Mining</button></li></ul></div>
          <div><h4 className="text-white font-bold mb-6">Legal</h4><ul className="space-y-4 text-[#848e9c] text-sm"><li><button onClick={() => onNavigate('whitepaper')}>Whitepaper</button></li></ul></div>
          <div><h4 className="text-white font-bold mb-6">Social</h4><div className="flex gap-4"><a href={systemSettings.telegram} className="text-[#848e9c] hover:text-[#0ea5e9]"><MessageCircle size={20} /></a><a href={systemSettings.twitter} className="text-[#848e9c] hover:text-[#0ea5e9]"><Twitter size={20} /></a></div></div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center text-[#848e9c] text-xs">© 2025 Tsla Global Exchange. All rights reserved.</div>
      </div></footer>

      {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-8 max-w-md w-full relative">
                  <button onClick={() => setShowAuthModal(null)} className="absolute top-4 right-4"><X size={20} /></button>
                  <h2 className="text-2xl font-bold mb-6 text-center">{showAuthModal === 'login' ? t('login_title') : t('signup')}</h2>
                  <div className="space-y-4">
                      <input type="text" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white" placeholder="Email" />
                      <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white" placeholder="Password" />
                      <div className="flex gap-2">
                        <input type="text" value={authCode} onChange={(e) => setAuthCode(e.target.value)} className="flex-1 bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white" placeholder="Code" />
                        <button onClick={() => sendVerificationCode(authEmail)} className="px-4 bg-[#2b3139] rounded-lg text-xs">Get Code</button>
                      </div>
                      <button onClick={handleAuth} className="w-full py-3 bg-brand-600 rounded-lg font-bold text-white mt-4">{t('confirm')}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
