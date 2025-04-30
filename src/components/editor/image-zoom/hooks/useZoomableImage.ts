
import { useRef } from 'react';
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
    containerDimensions,
    imageDimensions,
    updateContainerDimensions,
    updateImageDimensions
  } = useContainerDimensions();

  const {
    scale,
    setScale,
    scaleRef,
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
  } = useImageFit(initialSettings, onSettingsChange);

  const { saveSettings } = useSettingsSync(
    scale,
    position,
    fitMethod,
    imageLoaded,
    isInteractionReady,
    initialSettings,
    onSettingsChange
  );

  // Helper method to update container dimensions when needed
  const updateDimensions = () => {
    if (containerRef.current) {
      updateContainerDimensions(containerRef);
    }
    
    if (imageRef.current && imageLoaded) {
      updateImageDimensions(imageRef);
    }
  };

  // Reset image position and scale
  const handleReset = () => {
    if (!isInteractionReady) return;
    
    setScale(1);
    fitImageToContainer(
      imageLoaded,
      containerDimensions,
      imageDimensions,
      isInteractionReady,
      setScale,
      () => {},
      scaleRef
    );
  };

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
    handleReset,
    handleImageLoad,
    updateDimensions
  };
}
