
import { Book } from '../types/book';
import { BookTemplate } from '@/data/bookTemplates';
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';
import { useCallback } from 'react';

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
    setCurrentBook,
    initializeBooks, // Make sure this exists in useBookOperations
  } = useBookOperations();

  const {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    pageLoading,
    pageError
  } = usePageOperations(books, currentBook, setBooks, setCurrentBook);

  // Add a force refresh function
  const forceRefresh = useCallback(async () => {
    console.log('Force refreshing books data...');
    if (typeof initializeBooks === 'function') {
      await initializeBooks();
    } else {
      console.warn('initializeBooks is not available');
    }
  }, [initializeBooks]);

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
    error,
    forceRefresh
  };
}
