
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
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialRender = useRef(true);
  
  // State for dimensions and loading
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Track whether the component is ready for interaction
  const [isInteractionReady, setIsInteractionReady] = useState(false);
  
  // Load image dimensions when source changes
  useEffect(() => {
    setImageLoaded(false);
    
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = src;
    
    // Reset position and scale when image changes if no initial settings
    if (!initialSettings) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
    
    return () => {
      // Cleanup on unmount or when src changes
      if (settingsChangeTimeoutRef.current) {
        clearTimeout(settingsChangeTimeoutRef.current);
      }
    };
  }, [src, initialSettings]);

  // Apply initial settings when they change (e.g., when changing pages)
  useEffect(() => {
    if (!initialSettings) return;
    
    // Always apply settings when they change from outside
    setScale(initialSettings.scale);
    setPosition(initialSettings.position);
    setFitMethod(initialSettings.fitMethod);
    
    // Mark as not the initial render for future changes
    isInitialRender.current = false;
    
    // Set as ready for interaction after a short delay
    setTimeout(() => {
      setIsInteractionReady(true);
    }, 100);
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

  // Save settings when they change, with debounce to prevent excessive updates
  const saveSettings = () => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Clear any pending timeout
    if (settingsChangeTimeoutRef.current) {
      clearTimeout(settingsChangeTimeoutRef.current);
    }
    
    // Set a new timeout
    settingsChangeTimeoutRef.current = setTimeout(() => {
      onSettingsChange({
        scale,
        position,
        fitMethod
      });
    }, 500); // Debounce time of 500ms
  };

  // Effect to save settings when they change
  useEffect(() => {
    if (imageLoaded && !isInitialRender.current && isInteractionReady) {
      saveSettings();
    }
    
    return () => {
      // Clean up timeout on unmount
      if (settingsChangeTimeoutRef.current) {
        clearTimeout(settingsChangeTimeoutRef.current);
      }
    };
  }, [scale, position, fitMethod, imageLoaded, isInteractionReady]);

  // Calculate initial fitting scale when image and container dimensions are available
  useEffect(() => {
    if (!initialSettings && imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0 && imageDimensions.width > 0) {
      fitImageToContainer();
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitMethod, initialSettings]);

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
    
    setIsPanning(true);
    startPanRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !isInteractionReady) return;
    
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    setPosition({
      x: newX,
      y: newY
    });
    
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
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
