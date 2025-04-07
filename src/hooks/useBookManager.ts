
import { Book } from '../types/book';
import { BookTemplate } from '@/data/bookTemplates';
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';
import { useCallback, useState, useEffect } from 'react';

export function useBookManager() {
  // Add a refreshCounter state to force refresh
  const [refreshCounter, setRefreshCounter] = useState(0);
  
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
    initializeBooks,
  } = useBookOperations(refreshCounter);

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
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing books data...');
    setRefreshCounter(prev => prev + 1);
  }, []);

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
