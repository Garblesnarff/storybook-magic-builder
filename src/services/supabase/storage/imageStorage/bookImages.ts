
import { supabase } from '@/integrations/supabase/client';

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
