import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, CheckCircle, Clock, Smartphone, Lock, User as UserIcon, AlertCircle, X, FileText } from 'lucide-react';

export const UserCenter: React.FC = () => {
  const { currentUser, t, toggle2FA, submitKYC } = useStore();
  const [showKYCModal, setShowKYCModal] = useState(false);

  if (!currentUser) return <div className="p-10 text-center text-[#848e9c]">Please Log In</div>;

  const handleKYCSubmit = async () => {
      const success = await submitKYC('User'); // Auto-verify
      if(success) setShowKYCModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-8">{t('user_center')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
           <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6 text-center">
               <div className="w-24 h-24 bg-[#2b3139] rounded-full mx-auto mb-4 flex items-center justify-center text-[#848e9c]"><UserIcon size={48} /></div>
               <div className="text-white font-bold text-lg mb-1">{currentUser.email}</div>
               <div className="text-[#848e9c] text-sm mb-4">UID: {currentUser.id.substring(0,8)}...</div>
               <div className={`inline-block px-3 py-1 rounded font-bold text-xs uppercase border ${currentUser.kycLevel===2 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                   {currentUser.kycLevel === 2 ? 'Verified' : 'Unverified'}
               </div>
           </div>
        </div>
        <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-[#0ea5e9]" /> {t('security')}</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-[#2b3139]">
                        <div className="flex items-center gap-4">
                            <Lock size={24} className="text-[#848e9c]" />
                            <div><div className="text-white font-bold">Login Password</div><div className="text-[#848e9c] text-sm">Used for login and security checks</div></div>
                        </div>
                        <button className="px-4 py-2 border border-[#2b3139] rounded text-white hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">Change</button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <AlertCircle size={24} className={currentUser.kycLevel === 2 ? "text-[#0ecb81]" : "text-[#848e9c]"} />
                            <div>
                                <div className="text-white font-bold">Identity Verification</div>
                                <div className="text-[#848e9c] text-sm">{currentUser.kycLevel === 2 ? 'You are fully verified.' : 'Verify your identity to increase limits.'}</div>
                            </div>
                        </div>
                        {currentUser.kycLevel < 2 ? (
                             <button onClick={() => setShowKYCModal(true)} className="flex items-center gap-2 px-4 py-2 border border-[#f0b90b] text-[#f0b90b] rounded font-bold hover:bg-[#f0b90b]/10">Verify Now</button>
                        ) : (
                             <button disabled className="flex items-center gap-2 px-4 py-2 bg-[#0ecb81]/10 text-[#0ecb81] rounded font-bold border border-[#0ecb81]/20"><CheckCircle size={16} /> Verified</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {showKYCModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1e2329] border border-[#2b3139] rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} className="text-[#f0b90b]"/> Upgrade to Level 2</h3>
                      <button onClick={() => setShowKYCModal(false)} className="text-[#848e9c] hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="space-y-6">
                      <p className="text-[#848e9c] text-sm">Level 2 users enjoy higher withdrawal limits, exclusive airdrops, and lower trading fees. By clicking below, you agree to our Terms of Service.</p>
                      <button onClick={handleKYCSubmit} className="w-full py-3 bg-[#0ea5e9] text-white font-bold rounded hover:bg-[#0284c7] transition-colors shadow-lg">Instant Verify</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};