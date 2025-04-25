
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { verifyImageUrl, preloadImage } from '@/utils/imageVerification';

export function useImageLoading(imageUrl: string | null | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      setLoadedUrl(null);
      return;
    }

    let isMounted = true;
    
    // Reset state for new image URLs
    setIsLoading(true);
    setError(null);
    
    // Don't show loading state for base64 images
    if (imageUrl.startsWith('data:image')) {
      setLoadedUrl(imageUrl);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        console.log(`Attempting to load image: ${imageUrl.substring(0, 40)}...`);
        
        // Add cache-busting timestamp to URL
        const cacheBustedUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        await preloadImage(cacheBustedUrl);

        if (isMounted) {
          console.log(`Image successfully loaded: ${imageUrl.substring(0, 40)}...`);
          setLoadedUrl(cacheBustedUrl);
          setIsLoading(false);
          setRetryCount(0);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        
        if (isMounted) {
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying image load (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            setTimeout(loadImage, 1000 * Math.pow(2, retryCount));
            return;
          }
          
          setError('Failed to load image');
          setIsLoading(false);
          toast.error('Error loading image', {
            description: 'Please try refreshing the page'
          });
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, retryCount]);

  return { isLoading, loadedUrl, error };
}
