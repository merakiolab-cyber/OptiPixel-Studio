import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

// Configuration for 4x4 matrix of independently blinking digital pixels
const LOGO_PIXELS = [
  { delay: 0.05, duration: 1.2, color: '#3ECF8E' },
  { delay: 0.65, duration: 1.7, color: '#6EE7B7' },
  { delay: 0.25, duration: 1.4, color: '#3ECF8E' },
  { delay: 0.85, duration: 2.0, color: '#3ECF8E' },

  { delay: 0.45, duration: 1.5, color: '#6EE7B7' },
  { delay: 0.10, duration: 0.9, color: '#A7F3D0' },
  { delay: 0.75, duration: 1.6, color: '#3ECF8E' },
  { delay: 0.30, duration: 1.3, color: '#6EE7B7' },

  { delay: 0.90, duration: 1.8, color: '#3ECF8E' },
  { delay: 0.20, duration: 1.1, color: '#A7F3D0' },
  { delay: 0.50, duration: 1.5, color: '#3ECF8E' },
  { delay: 0.70, duration: 1.9, color: '#6EE7B7' },

  { delay: 0.35, duration: 1.3, color: '#6EE7B7' },
  { delay: 0.80, duration: 2.1, color: '#3ECF8E' },
  { delay: 0.15, duration: 1.0, color: '#3ECF8E' },
  { delay: 0.60, duration: 1.4, color: '#A7F3D0' },
];

interface HeaderProps {
  itemCount: number;
  completedCount: number;
  onClearAll?: () => void;
  onDownloadAllZip?: () => void;
  isZipping?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  itemCount,
  completedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232628] bg-[#0C0D0E]/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3.5 shrink-0">
          <motion.div 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-xl bg-[#17191A] border border-[#2E3235] flex items-center justify-center text-[#3ECF8E] shadow-lg group hover:border-[#3ECF8E]/60 transition-colors cursor-pointer"
            title="OptiPixel Studio"
          >
            {/* Playful Ambient Logo Glow */}
            <div className="absolute inset-0 bg-[#3ECF8E]/20 rounded-xl blur-md group-hover:bg-[#3ECF8E]/40 transition-all" />
            
            {/* Problikávající pixely (Animovaný znak z loga) */}
            <div className="relative z-10 grid grid-cols-4 gap-[2px] p-1">
              {LOGO_PIXELS.map((pixel, idx) => (
                <motion.span
                  key={idx}
                  className="w-[4.5px] h-[4.5px] rounded-[1px] block"
                  style={{ backgroundColor: pixel.color }}
                  animate={{
                    opacity: [0.12, 1, 0.25, 0.95, 0.12],
                    scale: [0.85, 1.15, 0.9, 1.1, 0.85],
                    boxShadow: [
                      '0 0 0px transparent',
                      `0 0 5px ${pixel.color}`,
                      '0 0 1px transparent',
                      `0 0 4px ${pixel.color}`,
                      '0 0 0px transparent',
                    ],
                  }}
                  transition={{
                    duration: pixel.duration,
                    delay: pixel.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
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

        {/* Header Right Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {itemCount > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#8E9296] bg-[#121415] border border-[#232628] px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-[#3ECF8E] font-bold">{completedCount}</span>
              <span>/</span>
              <span>{itemCount} hotovo</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#8E9296] bg-[#121415] border border-[#232628] px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>100% Client-Side Private</span>
          </div>
        </div>
      </div>
    </header>
  );
};
