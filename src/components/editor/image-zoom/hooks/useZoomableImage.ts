
import { useEffect } from 'react';
import { ImageSettings } from '@/types/book';
import { useImageLoader } from './useImageLoader';
import { useContainerDimensions } from './useContainerDimensions';
import { useImageZoom } from './useImageZoom';
import { useImagePan } from './useImagePan';
import { useImageFit } from './useImageFit';
import { useSettingsSync } from './useSettingsSync';

export function useZoomableImage(
  src: string,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Custom hooks
  const {
    imageLoaded,
    isLoading,
    isInteractionReady,
    handleImageLoad
  } = useImageLoader(src);

  const {
    dimensions,
    updateDimensions
  } = useContainerDimensions(containerRef);

  const {
    scale,
    setScale,
    handleZoomIn,
    handleZoomOut
  } = useImageZoom(initialSettings);

  const {
    position,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useImagePan(initialSettings);

  const {
    fitMethod,
    toggleFitMethod,
    fitImageToContainer
  } = useImageFit({
    containerWidth: dimensions.width,
    containerHeight: dimensions.height,
    fitMethod: initialSettings?.fitMethod,
    scale: initialSettings?.scale,
    position: initialSettings?.position
  });

  const { saveSettings } = useSettingsSync(
    scale,
    position,
    fitMethod,
    imageLoaded,
    isInteractionReady,
    initialSettings,
    onSettingsChange
  );

  // Update dimensions when the ref changes or the component mounts/unmounts
  useEffect(() => {
    updateDimensions();
    
    // Add event listener for resize
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  // Use effect to trigger saveSettings when relevant states change
  useEffect(() => {
    if (isInteractionReady && imageLoaded && onSettingsChange) {
      saveSettings();
    }
  }, [scale, position, fitMethod, isInteractionReady, imageLoaded, saveSettings, onSettingsChange]);

  return {
    scale,
    position,
    fitMethod,
    isPanning,
    imageLoaded,
    isLoading,
    isInteractionReady,
    containerRef,
    imageRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    toggleFitMethod,
    handleReset: () => fitImageToContainer(imageLoaded, dimensions, { width: 0, height: 0 }, isInteractionReady, setScale),
    handleImageLoad,
    updateDimensions
  };
}
