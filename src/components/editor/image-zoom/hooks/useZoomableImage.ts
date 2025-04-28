
import { useState, useCallback, useRef, useEffect } from 'react';
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
    updateDimensions,
    containerDimensions,
    imageDimensions,
    updateContainerDimensions,
    updateImageDimensions
  } = useContainerDimensions(containerRef);

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

  // Helper method to update container dimensions when needed
  const updateAllDimensions = () => {
    updateDimensions();
  };

  // Reset image position and scale
  const handleReset = () => {
    if (!isInteractionReady) return;
    
    setScale(1);
    fitImageToContainer(
      imageLoaded,
      containerDimensions || { width: 0, height: 0 },
      imageDimensions || { width: 0, height: 0 },
      isInteractionReady,
      setScale
    );
  };

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
    handleReset,
    handleImageLoad,
    updateDimensions: updateAllDimensions
  };
}
