
import { useRef, useEffect, useCallback } from 'react';
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
    toggleFitMethod,
    fitImageToContainer
  } = useImageFit(initialSettings, onSettingsChange);
  
  const { saveSettings } = useSettingsSync(
    scale, position, fitMethod, imageLoaded, isPanning, isInteractionReady, initialSettings, onSettingsChange
  );

  // Get container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => updateContainerSize(containerRef);
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [updateContainerSize]);

  // Apply initial settings when they change (e.g., when changing pages)
  useEffect(() => {
    if (!initialSettings) return;
    
    console.log('Applying initial settings from main useZoomableImage:', initialSettings);
    
    // Apply settings when they change from outside
    setScale(initialSettings.scale);
    setPosition(initialSettings.position);
    setFitMethod(initialSettings.fitMethod);
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

  // Enhance base handlers with additional functionality
  const handleZoomIn = useCallback(() => {
    baseHandleZoomIn();
    
    // Save settings after zoom
    setTimeout(() => saveSettings(), 50);
  }, [baseHandleZoomIn, saveSettings]);

  const handleZoomOut = useCallback(() => {
    baseHandleZoomOut();
    
    // Save settings after zoom
    setTimeout(() => saveSettings(), 50);
  }, [baseHandleZoomOut, saveSettings]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    baseHandleMouseDown(e, isInteractionReady, containerRef);
  }, [baseHandleMouseDown, isInteractionReady]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    baseHandleMouseMove(e, isInteractionReady);
  }, [baseHandleMouseMove, isInteractionReady]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    baseHandleMouseUp(e, isInteractionReady, containerRef, onSettingsChange, scaleRef, fitMethodRef);
  }, [baseHandleMouseUp, isInteractionReady, onSettingsChange, scaleRef, fitMethodRef]);

  // Reset function
  const handleReset = useCallback(() => {
    fitImageToContainer(
      imageLoaded,
      containerDimensions,
      imageDimensions,
      isInteractionReady,
      setScale,
      setPosition,
      scaleRef
    );
  }, [
    fitImageToContainer, 
    imageLoaded, 
    containerDimensions, 
    imageDimensions, 
    isInteractionReady,
    setScale,
    setPosition,
    scaleRef
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
    handleReset
  };
}
