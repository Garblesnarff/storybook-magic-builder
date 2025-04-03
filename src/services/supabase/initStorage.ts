
import { supabase } from '@/integrations/supabase/client';

/**
 * Initializes required storage buckets for the application
 * Called on app startup to ensure buckets exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // List existing buckets to check what's already set up
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return;
    }
    
    console.log('Storage buckets already configured:', 
      buckets?.map(b => b.name).join(', ') || 'none');
    
    // Check if both required buckets exist, and if so we're done
    const hasBookImages = buckets?.some(bucket => bucket.name === 'book_images');
    const hasNarrations = buckets?.some(bucket => bucket.name === 'narrations');
    
    if (hasBookImages && hasNarrations) {
      console.log('All required storage buckets are already available');
      return;
    }
    
    // Note: With the SQL migrations, we've already created the buckets with proper policies
    // This function now just verifies they exist or logs warnings
    
    if (!hasBookImages) {
      console.warn('book_images bucket not found - some features may not work properly');
    }
    
    if (!hasNarrations) {
      console.warn('narrations bucket not found - some features may not work properly');
    }
  } catch (error) {
    console.error('Failed to verify storage buckets:', error);
  }
};
