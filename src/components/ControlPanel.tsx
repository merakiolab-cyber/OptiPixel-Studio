import React from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  FileCode, 
  Scaling, 
  Lock, 
  Unlock, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { TargetFormat, QualityPreset, ResizeMode } from '../types';

interface ControlPanelProps {
  globalTargetFormat: TargetFormat;
  setGlobalTargetFormat: (fmt: TargetFormat) => void;
  qualityPreset: QualityPreset;
  setQualityPreset: (preset: QualityPreset) => void;
  customQuality: number;
  setCustomQuality: (val: number) => void;
  
  resizeMode: ResizeMode;
  setResizeMode: (mode: ResizeMode) => void;
  globalScalePercent: number;
  setGlobalScalePercent: (percent: number) => void;
  globalTargetWidth: number | '';
  setGlobalTargetWidth: (w: number | '') => void;
  globalLockAspectRatio: boolean;
  setGlobalLockAspectRatio: (lock: boolean) => void;
  
  onApplyToAll: () => void;
  hasItems: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  globalTargetFormat,
  setGlobalTargetFormat,
  qualityPreset,
  setQualityPreset,
  customQuality,
  setCustomQuality,
  resizeMode,
  setResizeMode,
  globalScalePercent,
  setGlobalScalePercent,
  globalTargetWidth,
  setGlobalTargetWidth,
  globalLockAspectRatio,
  setGlobalLockAspectRatio,
  onApplyToAll,
  hasItems,
}) => {
  return (
    <div className="w-full bg-[#121415] border border-[#232628] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3ECF8E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#232628]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#17191A] border border-[#2E3235] flex items-center justify-center text-[#3ECF8E]">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[#EDEDED] uppercase tracking-wider font-mono">
            Globální Nastavení Konverze & Resizu
          </h2>
        </div>

        {hasItems && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onApplyToAll}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#17191A] hover:bg-[#1E2022] text-[#3ECF8E] border border-[#3ECF8E]/40 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Aplikovat na vše</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-5">
        {/* 1. Target Format */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8E9296] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-[#3ECF8E]" />
              Cílový Formát
            </label>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#17191A] rounded-xl border border-[#232628] relative">
            {(['auto', 'webp', 'jpeg', 'png'] as TargetFormat[]).map((fmt) => {
              const isActive = globalTargetFormat === fmt;
              return (
                <button
                  key={fmt}
                  onClick={() => setGlobalTargetFormat(fmt)}
                  className={`relative px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left flex items-center justify-between z-10 ${
                    isActive ? 'text-[#EDEDED] font-bold' : 'text-[#8E9296] hover:text-[#EDEDED]'
                  }`}
                >
                  {/* Motion Sliding Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTargetFormatBg"
                      className="absolute inset-0 bg-[#232628] border border-[#3ECF8E]/50 rounded-lg shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span>
                    {fmt === 'auto' && 'Auto'}
                    {fmt === 'webp' && '.WebP'}
                    {fmt === 'jpeg' && '.JPG / .JPEG'}
                    {fmt === 'png' && '.PNG'}
                  </span>
                  {fmt === 'auto' && <span className="text-[10px] font-mono text-[#3ECF8E]">Doporučeno</span>}
                  {fmt === 'webp' && <span className="text-[10px] font-mono text-[#8E9296]">Web Opti</span>}
                  {fmt === 'png' && <span className="text-[10px] font-mono text-[#3ECF8E]">100% Max</span>}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#8E9296] italic">
            {globalTargetFormat === 'auto' && 'Automaticky převádí PNG/JPG na WebP. Pokud vložíte WebP, převede na JPG/PNG.'}
            {globalTargetFormat === 'webp' && 'WebP ušetří v průměru 70–80 % velkosti bez ztráty vizuální kvality.'}
            {globalTargetFormat === 'jpeg' && 'Vhodné pro starší systémy nepodporující WebP.'}
            {globalTargetFormat === 'png' && 'Maximální PNG kvalita s plným zachováním průhlednosti.'}
          </p>
        </div>

        {/* 2. Quality Preset */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8E9296] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#3ECF8E]" />
              Míra Komprese / Kvalita
            </label>
            <motion.span 
              key={qualityPreset + customQuality}
              initial={{ scale: 1.25, color: '#3ECF8E' }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-xs font-mono font-bold text-[#3ECF8E]"
            >
              {qualityPreset === 'web' ? '82% Web' : qualityPreset === 'max' ? '100% Max' : `${Math.round(customQuality * 100)}%`}
            </motion.span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#17191A] rounded-xl border border-[#232628] relative">
            {[
              { id: 'web', label: 'Web Optimal' },
              { id: 'max', label: '100% Originál' },
              { id: 'custom', label: 'Vlastní' },
            ].map((preset) => {
              const isActive = qualityPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setQualityPreset(preset.id as QualityPreset)}
                  className={`relative px-2.5 py-2 text-xs font-medium rounded-lg transition-colors text-center z-10 ${
                    isActive ? 'text-[#EDEDED] font-bold' : 'text-[#8E9296] hover:text-[#EDEDED]'
                  }`}
                >
                  {/* Motion Sliding Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeQualityPresetBg"
                      className="absolute inset-0 bg-[#232628] border border-[#3ECF8E]/50 rounded-lg shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {preset.label}
                </button>
              );
            })}
          </div>

          {qualityPreset === 'custom' ? (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5 pt-1"
            >
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={customQuality}
                onChange={(e) => setCustomQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#232628] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8E9296]">
                <span>Malá velikost (10%)</span>
                <span>Vysoká kvalita (100%)</span>
              </div>
            </motion.div>
          ) : (
            <p className="text-[11px] text-[#8E9296] italic">
              {qualityPreset === 'web'
                ? 'Optimální vyvážení pro rychlé načítání webu (82% kvalita, nulový šum).'
                : '100% bezztrátový převod bez kompresních artefaktů.'}
            </p>
          )}
        </div>

        {/* 3. Resize Engine */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8E9296] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Scaling className="w-3.5 h-3.5 text-[#3ECF8E]" />
              Rozměry v PX / Změna Velikosti
            </label>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#17191A] rounded-xl border border-[#232628] relative">
            {[
              { id: 'original', label: '100% Originál' },
              { id: 'scale', label: 'Měřítko %' },
              { id: 'custom_px', label: 'Přesně v px' },
            ].map((mode) => {
              const isActive = resizeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setResizeMode(mode.id as ResizeMode)}
                  className={`relative px-2 py-2 text-xs font-medium rounded-lg transition-colors text-center z-10 ${
                    isActive ? 'text-[#EDEDED] font-bold' : 'text-[#8E9296] hover:text-[#EDEDED]'
                  }`}
                >
                  {/* Motion Sliding Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeResizeModeBg"
                      className="absolute inset-0 bg-[#232628] border border-[#3ECF8E]/50 rounded-lg shadow-md -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {mode.label}
                </button>
              );
            })}
          </div>

          {resizeMode === 'scale' && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="number"
                min="1"
                max="500"
                value={globalScalePercent}
                onChange={(e) => setGlobalScalePercent(Math.max(1, parseInt(e.target.value) || 100))}
                className="w-20 px-2.5 py-1.5 bg-[#17191A] border border-[#2E3235] rounded-lg text-xs font-mono text-[#EDEDED] focus:border-[#3ECF8E] outline-none"
              />
              <span className="text-xs font-mono text-[#8E9296]">% původní</span>
              <div className="flex gap-1 ml-auto">
                {[50, 75, 150, 200].map((pct) => (
                  <motion.button
                    key={pct}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGlobalScalePercent(pct)}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#17191A] text-[#8E9296] hover:text-[#3ECF8E] border border-[#232628] transition-colors"
                  >
                    {pct}%
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {resizeMode === 'custom_px' && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 pt-1"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[#8E9296] block mb-1">Cílová Šířka (px)</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Např. 1920"
                    value={globalTargetWidth}
                    onChange={(e) => setGlobalTargetWidth(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full px-2.5 py-1.5 bg-[#17191A] border border-[#2E3235] rounded-lg text-xs font-mono text-[#EDEDED] focus:border-[#3ECF8E] outline-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setGlobalLockAspectRatio(!globalLockAspectRatio)}
                  className={`mt-4 p-2 rounded-lg border transition-colors ${
                    globalLockAspectRatio
                      ? 'bg-[#17191A] border-[#3ECF8E]/50 text-[#3ECF8E]'
                      : 'bg-[#17191A] border-[#2E3235] text-[#8E9296]'
                  }`}
                  title={globalLockAspectRatio ? 'Zachovat poměr stran' : 'Volné rozměry'}
                >
                  {globalLockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </motion.button>

                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[#8E9296] block mb-1">Výška (auto)</span>
                  <div className="px-2.5 py-1.5 bg-[#17191A]/50 border border-[#232628] rounded-lg text-xs font-mono text-[#8E9296]">
                    {globalLockAspectRatio ? 'Poměr stran' : 'Dle vstupu'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {resizeMode === 'original' && (
            <p className="text-[11px] text-[#8E9296] italic">
              Bezztrátové zachování původního rozlišení v pixelech.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
