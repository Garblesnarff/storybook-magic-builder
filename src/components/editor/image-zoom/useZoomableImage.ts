
import { useState, useCallback, useRef, useEffect } from 'react';
import { useImageFit } from './hooks/useImageFit';
import { useSettingsSync } from './hooks/useSettingsSync';
import { ImageSettings } from '@/types/book';

export function useZoomableImage(
  src: string,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  // State for image and container
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isInteractionReady, setIsInteractionReady] = useState(false);

  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State for zoom and position
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Refs for tracking state in event handlers
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);
  const isPanningRef = useRef(isPanning);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Clear image loaded state when src changes
  useEffect(() => {
    console.log('Source changed, resetting image loaded state:', src);
    setImageLoaded(false);
    setIsInteractionReady(false);
  }, [src]);

  // Update refs when state changes
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  const { fitMethod, setFitMethod, toggleFitMethod, fitImageToContainer } = useImageFit(initialSettings);

  const { saveSettings } = useSettingsSync(
    scale,
    position,
    fitMethod,
    imageLoaded,
    isInteractionReady,
    initialSettings,
    onSettingsChange
  );

  // Handle image loading
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image loaded event triggered');
    const img = e.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;
    console.log('Natural dimensions:', naturalWidth, naturalHeight);
    
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
    
    // Update container dimensions after image load
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      console.log('Container dimensions after load:', clientWidth, clientHeight);
      setContainerDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  // Update container dimensions
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      console.log('Updating container dimensions:', clientWidth, clientHeight);
      setContainerDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  // Initialize container dimensions and add resize listener
  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    
    return () => {
      window.removeEventListener('resize', updateContainerDimensions);
    };
  }, [updateContainerDimensions]);

  // Fit image to container when dimensions are available
  useEffect(() => {
    if (imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0) {
      console.log('Fitting image to container', {
        imageLoaded,
        containerDimensions,
        imageDimensions
      });
      
      fitImageToContainer(
        imageLoaded,
        containerDimensions,
        imageDimensions,
        isInteractionReady,
        setScale,
        setPosition,
        scaleRef
      );
      
      // Set interaction ready after initial fit
      setTimeout(() => {
        setIsInteractionReady(true);
      }, 100);
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitImageToContainer]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    
    setIsPanning(true);
    isPanningRef.current = true;
    
    startPanRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
    
    e.preventDefault();
  }, [isInteractionReady]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current || !isInteractionReady) return;
    
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    setPosition({ x: newX, y: newY });
    positionRef.current = { x: newX, y: newY };
    
    e.preventDefault();
  }, [isInteractionReady]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    
    setIsPanning(false);
    isPanningRef.current = false;
    saveSettings();
    
    e.preventDefault();
  }, [saveSettings]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!isInteractionReady) return;
    
    const newScale = Math.min(scaleRef.current * 1.2, 4);
    setScale(newScale);
    scaleRef.current = newScale;
    saveSettings();
  }, [isInteractionReady, saveSettings]);

  const handleZoomOut = useCallback(() => {
    if (!isInteractionReady) return;
    
    const newScale = Math.max(scaleRef.current / 1.2, 0.5);
    setScale(newScale);
    scaleRef.current = newScale;
    saveSettings();
  }, [isInteractionReady, saveSettings]);

  // Reset to default view
  const handleReset = useCallback(() => {
    if (!isInteractionReady) return;
    
    setScale(1);
    setPosition({ x: 0, y: 0 });
    scaleRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
    saveSettings();
  }, [isInteractionReady, saveSettings]);

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
    handleImageLoad
  };
}
