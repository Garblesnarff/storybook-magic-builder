
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Initializes and verifies storage buckets exist for the application
 * Called on app startup to ensure buckets exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // First ensure we have a valid session
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Error getting auth session during storage initialization:', authError);
      return;
    }
    
    if (!authData.session) {
      console.log('No active session found during storage initialization');
      return;
    }
    
    console.log('Checking storage buckets with user:', authData.session.user.id);
    
    // Perform a full session refresh to ensure tokens are up-to-date
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Failed to refresh session during storage initialization:', refreshError);
      return;
    }
    
    if (!refreshData.session) {
      console.error('No session after refresh during storage initialization');
      return;
    }
    
    console.log('Session refreshed successfully during storage initialization');
    
    // Verify we can list the buckets to check connection and permission
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      
      // Try once more with fresh tokens
      const { data: retryBuckets, error: retryError } = await supabase.storage.listBuckets();
      
      if (retryError) {
        console.error('Failed to list buckets on retry:', retryError);
        return;
      }
      
      console.log('Successfully listed buckets on retry');
      
      // Check if both required buckets exist
      const hasBookImages = retryBuckets?.some(bucket => bucket.id === 'book_images');
      const hasNarrations = retryBuckets?.some(bucket => bucket.id === 'narrations');
      
      if (hasBookImages && hasNarrations) {
        console.log('All required storage buckets are available');
      } else {
        console.warn('Not all required storage buckets were found - but they should exist via SQL migrations');
      }
      
      return;
    }
    
    // Log available buckets for debugging
    if (buckets && buckets.length > 0) {
      console.log('Available storage buckets:', buckets.map(b => b.name).join(', '));
    } else {
      console.log('No storage buckets found');
    }
    
    // Check if both required buckets exist
    const hasBookImages = buckets?.some(bucket => bucket.id === 'book_images');
    const hasNarrations = buckets?.some(bucket => bucket.id === 'narrations');
    
    if (hasBookImages && hasNarrations) {
      console.log('All required storage buckets are available');
    } else {
      console.warn('Not all required storage buckets were found - but they should exist via SQL migrations');
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};
