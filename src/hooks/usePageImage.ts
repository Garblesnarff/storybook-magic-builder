
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { verifyImageUrl, preloadImage } from '@/utils/imageVerification';

export function usePageImage(imageUrl: string | null | undefined) {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadImage() {
      if (!imageUrl) {
        setLoadedImage(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First verify the image is accessible
        const isValid = await verifyImageUrl(imageUrl);
        if (!isValid) {
          throw new Error('Image verification failed');
        }

        // Then preload it
        await preloadImage(imageUrl);
        
        if (isMounted) {
          console.log('Image successfully loaded:', imageUrl.substring(0, 50));
          setLoadedImage(imageUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setError('Failed to load image');
          setIsLoading(false);
          toast.error('Error loading image', {
            description: 'Please try regenerating the image'
          });
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return { loadedImage, isLoading, error };
}
