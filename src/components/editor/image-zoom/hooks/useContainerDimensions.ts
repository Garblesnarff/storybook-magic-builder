
import { useState, useEffect, useCallback } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export function useContainerDimensions() {
  const [containerDimensions, setContainerDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [imageDimensions, setImageDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  const updateContainerDimensions = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    console.log('Updating container dimensions:', width, height);
    
    setContainerDimensions(prev => {
      if (prev.width === width && prev.height === height) return prev;
      return { width, height };
    });
  }, []);

  const updateImageDimensions = useCallback((imageRef: React.RefObject<HTMLImageElement>) => {
    if (!imageRef.current) return;
    
    const { naturalWidth, naturalHeight } = imageRef.current;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  }, []);

  return {
    containerDimensions,
    imageDimensions,
    updateContainerDimensions,
    updateImageDimensions
  };
}
