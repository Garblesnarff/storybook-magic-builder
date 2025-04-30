
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to reorder pages in a book in Supabase
 */
export const reorderPagesInSupabase = async (bookId: string, pageOrdering: {id: string, pageNumber: number}[]): Promise<boolean> => {
  try {
    // Create an array of updates to perform
    const updates = pageOrdering.map(({id, pageNumber}) => ({
      id,
      book_id: bookId,
      page_number: pageNumber
    }));
    
    // Update all pages in a batch
    const { error } = await supabase
      .from('book_pages')
      .upsert(updates);
    
    if (error) {
      console.error('Error reordering pages:', error);
      toast.error('Failed to reorder pages.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to reorder pages in Supabase', e);
    toast.error('Failed to reorder pages.');
    return false;
  }
};
