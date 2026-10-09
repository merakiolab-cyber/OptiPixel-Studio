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
import { ConversionItem, QualityPreset, TargetFormat, ResizeMode } from './types';
import { 
  formatBytes, 
  determineTargetFormat, 
  convertSingleImage, 
  getImageDimensions,
  getExtension 
} from './utils/converter';
import { Zap, Sparkles, Download, Wand2, ShieldCheck } from 'lucide-react';

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
  const [isZipping, setIsZipping] = useState(false);

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

    // Process conversion for each item
    for (const item of preparedItems) {
      try {
        const result = await convertSingleImage(
          item.originalFile,
          item.targetFormat,
          item.quality,
          { targetWidth: item.targetWidth, targetHeight: item.targetHeight }
        );

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
  }, [globalTargetFormat, effectiveQuality, qualityPreset, calculateInitialDimensions, globalLockAspectRatio]);

  /**
   * Re-converts a single item with updated options.
   */
  const handleReconvertItem = useCallback(async (id: string, customOptions?: Partial<ConversionItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'processing' } : it));

    const currentItem = items.find(it => it.id === id);
    if (!currentItem) return;

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
   * Deletes an item from state.
   */
  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  /**
   * Clears all items.
   */
  const handleClearAll = useCallback(() => {
    setItems([]);
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
        onClearAll={handleClearAll}
        onDownloadAllZip={handleDownloadAllZip}
        isZipping={isZipping}
      />

      {/* Main Content Viewport - Fluid Width Stretching to Window */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
        
        {/* Hero & Intro Section with Playful Motion */}
        <motion.section 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191A] border border-[#232628] text-xs font-mono text-[#3ECF8E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OptiPixel Studio Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#EDEDED]">
            Rychlý převodník & bezztrátový pixel resizer obrázků
          </h1>
        </motion.section>

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
            <DropZone onFilesSelected={handleFilesSelected} />
          </div>
        </div>

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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#EDEDED] font-mono uppercase tracking-wider flex items-center gap-2">
                <span>Zpracované soubory</span>
                <span className="text-xs text-[#3ECF8E] font-normal font-sans">
                  ({completedItems.length} z {items.length} hotovo)
                </span>
              </h3>

              {completedItems.length > 1 && (
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="text-xs font-mono font-semibold text-[#3ECF8E] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Stáhnout vše jako ZIP</span>
                </button>
              )}
            </div>

            <AnimatePresence>
              <div className="space-y-3.5">
                {items.map(item => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    onDownload={handleDownloadSingle}
                    onDelete={handleDeleteItem}
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

      {/* Footer */}
      <footer className="border-t border-[#232628] bg-[#0C0D0E] py-6 text-center text-xs text-[#8E9296] font-mono mt-auto">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 OptiPixel Studio. Všechna data zůstávají v bezpečí vašeho prohlížeče.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#3ECF8E]">● Local Canvas Engine</span>
            <span>WebP / JPG / PNG Resizer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
