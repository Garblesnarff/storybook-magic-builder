
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
  const [isLoading, setIsLoading] = useState(true);

  // Refs for tracking state in event handlers
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);
  const isPanningRef = useRef(isPanning);
  const startPanRef = useRef({ x: 0, y: 0 });

  const { imageStyle, calculateImageStyle } = useImageFit({
    fitMethod: initialSettings?.fitMethod,
    scale: scale,
    position: position,
    containerWidth: containerDimensions.width,
    containerHeight: containerDimensions.height,
    imageWidth: imageDimensions.width,
    imageHeight: imageDimensions.height
  });

  // Alias for expected properties that don't exist in our useImageFit implementation
  const fitMethod = initialSettings?.fitMethod || 'contain';
  const toggleFitMethod = () => {};
  const fitImageToContainer = () => {};

  // Reset states when src changes
  useEffect(() => {
    console.log('Image source changed:', src);
    setImageLoaded(false);
    setIsInteractionReady(false);
    setIsLoading(true);
  }, [src]);

  // Handle image loading
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    console.log('Image loaded successfully:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      src: img.src
    });

    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.error('Image loaded with invalid dimensions');
      return;
    }

    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    setIsLoading(false);

    // Update container dimensions
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setContainerDimensions({ width: clientWidth, height: clientHeight });
    }

    // Enable interactions after a short delay
    setTimeout(() => {
      setIsInteractionReady(true);
    }, 100);
  }, []);

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        console.log('Container resized:', { width: clientWidth, height: clientHeight });
        setContainerDimensions({ width: clientWidth, height: clientHeight });
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial measurement

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    e.preventDefault();
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!isInteractionReady) return;
    
    const newScale = Math.min(scaleRef.current * 1.2, 4);
    setScale(newScale);
    scaleRef.current = newScale;
  }, [isInteractionReady]);

  const handleZoomOut = useCallback(() => {
    if (!isInteractionReady) return;
    
    const newScale = Math.max(scaleRef.current / 1.2, 0.5);
    setScale(newScale);
    scaleRef.current = newScale;
  }, [isInteractionReady]);

  // Reset to default view
  const handleReset = useCallback(() => {
    if (!isInteractionReady) return;
    
    setScale(1);
    setPosition({ x: 0, y: 0 });
    scaleRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
  }, [isInteractionReady]);

  return {
    scale,
    position,
    fitMethod,
    isPanning,
    imageLoaded,
    isInteractionReady,
    isLoading,
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
