
import { useRef, useEffect, useCallback, useState } from 'react';
import { ImageSettings } from '@/types/book';
import { 
  useImageDimensions,
  useImageFit,
  useImageZoom,
  useImagePan,
  useSettingsSync
} from './hooks';

export function useZoomableImage(
  src: string, 
  initialSettings?: ImageSettings, 
  onSettingsChange?: (settings: ImageSettings) => void
) {
  console.log('useZoomableImage: initializing with settings:', initialSettings);
  
  // Refs for DOM elements
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hooks
  const { 
    imageDimensions,
    containerDimensions,
    imageLoaded, 
    isInteractionReady,
    updateContainerSize
  } = useImageDimensions(src);

  const {
    scale,
    setScale,
    scaleRef,
    handleZoomIn: baseHandleZoomIn,
    handleZoomOut: baseHandleZoomOut
  } = useImageZoom(initialSettings);

  const {
    position,
    setPosition,
    isPanning,
    isPanningRef,
    positionRef,
    handleMouseDown: baseHandleMouseDown,
    handleMouseMove: baseHandleMouseMove,
    handleMouseUp: baseHandleMouseUp
  } = useImagePan(initialSettings);

  const {
    fitMethod,
    fitMethodRef,
    toggleFitMethod: baseToggleFitMethod,
    fitImageToContainer,
    setFitMethod
  } = useImageFit(initialSettings);
  
  // Track if user has interacted with the image
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Get the saveSettings function from useSettingsSync
  const { saveSettings } = useSettingsSync(
    scale, position, fitMethod, imageLoaded, isPanning, isInteractionReady, initialSettings, onSettingsChange
  );

  // Get container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => updateContainerSize(containerRef);
    
    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [updateContainerSize]);

  // Apply initial settings when they change (e.g., when changing pages)
  useEffect(() => {
    if (!initialSettings) return;
    
    console.log('Applying initial settings from main useZoomableImage:', initialSettings);
    
    // Apply settings when they change from outside
    setScale(initialSettings.scale || 1);
    setPosition(initialSettings.position || { x: 0, y: 0 });
    setFitMethod(initialSettings.fitMethod || 'contain');
  }, [initialSettings, setPosition, setScale, setFitMethod]);

  // Apply auto-fit when relevant properties change
  useEffect(() => {
    if (!initialSettings && imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0 && imageDimensions.width > 0) {
      fitImageToContainer(
        imageLoaded,
        containerDimensions,
        imageDimensions,
        isInteractionReady,
        setScale,
        setPosition,
        scaleRef
      );
    }
  }, [
    imageLoaded, 
    containerDimensions, 
    imageDimensions, 
    fitMethod, 
    initialSettings, 
    fitImageToContainer,
    isInteractionReady,
    setScale,
    setPosition,
    scaleRef
  ]);

  // Enhance base handlers to call saveSettings explicitly after interaction
  const handleZoomIn = useCallback(() => {
    setHasInteracted(true);
    baseHandleZoomIn();
    // Save settings after zoom operation
    setTimeout(() => saveSettings(), 50);
  }, [baseHandleZoomIn, saveSettings]);

  const handleZoomOut = useCallback(() => {
    setHasInteracted(true);
    baseHandleZoomOut();
    // Save settings after zoom operation
    setTimeout(() => saveSettings(), 50);
  }, [baseHandleZoomOut, saveSettings]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // No save needed on mouse down
    setHasInteracted(true);
    baseHandleMouseDown(e, isInteractionReady, containerRef);
  }, [baseHandleMouseDown, isInteractionReady]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // No save needed while moving
    baseHandleMouseMove(e, isInteractionReady);
  }, [baseHandleMouseMove, isInteractionReady]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Call base mouse up logic first
    baseHandleMouseUp(e, isInteractionReady, containerRef);
    
    // Then explicitly save settings if panning occurred
    if (isPanningRef.current) {
      setTimeout(() => saveSettings(), 50);
    }
  }, [baseHandleMouseUp, isInteractionReady, containerRef, saveSettings, isPanningRef]);

  // Enhance toggleFitMethod to save settings
  const toggleFitMethod = useCallback(() => {
    setHasInteracted(true);
    baseToggleFitMethod();
    // Save settings after toggling fit method
    setTimeout(() => saveSettings(), 50);
  }, [baseToggleFitMethod, saveSettings]);

  // Reset function - should also save the reset state
  const handleReset = useCallback(() => {
    setHasInteracted(true);
    fitImageToContainer(
      imageLoaded,
      containerDimensions,
      imageDimensions,
      isInteractionReady,
      setScale,
      setPosition,
      scaleRef
    );
    // Save settings after reset
    setTimeout(() => saveSettings(), 50);
  }, [
    fitImageToContainer, 
    imageLoaded, 
    containerDimensions, 
    imageDimensions, 
    isInteractionReady,
    setScale,
    setPosition,
    scaleRef,
    saveSettings
  ]);

  // Save settings on unmount if user has interacted
  useEffect(() => {
    return () => {
      if (hasInteracted) {
        saveSettings();
      }
    };
  }, [saveSettings, hasInteracted]);

  return {
    scale,
    position,
    fitMethod,
    isPanning,
    imageLoaded,
    isInteractionReady,
    containerRef,
    imageRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    toggleFitMethod,
    handleReset
  };
}
