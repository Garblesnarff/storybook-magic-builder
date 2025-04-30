
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';
import { Book } from '@/types/book';

export function useBookManager() {
  const {
    books,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook,
    deleteBook,
    loadBook,
    loading: bookLoading,
    error: bookError,
    setCurrentBook,
    setBooks
  } = useBookOperations();

  const {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    loading: pageLoading,
    error: pageError
  } = usePageOperations();

  // Combine loading and error states
  const loading = bookLoading || pageLoading;
  const error = bookError || pageError;

  // Ensure books is always an array
  const safeBooks = Array.isArray(books) ? books : [];
  
  // Make sure currentBook type is preserved
  const safeCurrentBook = currentBook || null;

  // Create a safe update book method that validates the input book
  const safeUpdateBook = async (book: Book) => {
    if (!book || !book.id) {
      console.error("Cannot update book: Invalid book object or missing ID");
      return book;
    }
    return await updateBook(book);
  };

  return {
    books: safeBooks,
    currentBook: safeCurrentBook,
    createBook,
    createBookFromTemplate,
    updateBook: safeUpdateBook,
    deleteBook,
    loadBook,
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    loading,
    error,
    setCurrentBook,
    setBooks
  };
}
