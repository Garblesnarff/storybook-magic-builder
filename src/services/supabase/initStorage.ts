
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
      const { error: bookImagesError } = await supabase.storage.createBucket('book_images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bookImagesError) {
        console.error('Error creating book_images bucket:', bookImagesError);
      } else {
        console.log('Created book_images bucket');
        
        // Set public policy for book_images bucket
        const { error: policyError } = await supabase.storage.from('book_images').createPolicy('public-read', {
          type: 'READ',
          name: 'Public Read Access',
          definition: {},  // Empty definition means allow all
          allowedOperations: ['SELECT']
        });
        
        if (policyError) {
          console.error('Error setting public policy for book_images:', policyError);
        }
      }
    }
    
    // Check and create narrations bucket if it doesn't exist
    const narrationsBucket = buckets?.find(bucket => bucket.name === 'narrations');
    if (!narrationsBucket) {
      const { error: narrationsError } = await supabase.storage.createBucket('narrations', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (narrationsError) {
        console.error('Error creating narrations bucket:', narrationsError);
      } else {
        console.log('Created narrations bucket');
        
        // Set public policy for narrations bucket
        const { error: policyError } = await supabase.storage.from('narrations').createPolicy('public-read', {
          type: 'READ',
          name: 'Public Read Access',
          definition: {},  // Empty definition means allow all
          allowedOperations: ['SELECT']
        });
        
        if (policyError) {
          console.error('Error setting public policy for narrations:', policyError);
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error);
  }
};
