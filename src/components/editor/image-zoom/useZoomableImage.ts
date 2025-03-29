import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageSettings } from '@/types/book';

export function useZoomableImage(
  src: string, 
  initialSettings?: ImageSettings, 
  onSettingsChange?: (settings: ImageSettings) => void
) {
  console.log('useZoomableImage: initializing with settings:', initialSettings);
  
  // State for zoom, pan, and fit
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [fitMethod, setFitMethod] = useState<'contain' | 'cover'>(initialSettings?.fitMethod || 'contain');
  
  // Refs for DOM elements and interaction tracking
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for tracking state in callbacks
  const startPanRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const scaleRef = useRef(scale);
  const isPanningRef = useRef(isPanning);
  const fitMethodRef = useRef(fitMethod);
  
  // State for dimensions and loading
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInteractionReady, setIsInteractionReady] = useState(false);
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  
  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);
  
  useEffect(() => {
    fitMethodRef.current = fitMethod;
  }, [fitMethod]);
  
  // Load image dimensions when source changes
  useEffect(() => {
    setImageLoaded(false);
    setIsInteractionReady(false);
    
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      // Set as ready for interaction after image loads
      setTimeout(() => {
        setIsInteractionReady(true);
      }, 200);
    };
    img.src = src;
    
    // Reset position and scale when image changes if no initial settings
    if (!initialSettings) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  }, [src, initialSettings]);

  // Apply initial settings when they change (e.g., when changing pages)
  useEffect(() => {
    if (!initialSettings) return;
    
    console.log('Applying initial settings:', initialSettings);
    
    // Apply settings when they change from outside
    setScale(initialSettings.scale);
    setPosition(initialSettings.position);
    setFitMethod(initialSettings.fitMethod);
    
    // Set as ready for interaction after a short delay
    setTimeout(() => {
      setIsInteractionReady(true);
    }, 200);
  }, [initialSettings]);

  // Get container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Save settings function
  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Don't save if panning is active
    if (isPanningRef.current) return;
    
    // Create settings object from current state
    const currentSettings: ImageSettings = {
      scale: scaleRef.current,
      position: positionRef.current,
      fitMethod: fitMethodRef.current
    };
    
    console.log('Saving image settings:', currentSettings);
    onSettingsChange(currentSettings);
  }, [imageLoaded, isInteractionReady, onSettingsChange]);

  // Auto-fit when dimensions are available
  const fitImageToContainer = useCallback(() => {
    if (!imageLoaded || containerDimensions.width <= 0 || containerDimensions.height <= 0 || imageDimensions.width <= 0) {
      return;
    }
    
    const widthRatio = containerDimensions.width / imageDimensions.width;
    const heightRatio = containerDimensions.height / imageDimensions.height;
    
    // For contain: use the smaller ratio to ensure the whole image is visible
    // For cover: use the larger ratio to fill the container
    const newScale = fitMethodRef.current === 'contain' 
      ? Math.min(widthRatio, heightRatio) 
      : Math.max(widthRatio, heightRatio);
    
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
    
    // Save settings after fit
    setTimeout(() => {
      if (onSettingsChange && isInteractionReady) {
        onSettingsChange({
          scale: newScale,
          position: { x: 0, y: 0 },
          fitMethod: fitMethodRef.current
        });
      }
    }, 50);
  }, [imageLoaded, containerDimensions, imageDimensions, onSettingsChange, isInteractionReady]);

  // Apply auto-fit when relevant properties change
  useEffect(() => {
    if (!initialSettings && imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0 && imageDimensions.width > 0) {
      fitImageToContainer();
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitMethod, initialSettings, fitImageToContainer]);

  // Toggle fit method
  const toggleFitMethod = useCallback(() => {
    const newMethod = fitMethodRef.current === 'contain' ? 'cover' : 'contain';
    setFitMethod(newMethod);
    // Fit will be applied by the useEffect when fitMethod changes
  }, []);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 4));
    
    // Save settings after zoom
    setTimeout(() => saveSettings(), 50);
  }, [saveSettings]);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
    
    // Save settings after zoom
    setTimeout(() => saveSettings(), 50);
  }, [saveSettings]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    
    // Set panning active
    setIsPanning(true);
    
    // Store the initial point where the user clicked
    startPanRef.current = { 
      x: e.clientX - positionRef.current.x, 
      y: e.clientY - positionRef.current.y 
    };
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    
    e.preventDefault();
  }, [isInteractionReady]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current || !isInteractionReady) return;
    
    // Calculate new position
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    // Update position during panning
    setPosition({
      x: newX,
      y: newY
    });
    
    e.preventDefault();
  }, [isInteractionReady]);

  // Handle mouse up to end panning
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    
    setIsPanning(false);
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    // Calculate final position
    const finalX = e.clientX - startPanRef.current.x;
    const finalY = e.clientY - startPanRef.current.y;
    
    // Update position one more time to ensure we have the final position
    setPosition({
      x: finalX,
      y: finalY
    });
    
    // Save settings after panning ends
    setTimeout(() => {
      if (isInteractionReady && onSettingsChange) {
        onSettingsChange({
          scale: scaleRef.current,
          position: { x: finalX, y: finalY },
          fitMethod: fitMethodRef.current
        });
      }
    }, 50);
    
  }, [isInteractionReady, onSettingsChange]);

  // Reset function
  const handleReset = useCallback(() => {
    fitImageToContainer();
  }, [fitImageToContainer]);

  // Save settings when they change (except during panning)
  useEffect(() => {
    if (!isPanning && imageLoaded && isInteractionReady) {
      // Use timeout to avoid saving too frequently
      const timeout = setTimeout(() => {
        saveSettings();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [scale, position, fitMethod, imageLoaded, isPanning, isInteractionReady, saveSettings]);

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
