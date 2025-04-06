
import { supabase } from '@/integrations/supabase/client';
import { ensureStorageBuckets } from './storageService';

/**
 * Initializes required storage buckets for the application
 * Called on app startup to ensure buckets exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (!isAuthenticated) {
      console.warn('User is not authenticated. Some storage operations may fail.');
    }
    
    // Create buckets if they don't exist
    await ensureStorageBuckets();
    
    // List existing buckets to check what's already set up
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return;
    }
    
    console.log('Storage buckets currently configured:', 
      buckets?.map(b => b.name).join(', ') || 'none');
    
    // Check if both required buckets exist
    const hasBookImages = buckets?.some(bucket => bucket.name === 'book_images');
    const hasNarrations = buckets?.some(bucket => bucket.name === 'narrations');
    
    if (hasBookImages && hasNarrations) {
      console.log('All required storage buckets are available');
    } else {
      console.warn('Required storage buckets are missing - functionality may be limited');
      console.warn('Missing buckets:', 
        [
          !hasBookImages ? 'book_images' : null, 
          !hasNarrations ? 'narrations' : null
        ].filter(Boolean).join(', ')
      );
    }
    
    // Check storage policies
    console.log('Note: Storage requires proper policies to be set up in Supabase');
  } catch (error) {
    console.error('Failed to verify storage buckets:', error);
  }
};
