
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

  const {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    pageLoading,
    pageError
  } = usePageOperations(
    books,
    currentBook,
    setBooks,  // Now passing the actual setBooks function from useBookOperations
    setCurrentBook  // Now passing the actual setCurrentBook function from useBookOperations
  );

  // Combine loading and error states
  const loading = bookLoading || pageLoading;
  const error = bookError || pageError;

  return {
    books,
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
