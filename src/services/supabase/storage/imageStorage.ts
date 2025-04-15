
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Verify authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please sign in to upload images');
      return null;
    }

    // Validate and extract base64 data
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data format');
    }
    
    // Convert to blob with proper MIME type
    const blob = await fetch(image).then(res => res.blob());
    const filePath = `${bookId}/${pageId}.png`;

    // Upload with upsert enabled
    const { error: uploadError } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }

    // Get public URL after successful upload
    const { data: { publicUrl } } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Image upload failed:', errorMessage);
    toast.error('Failed to upload image', { description: errorMessage });
    return null;
  }
};

/**
 * Delete images for a book from storage
 * @param bookId The book ID
 */
export const deleteBookImages = async (bookId: string): Promise<void> => {
  try {
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
