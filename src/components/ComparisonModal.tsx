import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Download } from 'lucide-react';
import { ConversionItem } from '../types';
import { formatBytes } from '../utils/converter';

interface ComparisonModalProps {
  item: ConversionItem | null;
  onClose: () => void;
  onDownload: (item: ConversionItem) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  item,
  onClose,
  onDownload,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide'>('split');

  if (!item) return null;

  const savedBytes = item.convertedSize ? item.originalSize - item.convertedSize : 0;
  const savingsPercent = item.convertedSize
    ? Math.round((savedBytes / item.originalSize) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0C0D0E]/85 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-[#121415] border border-[#232628] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#232628] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED] font-mono flex items-center gap-2">
                <span>{item.originalName}</span>
                <span className="text-xs text-[#3ECF8E] font-normal">
                  ({item.originalWidth}x{item.originalHeight}px &#8594; {item.targetWidth}x{item.targetHeight}px)
                </span>
              </h3>
              <p className="text-xs text-[#8E9296]">
                Porovnání kvality a detailů pixelů v měřítku 1:1
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle with Motion layoutId */}
              <div className="flex bg-[#17191A] p-1 rounded-xl border border-[#232628] relative">
                {[
                  { id: 'split', label: 'Split Posuvník' },
                  { id: 'sideBySide', label: 'Vedle sebe' },
                ].map((mode) => {
                  const isActive = viewMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as 'split' | 'sideBySide')}
                      className={`relative px-3 py-1 text-xs font-mono rounded-lg transition-colors z-10 ${
                        isActive ? 'text-[#3ECF8E] font-bold' : 'text-[#8E9296] hover:text-[#EDEDED]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeViewModeBg"
                          className="absolute inset-0 bg-[#232628] border border-[#3ECF8E]/40 rounded-lg shadow-sm -z-10"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 text-[#8E9296] hover:text-[#EDEDED] rounded-xl hover:bg-[#17191A] transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Viewport Canvas */}
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-[#0C0D0E]">
            {viewMode === 'split' ? (
              <div className="relative max-w-full max-h-[60vh] select-none rounded-xl overflow-hidden border border-[#232628]">
                {/* Converted Image (Base Layer) */}
                <img
                  src={item.convertedPreview || item.originalPreview}
                  alt="Converted"
                  className="max-h-[60vh] w-auto object-contain block"
                />

                {/* Original Image (Clipped Overlay Layer) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={item.originalPreview}
                    alt="Original"
                    className="max-h-[60vh] w-auto max-w-none object-contain block"
                  />
                </div>

                {/* Slider Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#3ECF8E] shadow-[0_0_12px_#3ECF8E] cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#121415] border-2 border-[#3ECF8E] flex items-center justify-center text-[#3ECF8E] shadow-xl">
                    <span className="text-[10px] font-bold font-mono">&#8644;</span>
                  </div>
                </div>

                {/* Slider Input overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />

                {/* Labels Overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#121415]/90 border border-[#232628] rounded-lg text-[11px] font-mono text-[#EDEDED] shadow-md">
                  Původní: {formatBytes(item.originalSize)}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#121415]/90 border border-[#3ECF8E]/50 rounded-lg text-[11px] font-mono text-[#3ECF8E] shadow-md">
                  Konvertovaný: {formatBytes(item.convertedSize || 0)} ({item.targetFormat.toUpperCase()})
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-h-[60vh]">
                <div className="bg-[#121415] border border-[#232628] rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs font-mono text-[#8E9296]">Originál ({formatBytes(item.originalSize)})</span>
                  <img
                    src={item.originalPreview}
                    alt="Original"
                    className="max-h-[45vh] object-contain rounded"
                  />
                </div>
                <div className="bg-[#121415] border border-[#3ECF8E]/30 rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs font-mono text-[#3ECF8E]">
                    Převedeno .{item.targetFormat} ({formatBytes(item.convertedSize || 0)})
                  </span>
                  <img
                    src={item.convertedPreview || item.originalPreview}
                    alt="Converted"
                    className="max-h-[45vh] object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#232628] flex items-center justify-between bg-[#121415]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#8E9296]">Úspora:</span>
              <span className="text-sm font-bold font-mono text-[#3ECF8E] bg-[#3ECF8E]/10 px-3 py-1 rounded-lg border border-[#3ECF8E]/30">
                -{savingsPercent}% ({formatBytes(savedBytes)})
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onDownload(item)}
              className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0C0D0E] font-bold text-xs flex items-center gap-2 transition-colors shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Stáhnout</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
