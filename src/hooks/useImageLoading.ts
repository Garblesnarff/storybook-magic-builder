
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { preloadImage } from '@/utils/imageVerification';

export function useImageLoading(imageUrl: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      setLoadedUrl(null);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await preloadImage(imageUrl);

        if (isMounted) {
          setLoadedUrl(imageUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
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
  }, [imageUrl]);

  return { isLoading, loadedUrl, error };
}
