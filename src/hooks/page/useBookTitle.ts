
import { useCallback } from 'react';
import { Book } from '@/types/book';
import { toast } from 'sonner';

export function useBookTitle(
  currentBook: Book | null,
  updateBook: (book: Book) => Promise<void>
) {
  // Handle updating the book title
  const updateBookTitle = useCallback(async (title: string): Promise<boolean> => {
    if (!currentBook) return false;
    
    try {
      const updatedBook = { ...currentBook, title };
      await updateBook(updatedBook);
      return true;
    } catch (error) {
      console.error('Error updating book title:', error);
      toast.error('Failed to update book title');
      return false;
    }
  }, [currentBook, updateBook]);

  return {
    updateBookTitle
  };
}
