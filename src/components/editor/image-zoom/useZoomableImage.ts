
import { useRef } from 'react';
import { ImageSettings } from '@/types/book';
import { useZoomableImage as useZoomableImageHook } from './hooks/useZoomableImage';

export function useZoomableImage({ containerRef, imageUrl, settings, onSettingsChange }: {
  containerRef?: React.RefObject<HTMLDivElement>;
  imageUrl?: string;
  settings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}) {
  // If containerRef is not provided, create one
  const defaultContainerRef = useRef<HTMLDivElement>(null);
  const actualRef = containerRef || defaultContainerRef;
  
  // Simply re-export the hook with the same interface for backward compatibility
  return useZoomableImageHook(imageUrl, settings, onSettingsChange);
}
