import { ConversionItem } from '../types';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function determineTargetFormat(
  fileType: string,
  preferredTarget: 'webp' | 'jpeg' | 'png' | 'auto'
): 'webp' | 'jpeg' | 'png' {
  if (preferredTarget !== 'auto') {
    return preferredTarget;
  }
  // Auto logic: If input is WebP, convert to JPG by default (or user can switch to PNG)
  if (fileType === 'image/webp') {
    return 'jpeg';
  }
  // If input is JPG/PNG or others, convert to WebP
  return 'webp';
}

export function getExtension(format: 'webp' | 'jpeg' | 'png'): string {
  switch (format) {
    case 'webp':
      return '.webp';
    case 'jpeg':
      return '.jpg';
    case 'png':
      return '.png';
  }
}

export function getMimeType(format: 'webp' | 'jpeg' | 'png'): string {
  switch (format) {
    case 'webp':
      return 'image/webp';
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
  }
}

/**
 * Reads original image dimensions without performing any conversion.
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          previewUrl: e.target?.result as string,
        });
      };
      img.onerror = () => reject(new Error('Chyba při zjišťování rozměrů obrázku'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Chyba při čtení souboru'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resamples an image onto canvas using Photoshop-equivalent multi-step stepping
 * for dramatic downscaling (prevents aliasing/shimmering) or high-quality bicubic
 * interpolation for standard resizing and upscaling.
 */
function renderHighQualityImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number
) {
  // If scaling down by more than 50% in either dimension, use stepped downsampling
  // to avoid aliasing artifacts and preserve maximum edge sharpness
  if (targetWidth < srcWidth * 0.5 || targetHeight < srcHeight * 0.5) {
    let curWidth = srcWidth;
    let curHeight = srcHeight;
    let curCanvas = document.createElement('canvas');
    curCanvas.width = curWidth;
    curCanvas.height = curHeight;
    let curCtx = curCanvas.getContext('2d');
    if (!curCtx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      return;
    }
    curCtx.imageSmoothingEnabled = true;
    curCtx.imageSmoothingQuality = 'high';
    curCtx.drawImage(img, 0, 0, curWidth, curHeight);

    while (curWidth * 0.5 > targetWidth || curHeight * 0.5 > targetHeight) {
      const nextWidth = Math.max(targetWidth, Math.round(curWidth * 0.5));
      const nextHeight = Math.max(targetHeight, Math.round(curHeight * 0.5));
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextWidth;
      nextCanvas.height = nextHeight;
      const nextCtx = nextCanvas.getContext('2d');
      if (!nextCtx) break;
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(curCanvas, 0, 0, nextWidth, nextHeight);
      curCanvas = nextCanvas;
      curWidth = nextWidth;
      curHeight = nextHeight;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(curCanvas, 0, 0, targetWidth, targetHeight);
  } else {
    // 1:1 original, moderate downscale, or upscale (bicubic high quality interpolation)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }
}

export async function convertSingleImage(
  file: File,
  targetFormat: 'webp' | 'jpeg' | 'png',
  qualityValue: number,
  customDimensions?: { targetWidth: number; targetHeight: number }
): Promise<{
  blob: Blob;
  previewUrl: string;
  size: number;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        const targetWidth = Math.max(1, Math.round(customDimensions?.targetWidth ?? origWidth));
        const targetHeight = Math.max(1, Math.round(customDimensions?.targetHeight ?? origHeight));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { alpha: targetFormat !== 'jpeg' });
        if (!ctx) {
          reject(new Error('Nepodařilo se vytvořit Canvas kontext'));
          return;
        }

        // If target is JPEG, fill canvas with solid white to prevent black background on transparent areas
        if (targetFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // High quality multi-step resampling (Photoshop-like quality)
        renderHighQualityImage(ctx, img, origWidth, origHeight, targetWidth, targetHeight);

        const mime = getMimeType(targetFormat);
        // For PNG, canvas.toBlob produces 100% lossless output
        const q = targetFormat === 'png' ? undefined : qualityValue;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve({
                blob,
                previewUrl,
                size: blob.size,
                originalWidth: origWidth,
                originalHeight: origHeight,
                targetWidth,
                targetHeight,
              });
            } else {
              reject(new Error('Převod obrázku selhal'));
            }
          },
          mime,
          q
        );
      };

      img.onerror = () => reject(new Error('Chyba při načítání obrázku'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Chyba při čtení souboru'));
    reader.readAsDataURL(file);
  });
}
