// src/components/editor/image-zoom/useZoomableImage.ts
import { useRef, useEffect, useCallback, useState } from 'react';
import { ImageSettings } from '@/types/book'; // Corrected import path
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
  // Ref to prevent triggering saves during reset/fit operations
  const inSaveTriggeredOperationRef = useRef(false);
  // *** ADD THIS REF ***
  // Flag to indicate that an internal interaction just triggered a settings change request
  const internalUpdateTriggeredRef = useRef(false);
  // *******************


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

  const { saveSettings } = useSettingsSync(
    scale, position, fitMethod, imageLoaded, isInteractionReady, initialSettings, onSettingsChange
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


  // --- Modify useEffect watching initialSettings ---
  useEffect(() => {
    // If the flag is set, it means the potential prop change is due to our own recent action.
    // Ignore the prop for this cycle and reset the flag.
    if (internalUpdateTriggeredRef.current) {
      console.log("useEffect[initialSettings]: Skipping update check because internal update was just triggered.");
      internalUpdateTriggeredRef.current = false; // Reset the flag
      return;
    }

    // --- Keep the previous checks ---
    if (!initialSettings || inSaveTriggeredOperationRef.current || isPanningRef.current) {
       if (isPanningRef.current) console.log("useEffect[initialSettings]: Skipping update because panning is active.");
       // Add check for inSaveTriggeredOperationRef (used during reset/init)
       if (inSaveTriggeredOperationRef.current) console.log("useEffect[initialSettings]: Skipping update because save-triggered operation is in progress.");
       return;
    }
    // --- End previous checks ---


    console.log("useEffect[initialSettings]: Checking if external settings differ (update not internally triggered).");
    console.log("  Incoming Settings:", initialSettings);
    console.log("  Internal State:", { scale: scaleRef.current, position: positionRef.current, fitMethod: fitMethodRef.current });

    const tolerance = 0.01;
    let stateChanged = false;

    // Compare scale
    if (initialSettings.scale !== undefined && Math.abs(initialSettings.scale - scaleRef.current) > tolerance) {
      console.log(`  Scale differs (${initialSettings.scale} vs ${scaleRef.current}), updating internal state.`);
      setScale(initialSettings.scale);
      stateChanged = true;
    }

    // Compare position
    if (initialSettings.position &&
        (Math.abs(initialSettings.position.x - positionRef.current.x) > tolerance ||
         Math.abs(initialSettings.position.y - positionRef.current.y) > tolerance)) {
        console.log(`  Position differs (${JSON.stringify(initialSettings.position)} vs ${JSON.stringify(positionRef.current)}), updating internal state.`);
        setPosition(initialSettings.position);
        stateChanged = true;
    }

    // Compare fitMethod
    if (initialSettings.fitMethod && initialSettings.fitMethod !== fitMethodRef.current) {
      console.log(`  FitMethod differs (${initialSettings.fitMethod} vs ${fitMethodRef.current}), updating internal state.`);
      setFitMethod(initialSettings.fitMethod);
      stateChanged = true;
    }

    if (!stateChanged) {
       console.log("useEffect[initialSettings]: No significant difference found, internal state not changed.");
    }

  // *** SIMPLIFY DEPENDENCIES ***
  }, [initialSettings, setScale, setPosition, setFitMethod, isPanningRef]);
  // *****************************
  // --- End of Modified useEffect ---


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


  // --- Modify Interaction Handlers to set the flag ---

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // No change needed here, saving happens on mouseUp
    if (!isInteractionReady || inSaveTriggeredOperationRef.current) return;
    baseHandleMouseDown(e, isInteractionReady, containerRef);
    console.log("ZoomableImage: Mouse Down");
  }, [baseHandleMouseDown, isInteractionReady, containerRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // No change needed here, saving happens on mouseUp
    if (!isInteractionReady || inSaveTriggeredOperationRef.current || !isPanningRef.current) return;
    baseHandleMouseMove(e, isInteractionReady);
  }, [baseHandleMouseMove, isInteractionReady, isPanningRef]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    const wasPanning = isPanningRef.current;
    baseHandleMouseUp(e, isInteractionReady, containerRef);

    if (wasPanning) {
        console.log("ZoomableImage: Mouse Up after panning - setting internal flag and calling saveSettings");
        internalUpdateTriggeredRef.current = true; // *** SET FLAG ***
        saveSettings();
    } else {
        console.log("ZoomableImage: Mouse Up without panning - no save needed here");
    }
  }, [baseHandleMouseUp, isInteractionReady, containerRef, saveSettings, isPanningRef]);

  const handleZoomIn = useCallback(() => {
    if (inSaveTriggeredOperationRef.current) return;
    console.log("ZoomableImage: Zoom In - setting internal flag and calling saveSettings");
    internalUpdateTriggeredRef.current = true; // *** SET FLAG ***
    baseHandleZoomIn();
    saveSettings();
  }, [baseHandleZoomIn, saveSettings]);

  const handleZoomOut = useCallback(() => {
    if (inSaveTriggeredOperationRef.current) return;
    console.log("ZoomableImage: Zoom Out - setting internal flag and calling saveSettings");
    internalUpdateTriggeredRef.current = true; // *** SET FLAG ***
    baseHandleZoomOut();
    saveSettings();
  }, [baseHandleZoomOut, saveSettings]);

  const toggleFitMethod = useCallback(() => {
    if (inSaveTriggeredOperationRef.current) return;
    console.log("ZoomableImage: Toggle Fit - setting internal flag and calling saveSettings");
    internalUpdateTriggeredRef.current = true; // *** SET FLAG ***
    baseToggleFitMethod();
    saveSettings();
  }, [baseToggleFitMethod, saveSettings]);

  const handleReset = useCallback(() => {
    if (!isInteractionReady) return;
    console.log("ZoomableImage: Reset - fitting image, setting internal flag, and scheduling save");

    inSaveTriggeredOperationRef.current = true; // Flag for external reset source
    internalUpdateTriggeredRef.current = true; // *** SET FLAG *** (as reset also triggers save)

    fitImageToContainer(
       imageLoaded,
       containerDimensions,
       imageDimensions,
       isInteractionReady,
       setScale,
       setPosition,
       scaleRef
     );

    requestAnimationFrame(() => {
      inSaveTriggeredOperationRef.current = false;
      console.log("ZoomableImage: Reset - calling saveSettings after RAF");
      saveSettings();
    });
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
