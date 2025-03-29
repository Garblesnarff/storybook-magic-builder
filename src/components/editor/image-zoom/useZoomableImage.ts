
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
    toggleFitMethod: baseToggleFitMethod, // Renamed base function
    fitImageToContainer,
    setFitMethod
  } = useImageFit(initialSettings); // Removed onSettingsChange from here
  
  // Get the saveSettings function, but it won't be called automatically anymore
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

  // Enhance base handlers to call saveSettings explicitly after interaction
  const handleZoomIn = useCallback(() => {
    baseHandleZoomIn();
    saveSettings(); // Save immediately after zoom
  }, [baseHandleZoomIn, saveSettings]);

  const handleZoomOut = useCallback(() => {
    baseHandleZoomOut();
    saveSettings(); // Save immediately after zoom
  }, [baseHandleZoomOut, saveSettings]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // No save needed on mouse down
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
    if (isPanningRef.current) { // Check if panning actually happened
       saveSettings(); 
    }
  }, [baseHandleMouseUp, isInteractionReady, containerRef, saveSettings, isPanningRef]);

  // Enhance toggleFitMethod to save settings
  const toggleFitMethod = useCallback(() => {
    baseToggleFitMethod();
    // Need a slight delay to allow state to update before saving
    setTimeout(saveSettings, 0); 
  }, [baseToggleFitMethod, saveSettings]);

  // Reset function - should also save the reset state
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
    // Need a slight delay to allow state to update before saving
    setTimeout(saveSettings, 0); 
  }, [
    fitImageToContainer, 
    imageLoaded, 
    containerDimensions, 
    imageDimensions, 
    isInteractionReady,
    setScale,
    setPosition,
    scaleRef,
    saveSettings // Added saveSettings dependency
  ]);

  // Save settings on unmount if they have changed from initial
  useEffect(() => {
    // Store refs to ensure cleanup uses the latest values
    const scaleRefCleanup = { current: scale };
    const positionRefCleanup = { current: position };
    const fitMethodRefCleanup = { current: fitMethod };
    const initialSettingsRefCleanup = { current: initialSettings };
    const saveSettingsRefCleanup = { current: saveSettings };

    return () => {
      if (!initialSettingsRefCleanup.current) return; // No initial settings to compare against

      const currentState: ImageSettings = {
        scale: scaleRefCleanup.current,
        position: positionRefCleanup.current,
        fitMethod: fitMethodRefCleanup.current
      };

      // Compare current state to initial state for this instance
      if (JSON.stringify(currentState) !== JSON.stringify(initialSettingsRefCleanup.current)) {
        console.log('Saving image settings on unmount:', currentState);
        saveSettingsRefCleanup.current();
      }
    };
    // Run only on mount/unmount
  }, []); // Empty dependency array

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
