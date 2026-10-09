import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Check, 
  AlertCircle,
  TrendingDown,
  Lock,
  Unlock,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ConversionItem } from '../types';
import { formatBytes } from '../utils/converter';

interface ImageCardProps {
  item: ConversionItem;
  onDownload: (item: ConversionItem) => void;
  onDelete: (id: string) => void;
  onReconvert: (id: string, options?: Partial<ConversionItem>) => void;
  onInspect: (item: ConversionItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onDownload,
  onDelete,
  onReconvert,
  onInspect,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | ''>(item.targetWidth);
  const [customHeight, setCustomHeight] = useState<number | ''>(item.targetHeight);
  const [lockAspect, setLockAspect] = useState<boolean>(item.lockAspectRatio);
  const [selectedFormat, setSelectedFormat] = useState<'webp' | 'jpeg' | 'png'>(item.targetFormat);

  const origExt = item.originalName.split('.').pop()?.toUpperCase() || 'IMG';
  const targetExt = item.targetFormat.toUpperCase();

  const savedBytes = item.convertedSize ? item.originalSize - item.convertedSize : 0;
  const savingsPercent = item.convertedSize
    ? Math.round((savedBytes / item.originalSize) * 100)
    : 0;

  const convertedRatio = item.convertedSize && item.originalSize > 0
    ? Math.min(100, Math.max(2, Math.round((item.convertedSize / item.originalSize) * 100)))
    : 100;

  const handleWidthChange = (val: number | '') => {
    setCustomWidth(val);
    if (lockAspect && typeof val === 'number' && item.originalWidth > 0) {
      const h = Math.round((val / item.originalWidth) * item.originalHeight);
      setCustomHeight(h);
    }
  };

  const handleHeightChange = (val: number | '') => {
    setCustomHeight(val);
    if (lockAspect && typeof val === 'number' && item.originalHeight > 0) {
      const w = Math.round((val / item.originalHeight) * item.originalWidth);
      setCustomWidth(w);
    }
  };

  const handleApplyIndividualChanges = () => {
    const finalW = typeof customWidth === 'number' ? customWidth : item.originalWidth;
    const finalH = typeof customHeight === 'number' ? customHeight : item.originalHeight;

    onReconvert(item.id, {
      targetFormat: selectedFormat,
      targetWidth: finalW,
      targetHeight: finalH,
      lockAspectRatio: lockAspect,
    });
    setIsCustomizing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-[#121415] border border-[#232628] hover:border-[#3ECF8E]/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg group relative overflow-hidden"
    >
      {/* High Savings Celebration Sparkle Tag */}
      {savingsPercent >= 50 && (
        <div className="absolute top-0 right-0 bg-[#3ECF8E]/10 border-b border-l border-[#3ECF8E]/30 px-3 py-1 rounded-bl-xl text-[10px] font-mono text-[#3ECF8E] font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-spin" />
          <span>Skvělá úspora -{savingsPercent}%</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left Section: Thumbnail & File Metadata */}
        <div className="flex items-center gap-4 min-w-0 flex-1 w-full">
          {/* Thumbnail Box with Hover Zoom & Click to Compare */}
          <div 
            onClick={() => onInspect(item)}
            className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-[#17191A] border border-[#2E3235] shrink-0 group/thumb cursor-pointer border-dashed hover:border-[#3ECF8E] transition-all shadow-md"
            title="Klikněte pro rozklik a porovnání před/po"
          >
            <img
              src={item.convertedPreview || item.originalPreview}
              alt={item.originalName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
            />
            {/* Hover overlay with Zoom Icon */}
            <div className="absolute inset-0 bg-[#0C0D0E]/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#3ECF8E]">
              <Eye className="w-5 h-5 mb-0.5 animate-bounce" />
              <span className="text-[9px] font-mono font-bold">Porovnat</span>
            </div>
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#0C0D0E]/90 text-[#3ECF8E] rounded border border-[#3ECF8E]/40 flex items-center gap-0.5">
              {item.status === 'completed' ? (
                <>
                  <Check className="w-2.5 h-2.5 text-[#3ECF8E]" />
                  <span>{targetExt}</span>
                </>
              ) : item.status === 'processing' ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#3ECF8E]" />
                  <span>{targetExt}</span>
                </>
              ) : (
                <span>{targetExt}</span>
              )}
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 
                onClick={() => onInspect(item)}
                className="text-xs sm:text-sm font-bold text-[#EDEDED] hover:text-[#3ECF8E] cursor-pointer truncate font-mono hover:underline transition-colors flex items-center gap-1.5"
                title="Klikněte pro rozklik detailu a porovnání"
              >
                <span>{item.originalName}</span>
                <Eye className="w-3.5 h-3.5 text-[#3ECF8E] opacity-70 inline" />
              </h4>

              {item.status === 'completed' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 text-[10px] font-mono font-bold text-[#3ECF8E]">
                  <Check className="w-3 h-3 text-[#3ECF8E]" />
                  <span>Hotovo (Výsledný {targetExt})</span>
                </span>
              )}

              {item.status === 'processing' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 text-[10px] font-mono font-bold text-[#3ECF8E] animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#3ECF8E]" />
                  <span>Probíhá konverze...</span>
                </span>
              )}
            </div>

            {/* Format transition & Dimensions */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#8E9296]">
              <span className="px-2 py-0.5 rounded-md bg-[#17191A] text-[#EDEDED] border border-[#232628]">
                {origExt} &#8594; <strong className="text-[#3ECF8E]">{targetExt}</strong>
              </span>

              <span className="text-[#5C6064]">•</span>

              <span className="text-[#8E9296]">
                {item.originalWidth}×{item.originalHeight}px
                {item.targetWidth !== item.originalWidth || item.targetHeight !== item.originalHeight ? (
                  <span className="text-[#3ECF8E] ml-1">
                    &#8594; {item.targetWidth}×{item.targetHeight}px
                  </span>
                ) : null}
              </span>

              {item.status === 'completed' && (
                <>
                  <span className="text-[#5C6064] hidden sm:inline">•</span>
                  <span className="text-[#8E9296] hidden sm:inline">
                    Výsledek ke stažení: <strong className="text-[#EDEDED]">{item.outputName}</strong>
                  </span>
                </>
              )}
            </div>

            {/* Size & Animated Progress Savings Bar */}
            {item.status === 'completed' && item.convertedSize && (
              <div className="pt-1.5 space-y-1 max-w-xl">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#8E9296]">
                    <s className="text-[#5C6064] mr-1.5">{formatBytes(item.originalSize)}</s>
                    <strong className="text-[#EDEDED]">{formatBytes(item.convertedSize)}</strong>
                  </span>

                  <span className={`font-bold flex items-center gap-1 ${
                    savedBytes > 0 ? 'text-[#3ECF8E]' : 'text-[#8E9296]'
                  }`}>
                    {savedBytes > 0 ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        <span>-{savingsPercent}% ({formatBytes(savedBytes)} méně)</span>
                      </>
                    ) : (
                      <span>+0% (Nezměněno)</span>
                    )}
                  </span>
                </div>

                {/* Animated Shimmer Progress Indicator Bar */}
                <div className="w-full h-2 bg-[#17191A] border border-[#232628] rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${convertedRatio}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-[#3ECF8E] rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(62,207,142,0.5)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            )}

            {item.status === 'processing' && (
              <div className="flex items-center gap-2 text-xs text-[#3ECF8E] font-mono pt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Zpracovávám konverzi a resample...</span>
              </div>
            )}

            {item.status === 'error' && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{item.error || 'Chyba konverze'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {item.status === 'completed' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInspect(item)}
                className="p-2.5 rounded-xl bg-[#17191A] hover:bg-[#1E2022] text-[#8E9296] hover:text-[#EDEDED] border border-[#232628] transition-colors"
                title="Porovnat kvalitu 1:1"
              >
                <Eye className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isCustomizing
                    ? 'bg-[#3ECF8E]/10 border-[#3ECF8E] text-[#3ECF8E]'
                    : 'bg-[#17191A] hover:bg-[#1E2022] text-[#8E9296] hover:text-[#EDEDED] border-[#232628]'
                }`}
                title="Upravit rozměry a formát"
              >
                <Sliders className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onDownload(item)}
                className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0C0D0E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Stáhnout</span>
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(item.id)}
            className="p-2.5 rounded-xl bg-[#17191A] hover:bg-red-500/10 text-[#8E9296] hover:text-red-400 border border-[#232628] hover:border-red-500/30 transition-colors"
            title="Smazat položku"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Expanded Custom Settings Drawer */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-[#232628] bg-[#17191A] p-4 rounded-xl space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#EDEDED]">
              <span>Individuální úprava obrázku</span>
              <button
                onClick={() => setIsCustomizing(false)}
                className="text-[#8E9296] hover:text-[#EDEDED]"
              >
                Zavřít
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Format Override */}
              <div>
                <label className="text-[10px] font-mono text-[#8E9296] block mb-1">Formát</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as 'webp' | 'jpeg' | 'png')}
                  className="w-full px-2.5 py-1.5 bg-[#121415] border border-[#2E3235] rounded-lg text-xs font-mono text-[#EDEDED] outline-none focus:border-[#3ECF8E]"
                >
                  <option value="webp">WebP (Optimální)</option>
                  <option value="jpeg">JPG (Standard)</option>
                  <option value="png">PNG (100% Kvalita)</option>
                </select>
              </div>

              {/* Custom Width & Lock */}
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-[#8E9296] block mb-1">Šířka (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => handleWidthChange(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full px-2.5 py-1.5 bg-[#121415] border border-[#2E3235] rounded-lg text-xs font-mono text-[#EDEDED] outline-none focus:border-[#3ECF8E]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`p-2 rounded-lg border ${
                    lockAspect ? 'bg-[#3ECF8E]/10 border-[#3ECF8E] text-[#3ECF8E]' : 'bg-[#121415] border-[#2E3235] text-[#8E9296]'
                  }`}
                  title={lockAspect ? 'Zámek poměru stran' : 'Neuzamčeno'}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1">
                  <label className="text-[10px] font-mono text-[#8E9296] block mb-1">Výška (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full px-2.5 py-1.5 bg-[#121415] border border-[#2E3235] rounded-lg text-xs font-mono text-[#EDEDED] outline-none focus:border-[#3ECF8E]"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex items-end">
                <button
                  onClick={handleApplyIndividualChanges}
                  className="w-full py-2 px-3 bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0C0D0E] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Přepočítat & Převést</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
