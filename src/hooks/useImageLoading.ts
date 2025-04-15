
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        // Create a new image object
        const img = new Image();
        
        // Create a promise that resolves when the image loads
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

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
