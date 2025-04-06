
import { supabase } from '@/integrations/supabase/client';

/**
 * Initializes required storage buckets for the application
 * Called on app startup to ensure buckets exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // Just verify that we can list the buckets to check connection
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return;
    }
    
    // Log available buckets for debugging
    console.log('Available storage buckets:', 
      buckets?.map(b => b.name).join(', ') || 'none');
    
    // Check if both required buckets exist
    const hasBookImages = buckets?.some(bucket => bucket.id === 'book_images');
    const hasNarrations = buckets?.some(bucket => bucket.id === 'narrations');
    
    if (hasBookImages && hasNarrations) {
      console.log('All required storage buckets are available');
    } else {
      console.warn('Some required storage buckets may be missing - contact support if uploads fail');
      console.warn('Expected buckets:',
        [
          !hasBookImages ? 'book_images' : null, 
          !hasNarrations ? 'narrations' : null
        ].filter(Boolean).join(', ')
      );
    }
  } catch (error) {
    console.error('Failed to verify storage buckets:', error);
  }
};
