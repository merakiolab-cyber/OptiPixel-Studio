import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface ConversionIndicatorProps {
  isConverting: boolean;
  completedCount: number;
  totalCount: number;
  currentFileName?: string;
  targetFormat: string;
}

export const ConversionIndicator: React.FC<ConversionIndicatorProps> = ({
  isConverting,
  completedCount,
  totalCount,
  currentFileName,
  targetFormat,
}) => {
  if (totalCount === 0) return null;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllDone = completedCount === totalCount && !isConverting;

  return (
    <AnimatePresence mode="wait">
      {isConverting ? (
        <motion.div
          key="converting"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-[#121415] border-2 border-[#3ECF8E] rounded-2xl p-5 shadow-[0_0_25px_rgba(62,207,142,0.15)] relative overflow-hidden"
        >
          {/* Subtle glowing accent background */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-[#3ECF8E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#EDEDED] font-mono flex items-center gap-1.5">
                      <span>Probíhá automatická konverze & optimalizace...</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                      Aktivní proces
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9296] mt-0.5 flex items-center gap-1.5 truncate">
                    <span>Zpracovávám soubor:</span>
                    <strong className="text-[#3ECF8E] font-mono truncate max-w-[200px] sm:max-w-xs">
                      {currentFileName || 'Obrázek'}
                    </strong>
                    <ArrowRight className="w-3 h-3 text-[#5C6064] shrink-0" />
                    <span className="font-mono text-[#EDEDED] uppercase">{targetFormat}</span>
                  </p>
                </div>
              </div>

              {/* Counter status */}
              <div className="text-right sm:self-center font-mono">
                <div className="text-sm font-bold text-[#3ECF8E]">
                  {completedCount} z {totalCount} hotovo
                </div>
                <div className="text-[11px] text-[#8E9296]">
                  {progressPercent}% dokončeno
                </div>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-2.5 bg-[#17191A] border border-[#232628] rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, progressPercent)}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#2BB376] to-[#3ECF8E] rounded-full relative overflow-hidden shadow-[0_0_12px_rgba(62,207,142,0.6)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
                </motion.div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9296]">
                <span className="flex items-center gap-1 text-[#3ECF8E]">
                  <Zap className="w-3 h-3" />
                  Konverze se spouští ihned po nahrání souboru
                </span>
                <span>Canvas 100% Client-side</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : isAllDone ? (
        <motion.div
          key="completed"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-[#121415] border border-[#3ECF8E]/40 bg-[#3ECF8E]/5 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#3ECF8E]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#EDEDED] font-mono">
                    Konverze dokončena – soubory níže jsou již hotové!
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] text-[10px] font-mono font-bold">
                    ✓ PŘIPRAVENO KE STAŽENÍ
                  </span>
                </div>
                <p className="text-xs text-[#8E9296]">
                  Všechny obrázky v sekci <strong className="text-[#EDEDED]">Zpracované soubory</strong> níže jsou již úspěšně zkonvertované a optimalizované verze. Můžete si je ihned stáhnout nebo rozkliknout pro porovnání.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#17191A] border border-[#232628] text-[#3ECF8E]">
                {completedCount} {completedCount === 1 ? 'soubor převeden' : completedCount < 5 ? 'soubory převedeny' : 'souborů převedeno'}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
