
import React from 'react';
import { useStore } from '../context/StoreContext';
import { FileText, ArrowLeft } from 'lucide-react';

export const Whitepaper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#848e9c] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center text-[#0ea5e9]">
                <FileText size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">TESLA Whitepaper</h1>
                <p className="text-[#848e9c]">Version 1.0</p>
            </div>
        </div>
      </div>

      <div className="bg-[#1e2329] border border-white/5 rounded-2xl p-8 sm:p-12 space-y-12 text-[#eaecef] leading-relaxed">
        
        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">1. Introduction</h2>
            <p className="text-[#848e9c]">
                TESLA is a decentralized digital token deployed on the BNB Smart Chain, designed to facilitate peer-to-peer value transfer and decentralized liquidity participation. The project emphasizes transparency, simplicity, and permissionless access.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">2. Vision</h2>
            <p className="text-[#848e9c]">
                TESLA aims to provide an open token infrastructure that can be freely traded on decentralized exchanges, enabling community-driven liquidity and market discovery without centralized control.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">3. Token Information</h2>
            <div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Token Name</div>
                    <div className="text-white font-mono">TESLA</div>
                </div>
                <div>
                    <div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Symbol</div>
                    <div className="text-white font-mono">TESLA</div>
                </div>
                <div>
                    <div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Blockchain</div>
                    <div className="text-white font-mono">BNB Smart Chain (BEP-20)</div>
                </div>
                <div>
                    <div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Decimals</div>
                    <div className="text-white font-mono">18</div>
                </div>
                <div className="md:col-span-2">
                    <div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Total Supply</div>
                    <div className="text-white font-mono text-xl">1,000,000,000 TESLA</div>
                </div>
            </div>
            <p className="text-[#848e9c] mt-4 text-sm italic">
                *No additional minting functions exist beyond the initial deployment.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">4. Token Utility</h2>
            <p className="text-[#848e9c] mb-4">TESLA is designed for:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#848e9c]">
                <li>Decentralized exchange trading</li>
                <li>Liquidity pool participation</li>
                <li>Community-driven ecosystem integration</li>
            </ul>
            <p className="text-[#f6465d] mt-4 text-sm bg-[#f6465d]/10 p-3 rounded border border-[#f6465d]/20">
                The token does not promise profits or guaranteed returns.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">5. Liquidity Mechanism</h2>
            <p className="text-[#848e9c]">
                TESLA liquidity is provided through decentralized exchanges such as PancakeSwap. Pricing is determined algorithmically by liquidity pool reserves and market demand.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">6. Security & Transparency</h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0ecb81] rounded-full"></div>
                    <span className="text-[#848e9c]">Smart contract deployed on BNB Smart Chain</span>
                </li>
                <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0ecb81] rounded-full"></div>
                    <span className="text-[#848e9c]">Token contract publicly verifiable on BscScan</span>
                </li>
                <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0ecb81] rounded-full"></div>
                    <span className="text-[#848e9c]">Ownership transparency via on-chain data</span>
                </li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">7. Disclaimer</h2>
            <div className="p-4 bg-[#f0b90b]/10 border border-[#f0b90b]/20 rounded-xl text-[#f0b90b] text-sm leading-relaxed">
                TESLA is a decentralized digital token intended for experimental and utility purposes only. Participation involves market risk. Users should conduct independent research before interacting with the token.
            </div>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#0ea5e9] pl-4">8. Conclusion</h2>
            <p className="text-[#848e9c]">
                TESLA represents an open, decentralized token experiment focused on transparency and permissionless access within the BNB Smart Chain ecosystem.
            </p>
        </section>

      </div>
    </div>
  );
};
