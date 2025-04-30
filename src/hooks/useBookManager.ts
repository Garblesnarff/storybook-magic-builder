
import { Book } from '../types/book';
import { BookTemplate } from '@/data/bookTemplates';
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';

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
    setBooks,
    setCurrentBook
  } = useBookOperations();

  // Add null checks before passing books and currentBook to usePageOperations
  const safeBooks = Array.isArray(books) ? books : [];
  
  const {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    pageLoading,
    pageError
  } = usePageOperations(
    safeBooks, 
    currentBook, 
    setBooks, 
    setCurrentBook
  );

  // Combine loading and error states
  const loading = bookLoading || pageLoading;
  const error = bookError || pageError;

  return {
    books: safeBooks,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook,
    deleteBook,
    loadBook,
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    loading,
    error
  };
}
