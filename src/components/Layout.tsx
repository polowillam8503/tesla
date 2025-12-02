import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu as MenuIcon, LogOut, Globe, X, RefreshCw, User as UserIcon, AlertCircle, CheckCircle, Info, Twitter, Facebook, Instagram, Linkedin, Github, ChevronDown, Activity, Zap, TrendingUp, Cpu, Gift, CreditCard, ChevronRight, MessageCircle, Mail, Shield, Eye, EyeOff, Send } from 'lucide-react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const TslaLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L2 9.5V22.5L16 30L30 22.5V9.5L16 2Z" fill="#0b0e11" stroke="#0ea5e9" strokeWidth="2"/>
    <path d="M16 6L6 11V21L16 26L26 21V11L16 6Z" fill="#181a20" stroke="#0284c7" strokeWidth="1"/>
    <path d="M16 11L11 14V18L16 21L21 18V14L16 11Z" fill="#0ea5e9"/>
  </svg>
);

const NavDropdown: React.FC<{ label: string; active: boolean; items: { label: string; icon: any; action: () => void }[]; }> = ({ label, active, items }) => {
    const [isOpen, setIsOpen] = useState(false); const timeoutRef = useRef<any>(null);
    const handleEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); };
    const handleLeave = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 200); };
    return (
        <div className="relative h-full flex items-center" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all rounded-lg ${active || isOpen ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{label} <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} /></button>
            <div className={`absolute top-full left-0 w-full h-4 ${isOpen ? 'block' : 'hidden'}`} />
            <div className={`absolute top-[calc(100%+0px)] left-0 w-56 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50 transform transition-all duration-200 origin-top-left ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                 {items.map((item, i) => (<button key={i} onClick={() => { item.action(); setIsOpen(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 group transition-colors"><div className="text-[#848e9c] group-hover:text-[#0ea5e9] transition-colors"><item.icon size={18} /></div><span className="text-sm font-medium text-[#eaecef] group-hover:text-white">{item.label}</span></button>))}
            </div>
        </div>
    );
};

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, language, setLanguage, t, notifications, removeNotification, login, register, showNotification, systemSettings, chatMessages, sendChatMessage } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false); const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null); const [showMobileMenu, setShowMobileMenu] = useState(false); const [showChat, setShowChat] = useState(false);
  const langTimeoutRef = useRef<any>(null); const userTimeoutRef = useRef<any>(null);
  
  // Auth State
  const [authEmail, setAuthEmail] = useState(''); 
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Password Visibility
  const [captchaInput, setCaptchaInput] = useState(''); 
  const [captchaValue, setCaptchaValue] = useState(''); 
  const [isCaptchaValid, setIsCaptchaValid] = useState(false); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Captcha
  const generateCaptcha = () => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let result = ''; for (let i = 0; i < 5; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } setCaptchaValue(result); setCaptchaInput(''); setIsCaptchaValid(false); return result; };
  const drawCaptcha = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#1e2329'; ctx.fillRect(0, 0, canvas.width, canvas.height); for(let i=0; i<7; i++) { ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.3})`; ctx.beginPath(); ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height); ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height); ctx.stroke(); } const code = generateCaptcha(); ctx.font = 'bold 24px monospace'; ctx.fillStyle = '#0ea5e9'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; const charWidth = canvas.width / 6; for(let i=0; i<code.length; i++) { ctx.save(); const x = (i+1) * charWidth; const y = canvas.height/2; ctx.translate(x, y); ctx.rotate((Math.random() - 0.5) * 0.4); ctx.fillText(code[i], 0, 0); ctx.restore(); } };
  
  useEffect(() => { if (showAuthModal) setTimeout(drawCaptcha, 100); else { setAuthEmail(''); setAuthPassword(''); setShowPassword(false); } }, [showAuthModal]);
  const verifyCaptcha = () => { setIsCaptchaValid(captchaInput.toUpperCase() === captchaValue); };
  useEffect(() => { verifyCaptcha(); }, [captchaInput]);

  const handleAuth = async () => { 
      if (!isCaptchaValid) { showNotification('error', 'Incorrect Captcha'); drawCaptcha(); return; }
      const success = showAuthModal === 'login' ? await login(authEmail, authPassword) : await register(authEmail, authPassword, '');
      if (success) setShowAuthModal(null);
  };

  const handleLangEnter = () => { if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current); setShowLangMenu(true); };
  const handleLangLeave = () => { langTimeoutRef.current = setTimeout(() => setShowLangMenu(false), 200); };
  const handleUserEnter = () => { if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current); setShowUserMenu(true); };
  const handleUserLeave = () => { userTimeoutRef.current = setTimeout(() => setShowUserMenu(false), 200); };

  const languages: {code: Language, label: string}[] = [ { code: 'en', label: 'English' }, { code: 'zh', label: '简体中文' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' }, { code: 'ru', label: 'Русский' }, { code: 'fr', label: 'Français' }, { code: 'es', label: 'Español' } ];
  
  // Chat input
  const [chatInput, setChatInput] = useState('');
  const handleSendChat = () => {
      if(!chatInput.trim()) return;
      sendChatMessage(chatInput);
      setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans relative selection:bg-[#0ea5e9]/30">
      
      {/* Notifications */}
      <div className="fixed top-24 right-6 z-[150] space-y-3 pointer-events-none">
         {notifications.map(n => (<div key={n.id} className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 p-4 bg-[#1e2329] border-l-4 rounded shadow-2xl min-w-[320px] shadow-black/50" style={{ borderColor: n.type === 'success' ? '#0ecb81' : n.type === 'error' ? '#f6465d' : '#0ea5e9' }}>{n.type === 'success' && <CheckCircle size={20} className="text-[#0ecb81]" />}{n.type === 'error' && <AlertCircle size={20} className="text-[#f6465d]" />}{n.type === 'info' && <Info size={20} className="text-[#0ea5e9]" />}<div className="flex-1 text-sm font-medium text-white">{n.message}</div><button onClick={() => removeNotification(n.id)} className="text-[#848e9c] hover:text-white"><X size={14} /></button></div>))}
      </div>

      {/* Header */}
      <header className="h-16 bg-[#181a20] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                <div className="group-hover:rotate-180 transition-transform duration-700"><TslaLogo /></div><span className="text-xl font-bold tracking-tight text-white hidden sm:block">TSLA<span className="text-[#0ea5e9]">Global</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-2 h-full">
                <button onClick={() => onNavigate('home')} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${activePage === 'home' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('markets')}</button>
                <NavDropdown label={t('trade')} active={activePage === 'trade'} items={[{ label: t('spot'), icon: Activity, action: () => onNavigate('trade') }, { label: t('futures'), icon: TrendingUp, action: () => onNavigate('trade') }, { label: 'Grid Trading', icon: Zap, action: () => onNavigate('trade') }]} />
                <NavDropdown label={t('airdrop')} active={activePage === 'airdrop'} items={[{ label: t('mining_title'), icon: Cpu, action: () => onNavigate('airdrop') }, { label: t('referral_title'), icon: Gift, action: () => onNavigate('airdrop') }]} />
                <button onClick={() => onNavigate('assets')} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${activePage === 'assets' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('assets')}</button>
                {currentUser?.isAdmin && (<button onClick={() => onNavigate('admin')} className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${activePage === 'admin' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t('admin')}</button>)}
            </nav>
        </div>
        <div className="flex items-center gap-4 h-full">
          <div className="relative h-full flex items-center" onMouseEnter={handleLangEnter} onMouseLeave={handleLangLeave}>
            <button className={`p-2 flex items-center gap-1 transition-colors ${showLangMenu ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}><Globe size={18} /><span className="text-xs uppercase font-semibold hidden sm:inline">{language}</span></button>
            <div className={`absolute top-full right-0 w-full h-4 ${showLangMenu ? 'block' : 'hidden'}`} /><div className={`absolute top-[calc(100%+0px)] right-0 pt-0 transition-all duration-200 ${showLangMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}><div className="w-40 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">{languages.map(l => (<button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${language === l.code ? 'text-[#0ea5e9] font-bold bg-white/5' : 'text-[#848e9c]'}`}>{l.label}</button>))}</div></div>
          </div>
          <div className="relative h-full flex items-center" onMouseEnter={handleUserEnter} onMouseLeave={handleUserLeave}>
              <button className={`w-9 h-9 rounded-full bg-[#2b3139] hover:bg-[#363c45] flex items-center justify-center text-white transition-colors ${showUserMenu ? 'ring-2 ring-[#0ea5e9]' : ''}`}><UserIcon size={18} /></button>
              <div className={`absolute top-full right-0 w-full h-4 ${showUserMenu ? 'block' : 'hidden'}`} /><div className={`absolute top-[calc(100%+0px)] right-0 pt-0 transition-all duration-200 ${showUserMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}><div className="w-64 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">
                   {currentUser ? (
                       <>
                           <div className="px-4 py-3 border-b border-white/5 mb-1"><div className="text-white font-bold truncate">{currentUser.email}</div><div className="text-xs text-[#848e9c]">UID: {currentUser.id.substring(0,8)}...</div></div>
                           <button onClick={() => { onNavigate('user_center'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><Shield size={16}/> {t('security')}</button>
                           <button onClick={() => { onNavigate('assets'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><CreditCard size={16}/> {t('assets')}</button>
                           <button onClick={() => { onNavigate('airdrop'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><Gift size={16}/> {t('airdrop')}</button>
                           <div className="border-t border-white/5 my-1"></div>
                           <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#f6465d] hover:bg-white/5 transition-colors"><LogOut size={16}/> {t('logout')}</button>
                       </>
                   ) : (
                       <><div className="px-4 py-2 text-xs text-[#848e9c] font-bold uppercase tracking-wider">{t('guest')}</div><button onClick={() => { setShowAuthModal('login'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-white font-bold hover:bg-white/5 hover:text-[#0ea5e9] flex items-center justify-between group transition-colors"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div> {t('login')}</span><ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button><button onClick={() => { setShowAuthModal('signup'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-white font-bold hover:bg-white/5 hover:text-[#0ea5e9] flex items-center justify-between group transition-colors"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ecb81]"></div> {t('signup')}</span><ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button></>
                   )}
              </div></div>
          </div>
          <button className="lg:hidden text-[#848e9c] hover:text-white" onClick={() => setShowMobileMenu(true)}><MenuIcon size={24} /></button>
        </div>
      </header>
      {showMobileMenu && (
          <div className="fixed inset-0 z-[200] lg:hidden"><div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowMobileMenu(false)} /><div className="absolute top-0 left-0 w-4/5 max-w-xs h-full bg-[#181a20] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-200 border-r border-white/5">
              <div className="flex justify-between items-center mb-8"><div className="text-xl font-bold text-white flex items-center gap-2"><TslaLogo /><span>TSLA</span></div><button onClick={() => setShowMobileMenu(false)} className="text-[#848e9c]"><X size={24} /></button></div>
              <nav className="flex flex-col gap-2">{['home', 'trade', 'airdrop', 'assets'].map(p => (<button key={p} onClick={() => { onNavigate(p); setShowMobileMenu(false); }} className={`text-left p-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-between group ${activePage === p ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}`}>{t(p === 'home' ? 'markets' : p)}<ChevronDown size={16} className="-rotate-90 opacity-50 group-hover:opacity-100"/></button>))}{currentUser?.isAdmin && (<button onClick={() => { onNavigate('admin'); setShowMobileMenu(false); }} className="text-left p-4 text-lg font-medium text-[#848e9c] hover:text-white">{t('admin')}</button>)}</nav>
              <div className="mt-auto pt-8 border-t border-white/10 space-y-4">{!currentUser && (<div className="grid grid-cols-2 gap-4"><button onClick={() => { setShowAuthModal('login'); setShowMobileMenu(false); }} className="py-3 bg-[#2b3139] rounded-lg text-white font-bold">{t('login')}</button><button onClick={() => { setShowAuthModal('signup'); setShowMobileMenu(false); }} className="py-3 bg-[#0ea5e9] rounded-lg text-white font-bold">{t('signup')}</button></div>)}</div>
          </div></div>
      )}
      <main className="flex-1 overflow-y-auto relative z-0 flex flex-col">{children}</main>

      {/* CHAT WIDGET - FIXED */}
      <div className="fixed bottom-6 right-6 z-[100]">
          <button onClick={() => setShowChat(!showChat)} className="w-14 h-14 rounded-full bg-[#0ea5e9] text-white shadow-2xl flex items-center justify-center hover:bg-[#0284c7] transition-all hover:scale-110">
              {showChat ? <X size={24} /> : <MessageCircle size={28} />}
          </button>
          {showChat && (
              <div className="absolute bottom-16 right-0 w-80 bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                  <div className="bg-[#0ea5e9] p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><UserIcon size={16} /></div>
                      <div>
                          <div className="text-white font-bold text-sm">Customer Support</div>
                          <div className="text-white/80 text-xs flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]"></div> Online</div>
                      </div>
                  </div>
                  <div className="h-64 p-4 overflow-y-auto space-y-3 bg-[#0b0e11]">
                      {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex gap-2 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                              {!msg.isUser && <div className="w-6 h-6 rounded-full bg-[#0ea5e9] shrink-0 flex items-center justify-center text-xs text-white">S</div>}
                              <div className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.isUser ? 'bg-[#0ea5e9] text-white rounded-tr-none' : 'bg-[#1e2329] text-[#848e9c] rounded-tl-none border border-white/5'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-3 border-t border-white/5 bg-[#1e2329] flex gap-2">
                      <input 
                          type="text" 
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                          placeholder="Type a message..." 
                          className="flex-1 bg-[#0b0e11] rounded p-2 text-xs text-white border border-white/5 outline-none focus:border-[#0ea5e9]" 
                      />
                      <button onClick={handleSendChat} className="p-2 bg-[#2b3139] hover:bg-[#0ea5e9] rounded text-white transition-colors"><Send size={16} /></button>
                  </div>
              </div>
          )}
      </div>
      
      {/* ... (Footer & Auth Modal logic handled inside component structure) ... */}
      {activePage !== 'trade' && (
          <footer className="bg-[#0b0e11] border-t border-white/5 pt-16 pb-8">
              <div className="max-w-7xl mx-auto px-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mb-12">
                      <div className="col-span-2 lg:col-span-1">
                          <div className="flex items-center gap-2 mb-6"><TslaLogo /><span className="text-2xl font-bold text-white">TSLA<span className="text-[#0ea5e9]">Global</span></span></div>
                          <p className="text-[#848e9c] mb-6 text-sm leading-relaxed">The world's leading digital asset trading platform. Providing secure, professional, and stable digital asset trading services to global users.</p>
                      </div>
                      <div>
                          <h4 className="text-white font-bold mb-6">Ecosystem</h4>
                          <ul className="space-y-4 text-[#848e9c] text-sm">
                              <li><button onClick={() => onNavigate('trade')} className="hover:text-[#0ea5e9] transition-colors">Spot Trading</button></li>
                              <li><button onClick={() => onNavigate('trade')} className="hover:text-[#0ea5e9] transition-colors">Margin Trading</button></li>
                              <li><button onClick={() => onNavigate('airdrop')} className="hover:text-[#0ea5e9] transition-colors">Mining Pool</button></li>
                              <li><button onClick={() => onNavigate('home')} className="hover:text-[#0ea5e9] transition-colors">Launchpad</button></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="text-white font-bold mb-6">Support</h4>
                          <ul className="space-y-4 text-[#848e9c] text-sm">
                              <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Help Center</a></li>
                              <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Submit Request</a></li>
                              <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Fees</a></li>
                              <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Security</a></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="text-white font-bold mb-6">Community</h4>
                          <ul className="space-y-4 text-[#848e9c] text-sm">
                              <li><a href={systemSettings.telegram} target="_blank" className="hover:text-[#0ea5e9] transition-colors flex items-center gap-2"><MessageCircle size={14}/> Telegram</a></li>
                              <li><a href={systemSettings.twitter} target="_blank" className="hover:text-[#0ea5e9] transition-colors flex items-center gap-2"><Twitter size={14}/> Twitter</a></li>
                              <li><a href={systemSettings.discord} target="_blank" className="hover:text-[#0ea5e9] transition-colors flex items-center gap-2"><Github size={14}/> Discord</a></li>
                              <li><a href={`mailto:${systemSettings.supportEmail}`} className="hover:text-[#0ea5e9] transition-colors flex items-center gap-2"><Mail size={14}/> Email</a></li>
                          </ul>
                      </div>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[#848e9c] text-sm">
                      <p className="flex items-center gap-2">
                          © 2024 Tsla Global Exchange. All rights reserved.
                          <span className="mx-2 text-[#2b3139]">|</span>
                          <span className="flex items-center gap-1.5 text-[#0ecb81]"><div className="w-2 h-2 rounded-full bg-[#0ecb81]"></div> System Online</span>
                      </p>
                      <div className="flex gap-4 mt-4 md:mt-0"><a href={systemSettings.twitter} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#1DA1F2] hover:text-white transition-all"><Twitter size={16} /></a><a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={16} /></a><a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#E4405F] hover:text-white transition-all"><Instagram size={16} /></a><a href={systemSettings.telegram} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#0088cc] hover:text-white transition-all"><MessageCircle size={16} /></a><a href={`mailto:${systemSettings.supportEmail}`} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#0ea5e9] hover:text-white transition-all"><Mail size={16} /></a></div>
                  </div>
              </div>
          </footer>
      )}
      {showAuthModal && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl p-8 max-w-md w-full relative"><button onClick={() => setShowAuthModal(null)} className="absolute top-4 right-4 text-[#848e9c] hover:text-white"><X size={20} /></button><h2 className="text-2xl font-bold mb-1 text-center text-white">{showAuthModal === 'login' ? t('login_title') : t('signup')}</h2><p className="text-center text-[#848e9c] text-sm mb-6">Secure Access Portal</p><div className="space-y-4"><div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">{t('email')}</label><input type="text" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white focus:border-[#0ea5e9] focus:outline-none transition-colors" placeholder="name@example.com" /></div><div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">Password</label><div className="relative"><Shield className="absolute left-3 top-3.5 text-[#848e9c]" size={18} /><input type={showPassword ? "text" : "password"} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl pl-10 pr-10 py-3 text-white focus:border-[#0ea5e9] outline-none transition-colors" placeholder="••••••••" /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[#848e9c] hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div><div className="p-3 bg-[#0b0e11] rounded-lg border border-[#2b3139]"><div className="flex items-center justify-between mb-2"><span className="text-xs text-[#848e9c] uppercase font-semibold">Security Check</span><button onClick={drawCaptcha} className="text-[#0ea5e9] hover:text-white"><RefreshCw size={14} /></button></div><div className="flex gap-2"><canvas ref={canvasRef} width={150} height={50} className="bg-[#1e2329] rounded cursor-pointer" onClick={drawCaptcha} /><input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="flex-1 bg-[#1e2329] border border-[#2b3139] rounded p-2 text-white text-center tracking-widest uppercase font-bold focus:border-[#0ea5e9] outline-none" placeholder="CAPTCHA" /></div></div><button onClick={handleAuth} disabled={!authEmail || !authPassword || !isCaptchaValid} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${authEmail && authPassword && isCaptchaValid ? 'bg-[#0ea5e9] hover:bg-[#0284c7] shadow-[#0ea5e9]/20 translate-y-0' : 'bg-[#2b3139] text-[#848e9c] cursor-not-allowed'}`}>{showAuthModal === 'login' ? t('login') : t('signup')}</button>{showAuthModal === 'signup' && <p className="text-xs text-[#848e9c] text-center mt-2">Confirmation link will be sent to your email.</p>}</div></div></div>)}
    </div>
  );
};