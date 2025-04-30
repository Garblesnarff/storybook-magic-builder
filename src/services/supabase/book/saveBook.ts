
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';

/**
 * Function to save a book to Supabase
 */
export const saveBookToSupabase = async (book: Book): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('books')
      .update({
        title: book.title,
        author: book.author,
        description: book.description,
        cover_image_url: book.coverImage,
        width: book.dimensions.width,
        height: book.dimensions.height,
        orientation: book.orientation,
        updated_at: new Date().toISOString()
      })
      .eq('id', book.id);

    if (error) {
      console.error('Error saving book to Supabase:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to save book to Supabase:', e);
    return false;
  }
};
