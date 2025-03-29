
import { useState, useEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export function useImageDimensions(src: string) {
  const [imageDimensions, setImageDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
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
      }, 200);
    };
    img.src = src;
  }, [src]);

  // Get container dimensions handler
  const updateContainerSize = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerDimensions({ width, height });
  };

  return {
    imageDimensions,
    containerDimensions,
    setContainerDimensions,
    imageLoaded, 
    isInteractionReady,
    updateContainerSize
  };
}
