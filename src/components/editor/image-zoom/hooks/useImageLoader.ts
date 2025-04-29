
import { useState, useEffect, useCallback } from 'react';

export function useImageLoader(src: string) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInteractionReady, setIsInteractionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Source changed, resetting image loaded state:', src);
    setImageLoaded(false);
    setIsInteractionReady(false);
    setIsLoading(true);
    setError(null);
  }, [src]);

  const handleImageLoad = useCallback(() => {
    if (!src) return;
    
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
    handleImageLoad,
    error
  };
}
