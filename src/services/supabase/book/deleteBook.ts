
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to delete a book from Supabase
 */
export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
    // First delete all pages associated with this book
    const { error: pagesError } = await supabase
      .from('book_pages')
      .delete()
      .eq('book_id', bookId);

    if (pagesError) {
      console.error('Error deleting book pages from Supabase:', pagesError);
      return false;
    }

    // Then delete the book itself
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (bookError) {
      console.error('Error deleting book from Supabase:', bookError);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to delete book from Supabase:', e);
    return false;
  }
};
