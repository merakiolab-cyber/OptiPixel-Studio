/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ControlPanel } from './components/ControlPanel';
import { SummaryStats } from './components/SummaryStats';
import { ImageCard } from './components/ImageCard';
import { ComparisonModal } from './components/ComparisonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ConversionIndicator } from './components/ConversionIndicator';
import { ConversionItem, QualityPreset, TargetFormat, ResizeMode } from './types';
import { 
  formatBytes, 
  determineTargetFormat, 
  convertSingleImage, 
  getImageDimensions,
  getExtension 
} from './utils/converter';
import { Download, Trash2 } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<TargetFormat>('auto');
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('web');
  const [customQuality, setCustomQuality] = useState<number>(0.82);

  // Global Resize Settings
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original');
  const [globalScalePercent, setGlobalScalePercent] = useState<number>(100);
  const [globalTargetWidth, setGlobalTargetWidth] = useState<number | ''>(1920);
  const [globalLockAspectRatio, setGlobalLockAspectRatio] = useState<boolean>(true);

  // UI state
  const [inspectedItem, setInspectedItem] = useState<ConversionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversionItem | 'all' | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [currentConvertingName, setCurrentConvertingName] = useState<string>('');

  // Effective quality float
  const effectiveQuality = qualityPreset === 'max' ? 1.0 : qualityPreset === 'web' ? 0.82 : customQuality;

  /**
   * Calculates target width & height based on original dimensions and current resize mode settings.
   */
  const calculateInitialDimensions = useCallback((origWidth: number, origHeight: number) => {
    if (resizeMode === 'scale' && globalScalePercent !== 100) {
      const factor = globalScalePercent / 100;
      return {
        width: Math.max(1, Math.round(origWidth * factor)),
        height: Math.max(1, Math.round(origHeight * factor)),
      };
    }
    if (resizeMode === 'custom_px' && typeof globalTargetWidth === 'number' && globalTargetWidth > 0) {
      const targetW = Math.max(1, Math.round(globalTargetWidth));
      const targetH = globalLockAspectRatio 
        ? Math.max(1, Math.round((targetW / origWidth) * origHeight))
        : origHeight;
      return { width: targetW, height: targetH };
    }
    return { width: origWidth, height: origHeight };
  }, [resizeMode, globalScalePercent, globalTargetWidth, globalLockAspectRatio]);

  /**
   * Adds newly selected files into state and triggers immediate conversion.
   */
  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => 
      f.type.startsWith('image/') || /\.(webp|png|jpe?g)$/i.test(f.name)
    );

    if (validFiles.length === 0) return;

    const preparedItems: ConversionItem[] = [];

    for (const file of validFiles) {
      const targetFmt = determineTargetFormat(file.type, globalTargetFormat);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      
      let origW = 1000;
      let origH = 1000;
      let previewUrl = '';

      try {
        const info = await getImageDimensions(file);
        origW = info.width;
        origH = info.height;
        previewUrl = info.previewUrl;
      } catch {
        previewUrl = URL.createObjectURL(file);
      }

      const targetDims = calculateInitialDimensions(origW, origH);
      const isLossless = qualityPreset === 'max' || targetFmt === 'png';

      const newItem: ConversionItem = {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        originalFile: file,
        originalName: file.name,
        originalSize: file.size,
        originalType: file.type,
        originalPreview: previewUrl,
        targetFormat: targetFmt,
        quality: effectiveQuality,
        isLosslessOrMax: isLossless,
        convertedBlob: null,
        convertedPreview: null,
        convertedSize: null,
        originalWidth: origW,
        originalHeight: origH,
        targetWidth: targetDims.width,
        targetHeight: targetDims.height,
        lockAspectRatio: globalLockAspectRatio,
        status: 'processing',
        outputName: `${baseName}${getExtension(targetFmt)}`
      };

      preparedItems.push(newItem);
    }

    setItems(prev => [...prev, ...preparedItems]);
    setIsConverting(true);

    // Process conversion for each item
    for (const item of preparedItems) {
      setCurrentConvertingName(item.originalName);
      try {
        const result = await convertSingleImage(
          item.originalFile,
          item.targetFormat,
          item.quality,
          { targetWidth: item.targetWidth, targetHeight: item.targetHeight }
        );

        // Perceptible smooth transition so users clearly register the conversion happening
        await new Promise(res => setTimeout(res, 120));

        setItems(prev => prev.map(it => {
          if (it.id === item.id) {
            return {
              ...it,
              convertedBlob: result.blob,
              convertedPreview: result.previewUrl,
              convertedSize: result.size,
              originalWidth: result.originalWidth,
              originalHeight: result.originalHeight,
              targetWidth: result.targetWidth,
              targetHeight: result.targetHeight,
              status: 'completed'
            };
          }
          return it;
        }));
      } catch (err: any) {
        setItems(prev => prev.map(it => {
          if (it.id === item.id) {
            return {
              ...it,
              status: 'error',
              error: err.message || 'Konverze selhala'
            };
          }
          return it;
        }));
      }
    }

    setIsConverting(false);
    setCurrentConvertingName('');
  }, [globalTargetFormat, effectiveQuality, qualityPreset, calculateInitialDimensions, globalLockAspectRatio]);

  /**
   * Re-converts a single item with updated options.
   */
  const handleReconvertItem = useCallback(async (id: string, customOptions?: Partial<ConversionItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'processing' } : it));

    const currentItem = items.find(it => it.id === id);
    if (!currentItem) return;

    setIsConverting(true);
    setCurrentConvertingName(currentItem.originalName);

    const targetFormat = customOptions?.targetFormat ?? currentItem.targetFormat;
    const targetWidth = customOptions?.targetWidth ?? currentItem.targetWidth;
    const targetHeight = customOptions?.targetHeight ?? currentItem.targetHeight;
    const quality = customOptions?.quality ?? currentItem.quality;
    const baseName = currentItem.originalName.replace(/\.[^/.]+$/, "");

    try {
      const result = await convertSingleImage(
        currentItem.originalFile,
        targetFormat,
        quality,
        { targetWidth, targetHeight }
      );

      await new Promise(res => setTimeout(res, 100));

      setItems(prev => prev.map(it => {
        if (it.id === id) {
          return {
            ...it,
            targetFormat,
            targetWidth: result.targetWidth,
            targetHeight: result.targetHeight,
            quality,
            convertedBlob: result.blob,
            convertedPreview: result.previewUrl,
            convertedSize: result.size,
            outputName: `${baseName}${getExtension(targetFormat)}`,
            status: 'completed'
          };
        }
        return it;
      }));
    } catch (err: any) {
      setItems(prev => prev.map(it => {
        if (it.id === id) {
          return {
            ...it,
            status: 'error',
            error: err.message || 'Konverze selhala'
          };
        }
        return it;
      }));
    } finally {
      setIsConverting(false);
      setCurrentConvertingName('');
    }
  }, [items]);

  /**
   * Re-applies global settings to all uploaded items.
   */
  const handleApplyGlobalToAll = useCallback(() => {
    items.forEach(item => {
      const targetFmt = determineTargetFormat(item.originalType, globalTargetFormat);
      const targetDims = calculateInitialDimensions(item.originalWidth, item.originalHeight);
      
      handleReconvertItem(item.id, {
        targetFormat: targetFmt,
        quality: effectiveQuality,
        targetWidth: targetDims.width,
        targetHeight: targetDims.height,
      });
    });
  }, [items, globalTargetFormat, calculateInitialDimensions, effectiveQuality, handleReconvertItem]);

  /**
   * Prompts user for confirmation before deleting a single item.
   */
  const handleDeleteItemPrompt = useCallback((id: string) => {
    const item = items.find(it => it.id === id);
    if (item) {
      setDeleteTarget(item);
    }
  }, [items]);

  /**
   * Prompts user for confirmation before clearing all items.
   */
  const handleClearAllPrompt = useCallback(() => {
    if (items.length > 0) {
      setDeleteTarget('all');
    }
  }, [items.length]);

  /**
   * Confirms and performs the deletion.
   */
  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget === 'all') {
      setItems([]);
    } else if (deleteTarget) {
      setItems(prev => prev.filter(it => it.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  /**
   * Triggers browser file download for a single converted image.
   */
  const handleDownloadSingle = useCallback((item: ConversionItem) => {
    if (!item.convertedBlob) return;
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Downloads all completed images packaged into a single ZIP archive using JSZip.
   */
  const handleDownloadAllZip = useCallback(async () => {
    const completedItems = items.filter(it => it.status === 'completed' && it.convertedBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      completedItems.forEach(item => {
        if (item.convertedBlob) {
          zip.file(item.outputName, item.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optipixel_converted_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP Error:', err);
    } finally {
      setIsZipping(false);
    }
  }, [items]);

  // Derived aggregates
  const completedItems = items.filter(it => it.status === 'completed');
  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalConvertedSize = completedItems.reduce((acc, curr) => acc + (curr.convertedSize || 0), 0);

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#EDEDED] flex flex-col font-sans selection:bg-[#3ECF8E]/20 selection:text-[#3ECF8E]">
      {/* Top Navigation */}
      <Header
        itemCount={items.length}
        completedCount={completedItems.length}
      />

      {/* Main Content Viewport - Fluid Width Stretching to Window */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
        {/* 2-Column Split Layout: Left = ControlPanel, Right = DropZone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
          {/* Left Column: Global Controls */}
          <div className="lg:col-span-6 xl:col-span-6 flex">
            <ControlPanel
              globalTargetFormat={globalTargetFormat}
              setGlobalTargetFormat={setGlobalTargetFormat}
              qualityPreset={qualityPreset}
              setQualityPreset={setQualityPreset}
              customQuality={customQuality}
              setCustomQuality={setCustomQuality}
              resizeMode={resizeMode}
              setResizeMode={setResizeMode}
              globalScalePercent={globalScalePercent}
              setGlobalScalePercent={setGlobalScalePercent}
              globalTargetWidth={globalTargetWidth}
              setGlobalTargetWidth={setGlobalTargetWidth}
              globalLockAspectRatio={globalLockAspectRatio}
              setGlobalLockAspectRatio={setGlobalLockAspectRatio}
              onApplyToAll={handleApplyGlobalToAll}
              hasItems={items.length > 0}
            />
          </div>

          {/* Right Column: Upload DropZone */}
          <div className="lg:col-span-6 xl:col-span-6 flex">
            <DropZone 
              onFilesSelected={handleFilesSelected}
              isConverting={isConverting}
              processingCount={items.length - completedItems.length}
            />
          </div>
        </div>

        {/* Conversion Progress & Status HUD */}
        <ConversionIndicator
          isConverting={isConverting}
          completedCount={completedItems.length}
          totalCount={items.length}
          currentFileName={currentConvertingName}
          targetFormat={globalTargetFormat.toUpperCase()}
        />

        {/* Summary Dashboard Banner */}
        <SummaryStats
          totalCount={items.length}
          completedCount={completedItems.length}
          totalOriginalSize={totalOriginalSize}
          totalConvertedSize={totalConvertedSize}
        />

        {/* List of Image Cards */}
        {items.length > 0 && (
          <section className="space-y-4">
            {/* Header bar positioned directly above the first processed file card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#232628]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-sm font-bold text-[#EDEDED] font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>Zpracované soubory</span>
                  </h3>
                  <span className="text-xs text-[#3ECF8E] font-mono px-2.5 py-0.5 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 font-semibold">
                    {completedItems.length} z {items.length} hotovo
                  </span>
                  <span className="text-[11px] font-mono text-[#8E9296] hidden md:inline">
                    • Výsledné hotové formáty připravené ke stažení
                  </span>
                </div>
                <p className="text-xs text-[#8E9296]">
                  Soubory níže jsou již finální zkonvertované obrázky (nikoliv pouze nahrané originály ke zpracování).
                </p>
              </div>

              {/* Top-right action controls above the first card */}
              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClearAllPrompt}
                  className="px-3.5 py-2 text-xs font-mono font-medium text-[#8E9296] hover:text-red-400 bg-[#121415] hover:bg-red-500/10 border border-[#232628] hover:border-red-500/30 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Smazat všechny zpracované položky"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Vymazat vše</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadAllZip}
                  disabled={completedItems.length === 0 || isZipping}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${
                    completedItems.length > 0 && !isZipping
                      ? 'bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0C0D0E] shadow-[#3ECF8E]/25'
                      : 'bg-[#17191A] text-[#5C6064] border border-[#232628] cursor-not-allowed'
                  }`}
                  title="Stáhnout všechny hotové obrázky v jednom ZIP souboru"
                >
                  <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
                  <span>
                    {isZipping ? 'Balím ZIP...' : `Stáhnout ZIP (${completedItems.length})`}
                  </span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              <div className="space-y-3.5">
                {items.map(item => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    onDownload={handleDownloadSingle}
                    onDelete={handleDeleteItemPrompt}
                    onReconvert={handleReconvertItem}
                    onInspect={setInspectedItem}
                  />
                ))}
              </div>
            </AnimatePresence>
          </section>
        )}
      </main>

      {/* Side by side comparison inspector modal */}
      <ComparisonModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        onDownload={handleDownloadSingle}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        target={deleteTarget}
        totalCount={items.length}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />

      {/* Footer */}
      <footer className="border-t border-[#232628] bg-[#0C0D0E] py-6 text-center text-xs text-[#8E9296] font-mono mt-auto">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-center gap-4 text-[11px]">
          <span className="text-[#3ECF8E]">● Local Canvas Engine</span>
          <span>WebP / JPG / PNG Resizer</span>
        </div>
      </footer>
    </div>
  );
}
