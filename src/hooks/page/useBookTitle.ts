
import { useCallback } from 'react';
// Remove toast import since it's not used
import { Book } from '@/types/book';

export function useBookTitle(
  currentBook: Book | null,
  updateBook: (book: Book) => Promise<void>
) {
  const updateBookTitle = useCallback(async (title: string): Promise<boolean> => {
    if (!currentBook) {
      return false;
    }

    try {
      const updatedBook = {
        ...currentBook,
        title: title.trim() || 'Untitled Book'
      };

      await updateBook(updatedBook);
      return true;
    } catch (error) {
      console.error('Error updating book title:', error);
      return false;
    }
  }, [currentBook, updateBook]);

  return {
    updateBookTitle
  };
}
