
import { useCallback } from 'react';
import { Book } from '../../types/book';
import { updateBook as updateBookService, deleteBook as deleteBookService } from '../../services/bookOperations';
import { toast } from 'sonner';

export function useBookModification(
  books: Book[],
  currentBook: Book | null,
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const updateBook = useCallback(async (updatedBook: Book): Promise<void> => {
    if (!updatedBook || !updatedBook.id) {
      console.error('Invalid book data provided to updateBook');
      toast.error('Failed to update book: Invalid data');
      return;
    }
    
    try {
      const updatedBooksResult = await updateBookService(updatedBook, books); 
      setBooks(updatedBooksResult);
      
      if (currentBook?.id === updatedBook.id) { 
        setCurrentBook({ ...updatedBook });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  }, [books, currentBook, setBooks, setCurrentBook]);

  const deleteBook = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      console.error('Invalid book ID provided to deleteBook');
      toast.error('Invalid book ID');
      return;
    }
    
    try {
      const updatedBooksResult = await deleteBookService(id, books); 
      setBooks(updatedBooksResult);
      
      if (currentBook?.id === id) { 
        setCurrentBook(updatedBooksResult.length ? updatedBooksResult[0] : null);
      }
      
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  }, [books, currentBook, setBooks, setCurrentBook]);

  return {
    updateBook,
    deleteBook
  };
}
