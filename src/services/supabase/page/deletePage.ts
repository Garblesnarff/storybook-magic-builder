
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { deletePageImages } from '../storage/imageStorage';
import { deletePageNarration } from '../storage/audioStorage';

/**
 * Function to delete a page from a book in Supabase
 */
export const deletePageFromSupabase = async (bookId: string, pageId: string): Promise<boolean> => {
  try {
    // Delete the page
    const { error } = await supabase
      .from('book_pages')
      .delete()
      .eq('id', pageId);
    
    if (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page.');
      return false;
    }
    
    // Delete any associated assets (image and narration)
    await deletePageImages(bookId, pageId);
    await deletePageNarration(bookId, pageId);
    
    return true;
  } catch (e) {
    console.error('Failed to delete page from Supabase', e);
    toast.error('Failed to delete page.');
    return false;
  }
};
