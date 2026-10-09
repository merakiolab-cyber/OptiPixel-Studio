import React from 'react';
import { motion } from 'motion/react';
import { TrendingDown, FileImage, HardDrive, Sparkles } from 'lucide-react';
import { formatBytes } from '../utils/converter';

interface SummaryStatsProps {
  totalCount: number;
  completedCount: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  totalCount,
  completedCount,
  totalOriginalSize,
  totalConvertedSize,
}) => {
  if (completedCount === 0) return null;

  const savedBytes = Math.max(0, totalOriginalSize - totalConvertedSize);
  const savingsPercent = totalOriginalSize > 0
    ? Math.round((savedBytes / totalOriginalSize) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
    >
      {/* Total Files Stat */}
      <div className="bg-[#121415] border border-[#232628] rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#8E9296]">Zpracované obrázky</span>
          <div className="text-2xl font-extrabold font-mono text-[#EDEDED] mt-1">
            {completedCount} <span className="text-xs font-normal text-[#8E9296]">/ {totalCount} celkem</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#17191A] border border-[#232628] flex items-center justify-center text-[#3ECF8E]">
          <FileImage className="w-5 h-5" />
        </div>
      </div>

      {/* Size Before / After Stat */}
      <div className="bg-[#121415] border border-[#232628] rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#8E9296]">Velikost před / po</span>
          <div className="text-base font-bold font-mono text-[#EDEDED] mt-1 flex items-center gap-2">
            <span className="line-through text-[#8E9296] text-xs">{formatBytes(totalOriginalSize)}</span>
            <span className="text-[#3ECF8E] font-extrabold text-lg">{formatBytes(totalConvertedSize)}</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#17191A] border border-[#232628] flex items-center justify-center text-[#3ECF8E]">
          <HardDrive className="w-5 h-5" />
        </div>
      </div>

      {/* Data Savings Stat */}
      <motion.div 
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-[#121415] border border-[#3ECF8E]/40 bg-[#3ECF8E]/5 rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#3ECF8E]/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-[11px] font-mono uppercase text-[#3ECF8E] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Celková úspora dat
          </span>
          <div className="text-2xl font-extrabold font-mono text-[#3ECF8E] mt-1 flex items-baseline gap-2">
            <span>-{savingsPercent}%</span>
            <span className="text-xs font-semibold text-[#3ECF8E]/80">({formatBytes(savedBytes)} méně)</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shadow-md">
          <TrendingDown className="w-6 h-6" />
        </div>
      </motion.div>
    </motion.div>
  );
};
