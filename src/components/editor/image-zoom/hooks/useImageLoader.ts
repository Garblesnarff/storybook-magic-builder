
import { useState, useEffect, useCallback } from 'react';

export function useImageLoader(src: string) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInteractionReady, setIsInteractionReady] = useState(false);

  useEffect(() => {
    console.log('Source changed, resetting image loaded state:', src);
    setImageLoaded(false);
    setIsInteractionReady(false);
    setIsLoading(true);
  }, [src]);

  const handleImageLoad = useCallback(() => {
    console.log('Image successfully loaded:', src.substring(0, 50) + '...');
    setImageLoaded(true);
    setIsLoading(false);
    
    setTimeout(() => {
      setIsInteractionReady(true);
    }, 100);
  }, [src]);

  return {
    imageLoaded,
    isLoading,
    isInteractionReady,
    handleImageLoad
  };
}
