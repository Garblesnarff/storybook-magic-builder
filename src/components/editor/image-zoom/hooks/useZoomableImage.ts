
import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageSettings } from '@/types/book';
import { useContainerDimensions } from './useContainerDimensions';
import { useImageLoader } from './useImageLoader';

export function useZoomableImage(imageUrl: string | undefined, initialSettings?: ImageSettings, onSettingsChange?: (settings: ImageSettings) => void) {
  // Create refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Use our hooks
  const { dimensions, updateDimensions } = useContainerDimensions(containerRef);
  const { imageLoaded, isLoading, isInteractionReady, handleImageLoad, error } = useImageLoader(imageUrl || '');
  
  // State for image interactions
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [fitMethod, setFitMethod] = useState<'contain' | 'cover'>(initialSettings?.fitMethod as 'contain' | 'cover' || 'contain');
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs for tracking state
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);
  const startPanRef = useRef({ x: 0, y: 0 });
  
  // Update refs when state changes
  useEffect(() => {
    scaleRef.current = scale;
    positionRef.current = position;
  }, [scale, position]);
  
  // Reset position and scale when image changes
  useEffect(() => {
    if (imageLoaded) {
      updateDimensions();
    }
  }, [imageLoaded, updateDimensions]);
  
  // Initialize with settings when provided
  useEffect(() => {
    if (initialSettings && imageLoaded) {
      setScale(initialSettings.scale);
      setPosition(initialSettings.position);
      setFitMethod(initialSettings.fitMethod as 'contain' | 'cover');
    }
  }, [initialSettings, imageLoaded]);

  // Toggle fit method (contain/cover)
  const toggleFitMethod = useCallback(() => {
    setFitMethod(prev => prev === 'contain' ? 'cover' : 'contain');
  }, []);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 4));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse event handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    
    setIsPanning(true);
    startPanRef.current = { 
      x: e.clientX - positionRef.current.x, 
      y: e.clientY - positionRef.current.y 
    };
    
    e.preventDefault();
  }, [isInteractionReady]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    setPosition({
      x: newX,
      y: newY
    });
    
    e.preventDefault();
  }, [isPanning]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    setIsPanning(false);
    
    // Save settings if a change handler was provided
    if (onSettingsChange) {
      onSettingsChange({
        scale,
        position: positionRef.current,
        fitMethod
      });
    }
    
    e.preventDefault();
  }, [isPanning, onSettingsChange, scale, fitMethod]);

  // Generate style for the image
  const imageStyle = {
    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
    transformOrigin: 'center',
    transition: isPanning ? 'none' : 'transform 0.15s ease-out',
    maxWidth: "none",
    maxHeight: "none",
  };

  return {
    scale,
    position,
    fitMethod,
    isPanning,
    imageLoaded,
    isLoading,
    isInteractionReady,
    error,
    containerRef,
    imageRef,
    imageStyle,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    toggleFitMethod,
    handleReset,
    handleImageLoad,
    updateDimensions,
    imageUrl
  };
}
