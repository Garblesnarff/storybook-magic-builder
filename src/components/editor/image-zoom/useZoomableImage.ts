
import { useRef } from 'react';
import { ImageSettings } from '@/types/book';
import { useZoomableImage as useZoomableImageHook } from './hooks/useZoomableImage';

export function useZoomableImage({ containerRef: externalContainerRef, imageUrl, settings, onSettingsChange }: {
  containerRef?: React.RefObject<HTMLDivElement>;
  imageUrl?: string;
  settings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}) {
  // If containerRef is not provided, create one
  const defaultContainerRef = useRef<HTMLDivElement>(null);
  
  // Simply re-export the hook with the same interface for backward compatibility
  return useZoomableImageHook(imageUrl, settings, onSettingsChange);
}
