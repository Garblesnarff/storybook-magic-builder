
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
  
  // Get the saveSettings function from useSettingsSync
  const { saveSettings } = useSettingsSync(
    scale, position, fitMethod, imageLoaded, isPanning, isInteractionReady, initialSettings, onSettingsChange
  );

  // Track if we're in a save-triggered operation to avoid circular updates
  const inSaveTriggeredOperationRef = useRef(false);

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
    
    // Avoid triggering saves when applying initial settings
    inSaveTriggeredOperationRef.current = true;
    
    // Apply settings when they change from outside
    setScale(initialSettings.scale || 1);
    setPosition(initialSettings.position || { x: 0, y: 0 });
    setFitMethod(initialSettings.fitMethod || 'contain');
    
    // Reset the flag after a delay to allow state updates to complete
    setTimeout(() => {
      inSaveTriggeredOperationRef.current = false;
    }, 100);
  }, [initialSettings, setPosition, setScale, setFitMethod]);

  // Apply auto-fit when relevant properties change
  useEffect(() => {
    if (!initialSettings && imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0 && imageDimensions.width > 0) {
      // Avoid triggering saves when auto-fitting
      inSaveTriggeredOperationRef.current = true;
      
      fitImageToContainer(
        imageLoaded,
        containerDimensions,
        imageDimensions,
        isInteractionReady,
        setScale,
        setPosition,
        scaleRef
      );
      
      // Reset the flag after a delay
      setTimeout(() => {
        inSaveTriggeredOperationRef.current = false;
      }, 100);
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

  // Enhance base handlers with save functionality
  const handleZoomIn = useCallback(() => {
    baseHandleZoomIn();
    // Delay save until after state update is processed
    setTimeout(saveSettings, 50);
  }, [baseHandleZoomIn, saveSettings]);

  const handleZoomOut = useCallback(() => {
    baseHandleZoomOut();
    // Delay save until after state update is processed
    setTimeout(saveSettings, 50);
  }, [baseHandleZoomOut, saveSettings]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    baseHandleMouseDown(e, isInteractionReady, containerRef);
  }, [baseHandleMouseDown, isInteractionReady, containerRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    baseHandleMouseMove(e, isInteractionReady);
    // Don't save during mouse move to prevent jitter
  }, [baseHandleMouseMove, isInteractionReady]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    baseHandleMouseUp(e, isInteractionReady, containerRef);
    // Only save after the interaction is complete and a short delay
    setTimeout(saveSettings, 100);
  }, [baseHandleMouseUp, isInteractionReady, containerRef, saveSettings]);

  const toggleFitMethod = useCallback(() => {
    baseToggleFitMethod();
    // Save after fit method changes with a delay
    setTimeout(saveSettings, 50);
  }, [baseToggleFitMethod, saveSettings]);

  const handleReset = useCallback(() => {
    // Avoid triggering saves during reset operation
    inSaveTriggeredOperationRef.current = true;
    
    fitImageToContainer(
      imageLoaded,
      containerDimensions,
      imageDimensions,
      isInteractionReady,
      setScale,
      setPosition,
      scaleRef
    );
    
    // Save after reset with a delay to allow state updates to complete
    setTimeout(() => {
      inSaveTriggeredOperationRef.current = false;
      saveSettings();
    }, 100);
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
    handleReset,
    saveSettings
  };
}
