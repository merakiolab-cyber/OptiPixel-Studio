import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ConversionItem } from '../types';
import { formatBytes } from '../utils/converter';

interface ConfirmDeleteModalProps {
  target: ConversionItem | 'all' | null;
  totalCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  target,
  totalCount,
  onConfirm,
  onClose,
}) => {
  // Handle ESC key press
  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const isAll = target === 'all';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0C0D0E]/80 backdrop-blur-sm"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#121415] border border-[#232628] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
          role="alertdialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8E9296] hover:text-[#EDEDED] hover:bg-[#17191A] transition-colors"
            title="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon + Title */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 pr-6">
              <h3 className="text-base font-bold text-[#EDEDED] font-mono">
                {isAll ? 'Smazat všechny soubory?' : 'Smazat tento obrázek?'}
              </h3>
              <p className="text-xs text-[#8E9296] leading-relaxed">
                {isAll
                  ? `Opravdu chcete odstranit všech ${totalCount} zpracovaných souborů? Tuto akci nelze vrátit zpět.`
                  : 'Opravdu chcete tento obrázek odebrat ze seznamu zpracovaných souborů?'}
              </p>
            </div>
          </div>

          {/* Single Item Preview Card */}
          {!isAll && target && (
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#17191A] border border-[#232628]">
              {(target.convertedPreview || target.originalPreview) && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0C0D0E] border border-[#2E3235] shrink-0">
                  <img
                    src={target.convertedPreview || target.originalPreview}
                    alt={target.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-medium text-[#EDEDED] truncate" title={target.originalName}>
                  {target.originalName}
                </p>
                <p className="text-[11px] font-mono text-[#8E9296] mt-0.5">
                  {formatBytes(target.originalSize)}
                  {target.convertedSize ? ` → ${formatBytes(target.convertedSize)}` : ''}
                  {` • ${target.targetFormat.toUpperCase()}`}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-mono font-medium rounded-xl text-[#8E9296] hover:text-[#EDEDED] bg-[#17191A] hover:bg-[#1E2022] border border-[#232628] transition-colors"
            >
              Zrušit
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              type="button"
              className="px-4 py-2 text-xs font-mono font-bold rounded-xl text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/20"
              autoFocus
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAll ? 'Ano, vymazat vše' : 'Ano, smazat'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
