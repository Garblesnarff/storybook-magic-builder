
import { supabase } from '@/integrations/supabase/client';

/**
 * Initializes required storage buckets for the application
 * Called on app startup to ensure buckets exist
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    // Check and create book_images bucket if it doesn't exist
    const bookImagesBucket = buckets?.find(bucket => bucket.name === 'book_images');
    if (!bookImagesBucket) {
      console.log('Attempting to create book_images bucket');
      const { error: bookImagesError } = await supabase.storage.createBucket('book_images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bookImagesError) {
        console.error('Error creating book_images bucket:', bookImagesError);
      } else {
        console.log('Created book_images bucket successfully');
        
        // Since createPolicy is not available on the StorageFileApi,
        // we use SQL statements executed by Supabase admins to set policies
        console.log('Note: To set bucket policies, an admin needs to run SQL statements in the Supabase dashboard');
      }
    }
    
    // Check and create narrations bucket if it doesn't exist
    const narrationsBucket = buckets?.find(bucket => bucket.name === 'narrations');
    if (!narrationsBucket) {
      console.log('Attempting to create narrations bucket');
      const { error: narrationsError } = await supabase.storage.createBucket('narrations', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (narrationsError) {
        console.error('Error creating narrations bucket:', narrationsError);
      } else {
        console.log('Created narrations bucket successfully');
        
        // Since createPolicy is not available on the StorageFileApi,
        // we use SQL statements executed by Supabase admins to set policies
        console.log('Note: To set bucket policies, an admin needs to run SQL statements in the Supabase dashboard');
      }
    }
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error);
  }
};
