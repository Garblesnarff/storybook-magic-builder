
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';
import { fetchBookFromDatabase } from './fetchBook';

/**
 * Function to load all books from Supabase
 */
export const loadBooksFromSupabase = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading books from Supabase:', error);
      return [];
    }

    const books: Book[] = [];
    
    for (const bookData of data || []) {
      const book = await fetchBookFromDatabase(bookData.id);
      if (book) books.push(book);
    }

    return books;
  } catch (e) {
    console.error('Failed to load books from Supabase:', e);
    return [];
  }
};

/**
 * Function to load a specific book from Supabase
 */
export const loadBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  return await fetchBookFromDatabase(bookId);
};
