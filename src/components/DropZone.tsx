import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles, Zap, Loader2, ArrowRight } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isConverting?: boolean;
  processingCount?: number;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  onFilesSelected,
  isConverting = false,
  processingCount = 0
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.002 }}
      whileTap={{ scale: 0.998 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center w-full h-full flex flex-col justify-center items-center ${
        isDragging
          ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 shadow-[0_0_30px_rgba(62,207,142,0.2)]'
          : 'border-[#232628] hover:border-[#3ECF8E]/60 bg-[#121415]/90 hover:bg-[#17191A]'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Playful Floating Glow Particles */}
      <motion.div 
        animate={{ 
          x: [0, 30, -20, 0], 
          y: [0, -20, 20, 0],
          scale: [1, 1.2, 0.9, 1] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -left-16 w-56 h-56 bg-[#3ECF8E]/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -30, 20, 0], 
          y: [0, 20, -20, 0],
          scale: [1, 0.8, 1.1, 1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#3ECF8E]/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-5">
        
        {/* Playful Animated Icon */}
        <motion.div 
          animate={isDragging ? { y: [-6, 6, -6], scale: 1.1 } : { y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#17191A] border border-[#2E3235] group-hover:border-[#3ECF8E]/50 flex items-center justify-center text-[#3ECF8E] shadow-2xl transition-colors">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#3ECF8E]" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1 bg-[#3ECF8E] text-[#0C0D0E] rounded-full p-1.5 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <div className="space-y-1.5">
          {isConverting ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] font-bold mb-1 shadow-md animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Automatická konverze právě probíhá ({processingCount} v procesu)...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17191A] border border-[#232628] text-[11px] font-mono text-[#8E9296] mb-1">
              <Zap className="w-3 h-3 text-[#3ECF8E]" />
              <span>Okamžitá automatická konverze po vložení</span>
            </div>
          )}

          <h3 className="text-lg sm:text-xl font-extrabold text-[#EDEDED] tracking-tight">
            Přetáhněte sem obrázky nebo <span className="text-[#3ECF8E] underline underline-offset-4 decoration-[#3ECF8E]/40">vyberte z PC</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#8E9296]">
            Podporuje <strong className="text-[#EDEDED]">PNG, JPG, JPEG i WebP</strong>. Hromadná konverze se spustí okamžitě přímo v prohlížeči.
          </p>
        </div>

        {/* Playful Format Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-[#17191A] text-[#EDEDED] border border-[#232628]"
          >
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
            PNG &#8594; WebP
          </motion.span>

          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-[#17191A] text-[#EDEDED] border border-[#232628]"
          >
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
            JPG &#8594; WebP
          </motion.span>

          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-[#17191A] text-[#EDEDED] border border-[#232628]"
          >
            <span className="w-2 h-2 rounded-full text-[#3ECF8E]">&#8644;</span>
            WebP &#8594; JPG / PNG
          </motion.span>

          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold"
          >
            <Sparkles className="w-3 h-3" />
            100% Max Kvalita / Bezztrátový Resize
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};
