
import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

interface Dimensions {
  width: number;
  height: number;
}

export function useImageFit(
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  const [fitMethod, setFitMethod] = useState<'contain' | 'cover'>(initialSettings?.fitMethod || 'contain');
  const fitMethodRef = useRef(fitMethod);
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    fitMethodRef.current = fitMethod;
  }, [fitMethod]);

  // Toggle fit method with animation frame for better performance
  const toggleFitMethod = useCallback(() => {
    requestAnimationFrame(() => {
      const newMethod = fitMethodRef.current === 'contain' ? 'cover' : 'contain';
      setFitMethod(newMethod);
    });
  }, []);

  // Auto-fit when dimensions are available - optimized version
  const fitImageToContainer = useCallback((
    imageLoaded: boolean,
    containerDimensions: Dimensions,
    imageDimensions: Dimensions,
    isInteractionReady: boolean,
    setScale: (scale: number) => void,
    setPosition: (position: { x: number, y: number }) => void,
    scaleRef: React.MutableRefObject<number>
  ) => {
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
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
      
      // Save settings after fit
      if (onSettingsChange && isInteractionReady) {
        // Short delay to ensure state is updated before saving
        setTimeout(() => {
          onSettingsChange({
            scale: newScale,
            position: { x: 0, y: 0 },
            fitMethod: fitMethodRef.current
          });
        }, 50);
      }
    });
  }, [onSettingsChange]);

  return {
    fitMethod,
    setFitMethod,
    fitMethodRef,
    toggleFitMethod,
    fitImageToContainer
  };
}
