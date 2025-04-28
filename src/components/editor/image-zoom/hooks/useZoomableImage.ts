
import { useEffect, useRef } from 'react';
import { ImageSettings } from '@/types/book';
import { useContainerDimensions } from './useContainerDimensions';
import { useImageLoader } from './useImageLoader';
import { useImageZoom } from './useImageZoom';
import { useImagePan } from './useImagePan';
import { useImageFit } from './useImageFit';
import { CSSProperties } from 'react';

export interface UseZoomableImageProps {
  containerRef: React.RefObject<HTMLDivElement>;
  imageUrl?: string;
  settings?: ImageSettings;
}

export function useZoomableImage({ containerRef, imageUrl, settings }: UseZoomableImageProps) {
  const containerDimensionsHook = useContainerDimensions(containerRef);
  const imageLoaderHook = useImageLoader(imageUrl);
  
  // Update container dimensions when the component mounts or resizes
  useEffect(() => {
    containerDimensionsHook.updateDimensions();
    const resizeObserver = new ResizeObserver(() => {
      containerDimensionsHook.updateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef, containerDimensionsHook]);

  // Calculate image style based on settings
  const imageStyle = useRef<CSSProperties>({}).current;
  
  // Update image style based on settings
  useEffect(() => {
    if (imageLoaderHook.isLoaded && containerDimensionsHook.dimensions.width > 0) {
      // Basic image style
      imageStyle.objectFit = "contain";
      imageStyle.maxWidth = "100%";
      imageStyle.maxHeight = "100%";
    }
  }, [imageLoaderHook.isLoaded, containerDimensionsHook.dimensions, imageStyle]);

  return {
    isLoading: imageLoaderHook.isLoading,
    isLoaded: imageLoaderHook.isLoaded,
    error: imageLoaderHook.error,
    imageStyle,
    imageUrl,
  };
}
