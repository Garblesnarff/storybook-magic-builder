
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Book } from '@/types/book';
import { useSavingState } from './useSavingState';

export function useBookTitle(
  currentBook: Book | null, 
  updateBook: (book: Book) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Handle updating the book title
  const updateBookTitle = useCallback(async (newTitle: string): Promise<boolean> => {
    if (currentBook) {
      try {
        trackSavingOperation();
        const updatedBook = { ...currentBook, title: newTitle };
        await updateBook(updatedBook);
        return true;
      } catch (error) {
        console.error('Error updating book title:', error);
        return false;
      } finally {
        completeSavingOperation();
      }
    }
    return false;
  }, [currentBook, updateBook, trackSavingOperation, completeSavingOperation]);
  
  return {
    updateBookTitle
  };
}
