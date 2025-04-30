
import { useCallback } from 'react';
import { Book } from '../../types/book';
import { loadBookById } from '../../services/bookOperations';
import { toast } from 'sonner';

export function useBookFetching(
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const loadBook = useCallback(async (id: string): Promise<Book | null> => {
    if (!id) {
      console.error('Invalid book ID provided to loadBook');
      toast.error('Invalid book ID');
      return null;
    }
    
    try {
      const book = await loadBookById(id);
      if (book) {
        setCurrentBook(book);
        return book;
      }
      return null;
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book');
      return null;
    }
  }, [setCurrentBook]);

  return {
    loadBook
  };
}
