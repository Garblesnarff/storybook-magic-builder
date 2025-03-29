
import { useState, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

export function useZoomableImage(
  src: string, 
  initialSettings?: ImageSettings, 
  onSettingsChange?: (settings: ImageSettings) => void
) {
  // State for zoom, pan, and fit
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [fitMethod, setFitMethod] = useState<'contain' | 'cover'>(initialSettings?.fitMethod || 'contain');
  
  // Refs for more stable state during operations
  const imageRef = useRef<HTMLImageElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(position); // Keep a ref to latest position
  const scaleRef = useRef(scale); // Keep a ref to latest scale
  
  // Save refs to current state for stable callbacks
  useEffect(() => {
    positionRef.current = position;
    scaleRef.current = scale;
  }, [position, scale]);
  
  // Track settings to avoid saving unnecessarily
  const lastSettingsRef = useRef<ImageSettings>({
    scale,
    position,
    fitMethod
  });
  
  // Control when settings should be saved to avoid unnecessary updates
  const shouldSaveSettingsRef = useRef(false);
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for dimensions and loading
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Track whether the component is ready for interaction
  const [isInteractionReady, setIsInteractionReady] = useState(false);
  
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
        shouldSaveSettingsRef.current = true;
      }, 200);
    };
    img.src = src;
    
    // Reset position and scale when image changes if no initial settings
    if (!initialSettings) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
      shouldSaveSettingsRef.current = false;
    }
    
    return () => {
      // Cleanup on unmount or when src changes
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, [src]);

  // Apply initial settings when they change (e.g., when changing pages)
  useEffect(() => {
    if (!initialSettings) return;
    
    console.log('Applying initial settings:', initialSettings);
    
    // Always apply settings when they change from outside
    setScale(initialSettings.scale);
    setPosition(initialSettings.position);
    setFitMethod(initialSettings.fitMethod);
    
    // Update the ref
    lastSettingsRef.current = {
      scale: initialSettings.scale,
      position: initialSettings.position, 
      fitMethod: initialSettings.fitMethod
    };
    
    // Don't save settings right after loading them
    shouldSaveSettingsRef.current = false;
    
    // Set as ready for interaction after a short delay
    setTimeout(() => {
      setIsInteractionReady(true);
      shouldSaveSettingsRef.current = true;
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

  // Save settings function with debounce
  const saveSettings = () => {
    if (!onSettingsChange || !imageLoaded || !shouldSaveSettingsRef.current) return;
    
    // Don't save if panning is active
    if (isPanning) return;
    
    // Clear any pending timeout
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    
    // Create a current snapshot of settings to save
    const currentSettings = {
      scale,
      position,
      fitMethod
    };
    
    // Compare with last saved settings to detect changes
    const hasChanged = 
      currentSettings.scale !== lastSettingsRef.current.scale ||
      currentSettings.position.x !== lastSettingsRef.current.position.x ||
      currentSettings.position.y !== lastSettingsRef.current.position.y ||
      currentSettings.fitMethod !== lastSettingsRef.current.fitMethod;
      
    // Only save if there are actual changes
    if (!hasChanged) return;
    
    // Update ref to latest values
    lastSettingsRef.current = { ...currentSettings };
    
    // Set a new timeout for debounced save
    settingsTimeoutRef.current = setTimeout(() => {
      console.log('Saving image settings:', currentSettings);
      onSettingsChange(currentSettings);
    }, 250);
  };

  // Save settings when they change (except during panning)
  useEffect(() => {
    if (!isPanning && imageLoaded && isInteractionReady && shouldSaveSettingsRef.current) {
      saveSettings();
    }
  }, [scale, position.x, position.y, fitMethod, imageLoaded, isPanning, isInteractionReady]);

  // Auto-fit when dimensions are available
  useEffect(() => {
    if (!initialSettings && imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0 && imageDimensions.width > 0) {
      fitImageToContainer();
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitMethod]);

  const fitImageToContainer = () => {
    if (!imageLoaded || containerDimensions.width <= 0 || containerDimensions.height <= 0 || imageDimensions.width <= 0) {
      return;
    }
    
    const widthRatio = containerDimensions.width / imageDimensions.width;
    const heightRatio = containerDimensions.height / imageDimensions.height;
    
    // For contain: use the smaller ratio to ensure the whole image is visible
    // For cover: use the larger ratio to fill the container
    const newScale = fitMethod === 'contain' 
      ? Math.min(widthRatio, heightRatio) 
      : Math.max(widthRatio, heightRatio);
    
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
    
    // Update the ref
    lastSettingsRef.current = {
      scale: newScale,
      position: { x: 0, y: 0 },
      fitMethod
    };
  };

  const toggleFitMethod = () => {
    const newMethod = fitMethod === 'contain' ? 'cover' : 'contain';
    setFitMethod(newMethod);
    // Fit will be applied by the useEffect when fitMethod changes
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    
    // Set panning active
    setIsPanning(true);
    
    // Store the initial point where the user clicked
    // Use current position from ref for stability
    startPanRef.current = { 
      x: e.clientX - positionRef.current.x, 
      y: e.clientY - positionRef.current.y 
    };
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !isInteractionReady) return;
    
    // Calculate new position
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    // Update position directly during panning
    setPosition({
      x: newX,
      y: newY
    });
    
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
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
    
    // Force save settings after panning ends
    if (isInteractionReady && shouldSaveSettingsRef.current) {
      // Update lastSettingsRef before saving
      lastSettingsRef.current = {
        scale: scaleRef.current,
        position: { x: finalX, y: finalY },
        fitMethod
      };
      
      // Clear any existing timeout
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
      
      // Save with a short delay
      settingsTimeoutRef.current = setTimeout(() => {
        if (onSettingsChange) {
          console.log('Saving image settings after panning:', lastSettingsRef.current);
          onSettingsChange(lastSettingsRef.current);
        }
      }, 50);
    }
  };

  const handleReset = () => {
    fitImageToContainer();
  };

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
