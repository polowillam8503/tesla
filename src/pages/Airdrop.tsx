import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Zap, Hammer, Share2, Check, Lock, Unlock, ShoppingCart, Server, Database, Network, Copy } from 'lucide-react';
import { MiningRig } from '../types';

export const Airdrop: React.FC = () => {
    const { customToken, currentUser, mine, claimAirdrop, buyRig, miningRigs, t, showNotification } = useStore();
    const [isMining, setIsMining] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'MINING' | 'REFERRAL'>('MINING');
    
    // Safely check funding/trading wallets
    const hasDeposit = currentUser && Array.isArray(currentUser.fundingWallet) 
        ? currentUser.fundingWallet.some(a => (a.amount || 0) > 0) 
        : false;
    const hasTrade = currentUser && Array.isArray(currentUser.tradingWallet)
        ? currentUser.tradingWallet.some(a => (a.amount || 0) > 0)
        : false;
        
    const isEligible = hasDeposit && hasTrade;

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isMining && currentUser) {
            interval = setInterval(() => {
                mine(currentUser.id);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isMining, currentUser, mine]);

    const handleMiningToggle = () => {
        if (!currentUser) {
            showNotification('error', t('login_title'));
            return;
        }
        setIsMining(!isMining);
    };

    const handleBuyRig = (rig: MiningRig) => {
        if (!currentUser) {
            showNotification('error', t('login_title'));
            return;
        }
        buyRig(currentUser.id, rig);
    };

    const handleClaim = () => {
        if (!currentUser) return;
        if (!isEligible) {
            showNotification('error', t('airdrop_locked'));
            return;
        }
        claimAirdrop(currentUser.id);
    };

    const handleCopyInvite = () => {
        if(currentUser) {
            navigator.clipboard.writeText(`https://tsla-global.com/register?ref=${currentUser.inviteCode}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            showNotification('success', 'Invite Link Copied');
        }
    };

    const QuestItem: React.FC<{ label: string, done: boolean }> = ({ label, done }) => (
        <div className={`flex items-center justify-between p-4 rounded-lg border ${done ? 'bg-[#0ecb81]/10 border-[#0ecb81]/30' : 'bg-[#181a20] border-white/5'}`}>
            <span className="text-white font-medium text-sm">{label}</span>
            {done ? (
                <span className="flex items-center gap-1 text-[#0ecb81] text-xs font-bold uppercase"><Check size={14}/> {t('completed')}</span>
            ) : (
                <span className="text-[#848e9c] text-xs font-bold uppercase">{t('pending')}</span>
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex justify-center mb-8 sm:mb-10">
                <div className="bg-[#1e2329] p-1 rounded-xl border border-[#2b3139] flex">
                    <button onClick={() => setActiveTab('MINING')} className={`px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all ${activeTab === 'MINING' ? 'bg-[#0ea5e9] text-white' : 'text-[#848e9c] hover:text-white'}`}>
                        {t('mining_title')}
                    </button>
                    <button onClick={() => setActiveTab('REFERRAL')} className={`px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all ${activeTab === 'REFERRAL' ? 'bg-[#0ea5e9] text-white' : 'text-[#848e9c] hover:text-white'}`}>
                        {t('referral_title')}
                    </button>
                </div>
            </div>

            {activeTab === 'MINING' && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    <div className="md:col-span-2 bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 sm:p-8 relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Hammer size={200} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${isMining ? 'bg-[#0ecb81] animate-ping' : 'bg-[#f6465d]'}`}></div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">{t('mining_title')} Console</h2>
                                </div>
                                <div className="bg-black/30 px-3 py-1 rounded text-xs font-mono text-[#0ea5e9]">v.3.4.1 Connected</div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                                <div>
                                    <div className="text-[#848e9c] text-xs mb-1 uppercase font-semibold tracking-wider">Total Hashrate</div>
                                    <div className="text-4xl sm:text-5xl font-mono font-bold text-white flex items-baseline gap-2">{currentUser?.hashrate || 0} <span className="text-lg text-[#f0b90b]">MH/s</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#848e9c] text-xs mb-1 uppercase font-semibold tracking-wider">Unclaimed Rewards</div>
                                    <div className="text-4xl sm:text-5xl font-mono font-bold text-[#0ecb81] flex items-baseline gap-2 justify-end">{Number(currentUser?.miningBalance || 0).toFixed(6)}<span className="text-lg text-white">{customToken ? customToken.symbol : 'TSLA'}</span></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-8">{[...Array(4)].map((_, i) => (<div key={i} className="bg-[#0b0e11] rounded p-2 text-center border border-[#2b3139]"><div className="text-[10px] text-[#848e9c] uppercase mb-1">Core {i+1}</div><div className={`h-1 w-full rounded-full ${isMining ? 'bg-[#0ecb81]' : 'bg-[#2b3139]'}`}></div></div>))}</div>
                            <div className="w-full bg-[#0b0e11] rounded-full h-4 mb-8 overflow-hidden border border-[#2b3139]"><div className={`h-full transition-all duration-1000 ${isMining ? 'bg-gradient-to-r from-[#0ea5e9] to-[#0ecb81] w-full animate-pulse' : 'w-0'}`}></div></div>
                            <button onClick={handleMiningToggle} className={`w-full py-4 font-bold rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${isMining ? 'bg-[#f6465d] hover:bg-[#d9304e] text-white shadow-[#f6465d]/20' : 'bg-[#0ecb81] hover:bg-[#0aa869] text-white shadow-[#0ecb81]/20'}`}><Zap size={20} fill="currentColor" />{isMining ? t('stop_mining') : t('start_mining')}</button>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-4">
                        <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139] flex-1"><div className="flex items-center gap-2 mb-4 text-white font-bold"><Network size={18} className="text-[#0ea5e9]"/> Network Status</div><div className="space-y-4"><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Difficulty</span><span className="text-white font-mono">14.2 T</span></div><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Block Height</span><span className="text-white font-mono">842,129</span></div><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Pool Hashrate</span><span className="text-white font-mono">1.2 EH/s</span></div></div></div>
                        <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139] flex-1 flex flex-col justify-center items-center text-center"><Database size={32} className="text-[#f0b90b] mb-2" /><div className="text-sm font-bold text-white mb-1">Your Rigs</div><div className="text-2xl font-mono text-[#f0b90b]">{currentUser && Array.isArray(currentUser.rigs) ? currentUser.rigs.length : 0}</div></div>
                    </div>
                    <div className="md:col-span-3 space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart size={20} className="text-[#0ea5e9]" /> Cloud Rig Market</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {miningRigs.map(rig => (
                                <div key={rig.id} className="bg-[#181a20] border border-white/5 p-4 rounded-xl flex flex-col justify-between gap-4 hover:border-[#0ea5e9]/50 transition-colors group">
                                    <div className="flex items-start justify-between"><div className="w-12 h-12 bg-[#2b3139] rounded-lg flex items-center justify-center text-[#848e9c] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors"><Server size={24} /></div><div className="text-right"><div className="text-[#f0b90b] font-bold text-lg font-mono">{rig.cost} USDT</div><div className="text-[10px] text-[#848e9c] uppercase">Price</div></div></div>
                                    <div><div className="text-white font-bold text-lg mb-1">{rig.name}</div><div className="flex justify-between text-xs text-[#848e9c] border-t border-white/5 pt-2"><span>{rig.hashrate} MH/s</span><span className="text-[#0ecb81]">{rig.dailyOutput} TSLA/Day</span></div></div>
                                    <button onClick={() => handleBuyRig(rig)} className="w-full px-4 py-2 bg-[#2b3139] hover:bg-[#0ea5e9] hover:text-white text-[#848e9c] rounded-lg font-bold text-sm transition-colors whitespace-nowrap">Purchase Rig</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] rounded-2xl border border-[#2b3139] p-6 sm:p-8 relative mt-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"><h2 className="text-2xl font-bold text-white">{t('airdrop_title')}</h2><div className="bg-[#f0b90b]/10 text-[#f0b90b] px-3 py-1 rounded text-sm font-bold border border-[#f0b90b]/20 text-center sm:text-left">Reward: 100 {customToken ? customToken.symbol : 'TSLA'}</div></div>
                    <div className="space-y-3 mb-8">
                        <QuestItem label={t('quest_deposit')} done={hasDeposit} />
                        <QuestItem label={t('quest_trade')} done={hasTrade} />
                    </div>
                    <button onClick={handleClaim} disabled={!isEligible} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isEligible ? 'bg-[#f0b90b] text-black hover:bg-[#d4a406] shadow-lg shadow-[#f0b90b]/20' : 'bg-[#2b3139] text-[#848e9c] cursor-not-allowed border border-white/5'}`}>{isEligible ? <Unlock size={20} /> : <Lock size={20} />}{isEligible ? t('airdrop_claim') : t('airdrop_locked')}</button>
                </div>
                </>
            )}
            {activeTab === 'REFERRAL' && (
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-4 sm:p-8 w-full overflow-hidden">
                     <div className="text-center max-w-2xl mx-auto mb-12"><Share2 size={48} className="text-[#0ea5e9] mx-auto mb-4" /><h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('referral_title')}</h2><p className="text-[#848e9c] text-sm sm:text-base">{t('referral_desc')}</p></div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                         <div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">{t('my_referrals')}</div><div className="text-3xl text-white font-bold">{currentUser?.referralCount || 0}</div></div>
                         <div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">{t('total_earned')}</div><div className="text-3xl text-[#0ecb81] font-bold">${Number(currentUser?.referralEarnings || 0).toFixed(2)}</div></div>
                         <div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">Commission Rate</div><div className="text-3xl text-[#f0b90b] font-bold">20%</div></div>
                     </div>
                     {currentUser ? (<div className="bg-[#0b0e11] p-4 sm:p-6 rounded-xl border border-[#2b3139] max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-[#848e9c] transition-colors w-full"><div className="flex-1 w-full text-center sm:text-left overflow-hidden min-w-0"><div className="text-xs text-[#848e9c] uppercase tracking-wider mb-1">{t('invite_link')}</div><div className="text-white font-mono font-bold text-sm sm:text-base break-all">https://tsla-global.com/register?ref={currentUser.inviteCode}</div></div><div className="p-3 bg-[#2b3139] rounded-lg shrink-0" onClick={(e) => { e.stopPropagation(); handleCopyInvite(); }}>{copied ? <Check size={20} className="text-[#0ecb81]"/> : <Copy size={20} className="text-white"/>}</div></div>) : (<div className="text-center"><button className="px-8 py-3 bg-[#0ea5e9] rounded-lg text-white font-bold">Log in to Invite</button></div>)}
                </div>
            )}
        </div>
    );
};