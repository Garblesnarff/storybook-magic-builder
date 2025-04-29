
import { useRef } from 'react';
import { ImageSettings } from '@/types/book';
import { useZoomableImage as useZoomableImageHook } from './hooks/useZoomableImage';

export function useZoomableImage({ imageUrl, settings, onSettingsChange }: {
  imageUrl?: string;
  settings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}) {
  // Simply re-export the hook with the same interface for backward compatibility
  return useZoomableImageHook(imageUrl, settings, onSettingsChange);
}
