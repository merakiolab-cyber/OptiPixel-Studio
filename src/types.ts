export type TargetFormat = 'webp' | 'jpeg' | 'png' | 'auto';

export type QualityPreset = 'web' | 'max' | 'custom';

export type ResizeMode = 'original' | 'scale' | 'custom_px';

export interface ConversionItem {
  id: string;
  originalFile: File;
  originalName: string;
  originalSize: number;
  originalType: string;
  originalPreview: string;
  targetFormat: 'webp' | 'jpeg' | 'png';
  quality: number;
  isLosslessOrMax: boolean;
  convertedBlob: Blob | null;
  convertedPreview: string | null;
  convertedSize: number | null;
  
  // Dimensions
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  lockAspectRatio: boolean;

  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  outputName: string;
}
