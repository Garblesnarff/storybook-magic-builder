
import { ImageSettings } from '@/types/book';
import { useZoomableImage as useZoomableImageHook } from './hooks/useZoomableImage';

export function useZoomableImage({ containerRef, imageUrl, settings }: {
  containerRef: React.RefObject<HTMLDivElement>;
  imageUrl?: string;
  settings?: ImageSettings;
}) {
  // Simply re-export the hook with the same interface for backward compatibility
  return useZoomableImageHook(imageUrl, settings);
}
