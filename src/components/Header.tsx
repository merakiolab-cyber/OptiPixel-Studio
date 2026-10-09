import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, Download, Trash2, ShieldCheck, RefreshCcw, Wand2 } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  completedCount: number;
  onClearAll: () => void;
  onDownloadAllZip: () => void;
  isZipping: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  itemCount,
  completedCount,
  onClearAll,
  onDownloadAllZip,
  isZipping,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232628] bg-[#0C0D0E]/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3.5 shrink-0">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-xl bg-[#17191A] border border-[#2E3235] flex items-center justify-center text-[#3ECF8E] shadow-lg group hover:border-[#3ECF8E]/60 transition-colors cursor-pointer"
          >
            {/* Playful Ambient Logo Glow */}
            <div className="absolute inset-0 bg-[#3ECF8E]/20 rounded-xl blur-md group-hover:bg-[#3ECF8E]/40 transition-all" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="relative z-10"
            >
              <Wand2 className="w-5 h-5 text-[#3ECF8E]" />
            </motion.div>
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#EDEDED] font-mono">
                Opti<span className="text-[#3ECF8E]">Pixel</span> Studio
              </span>
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30"
              >
                PRO RESIZER
              </motion.span>
            </div>
            <p className="text-xs text-[#8E9296] hidden sm:block font-sans">
              Ultra-fast WebP / JPG / PNG converter & non-destructive resizer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {itemCount > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onClearAll}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#8E9296] hover:text-[#EDEDED] bg-[#121415] hover:bg-[#17191A] border border-[#232628] hover:border-red-500/40 rounded-lg transition-colors flex items-center gap-1.5"
                title="Vymazat všechny položky"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Vymazat vše</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onDownloadAllZip}
                disabled={completedCount === 0 || isZipping}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg ${
                  completedCount > 0 && !isZipping
                    ? 'bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0C0D0E] shadow-[#3ECF8E]/20'
                    : 'bg-[#1C1F21] text-[#5C6064] border border-[#232628] cursor-not-allowed'
                }`}
              >
                <motion.div animate={isZipping ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                  <Download className="w-3.5 h-3.5" />
                </motion.div>
                <span>
                  {isZipping ? 'Balím ZIP...' : `Stáhnout ZIP (${completedCount})`}
                </span>
              </motion.button>
            </>
          )}

          <div className="h-4 w-px bg-[#232628] mx-1 hidden md:block" />

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#8E9296] bg-[#121415] border border-[#232628] px-3 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>100% Client-Side Private</span>
          </div>
        </div>
      </div>
    </header>
  );
};
