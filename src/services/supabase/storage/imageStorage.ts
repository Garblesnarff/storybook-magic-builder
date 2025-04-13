
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image to Supabase Storage with consistent naming to prevent duplicates
 * @param image Base64 image data
 * @param bookId The book ID
 * @param pageId The page ID
 * @returns The public URL of the uploaded image or null if upload failed
 */
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Authentication required for uploading images');
      toast.error('Please log in to upload images');
      return null;
    }

    // Extract the base64 data from the string
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      console.error('Invalid image data format');
      return null;
    }
    
    // Convert base64 to a Blob
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Use consistent file naming pattern - pageId only without timestamp
    const filePath = `${bookId}/${pageId}.png`;
    
    console.log(`Attempting to upload image to ${filePath}`);
    
    // Upload to Supabase Storage with upsert to replace existing file
    const { data, error } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true // This will replace any existing file with the same name
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', {
        description: error.message
      });
      return null;
    }
    
    // Return the public URL for the image
    const { data: urlData } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(data.path);
    
    console.log(`Image saved with consistent filename: ${filePath}`);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image to storage', e);
    toast.error('Failed to upload image', {
      description: e instanceof Error ? e.message : 'Unknown error'
    });
    return null;
  }
};

/**
 * Delete images for a book from storage
 * @param bookId The book ID
 */
export const deleteBookImages = async (bookId: string): Promise<void> => {
  try {
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Authentication required for deleting images');
      return;
    }
    
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('book_images')
      .list(bookId);
    
    if (!storageError && storageData && storageData.length > 0) {
      const filesToDelete = storageData.map(file => `${bookId}/${file.name}`);
      
      const { error: deleteError } = await supabase
        .storage
        .from('book_images')
        .remove(filesToDelete);
        
      if (deleteError) {
        console.error('Error deleting book images:', deleteError);
      } else {
        console.log(`Successfully deleted ${filesToDelete.length} images for book ${bookId}`);
      }
    }
  } catch (e) {
    console.error('Failed to delete book images from storage', e);
  }
};

/**
 * Delete page image from storage
 * @param bookId The book ID
 * @param pageId The page ID
 */
export const deletePageImages = async (bookId: string, pageId: string): Promise<void> => {
  try {
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Authentication required for deleting images');
      return;
    }
    
    // Just remove the single consistent filename for this page
    const filePath = `${bookId}/${pageId}.png`;
    
    const { error: deleteError } = await supabase
      .storage
      .from('book_images')
      .remove([filePath]);
      
    if (deleteError) {
      console.error(`Error deleting page image: ${filePath}`, deleteError);
    } else {
      console.log(`Successfully deleted image for page ${pageId}`);
    }
  } catch (storageError) {
    console.error('Error deleting page images:', storageError);
    // Continue even if image deletion fails
  }
};

/**
 * Clean up orphaned images
 * @param bookId The book ID
 * @param validPageIds Array of valid page IDs
 */
export const cleanupOrphanedImages = async (bookId: string, validPageIds: string[]): Promise<void> => {
  try {
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Authentication required for cleaning up images');
      return;
    }
    
    // Get all images for this book
    const { data: storageData, error: listError } = await supabase
      .storage
      .from('book_images')
      .list(bookId);
    
    if (listError) {
      console.error('Error listing book images:', listError);
      return;
    }
    
    if (!storageData || storageData.length === 0) {
      return; // No images to clean up
    }
    
    // Find images that don't belong to valid pages
    const orphanedFiles = storageData.filter(file => {
      // Extract pageId from filename
      const filePageId = file.name.split('.')[0];
      // Check if this is a legacy timestamped filename
      if (filePageId.includes('_')) {
        return true; // Consider old timestamped files as orphaned
      }
      // Check if file doesn't belong to any current valid page
      return !validPageIds.includes(filePageId);
    }).map(file => `${bookId}/${file.name}`);
    
    if (orphanedFiles.length > 0) {
      console.log(`Found ${orphanedFiles.length} orphaned images to clean up for book ${bookId}`);
      
      const { error: deleteError } = await supabase
        .storage
        .from('book_images')
        .remove(orphanedFiles);
        
      if (deleteError) {
        console.error('Error deleting orphaned images:', deleteError);
      } else {
        console.log(`Successfully cleaned up ${orphanedFiles.length} orphaned images`);
      }
    }
  } catch (e) {
    console.error('Failed to clean up orphaned images:', e);
  }
};
