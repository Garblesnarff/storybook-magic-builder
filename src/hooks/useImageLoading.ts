
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { preloadImage } from '@/utils/imageVerification';

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
    
    // Don't show loading state for base64 images
    if (imageUrl.startsWith('data:image')) {
      setLoadedUrl(imageUrl);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await preloadImage(imageUrl);

        if (isMounted) {
          console.log(`Image successfully loaded: ${imageUrl.substring(0, 40)}...`);
          setLoadedUrl(imageUrl);
          setIsLoading(false);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err) {
        console.error('Error loading image:', err, 'URL:', imageUrl);
        
        if (isMounted) {
          // If we haven't reached max retries, try again
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying image load (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            // Wait before retrying with exponential backoff
            setTimeout(loadImage, 1000 * Math.pow(2, retryCount));
            return;
          }
          
          setError('Failed to load image');
          setIsLoading(false);
          toast.error('Error loading image', {
            description: 'The image could not be loaded. Please try refreshing the page.'
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
