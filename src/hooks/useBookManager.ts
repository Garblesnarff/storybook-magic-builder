
import { Book } from '../types/book';
import { BookTemplate } from '@/data/bookTemplates';
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';
import { useCallback, useState, useEffect, useRef } from 'react';

export function useBookManager() {
  // Use a ref to track the refresh counter to avoid re-renders causing loops
  const refreshCounterRef = useRef(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
  } = useBookOperations(refreshTrigger);

  const {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    pageLoading,
    pageError
  } = usePageOperations(books, currentBook, setBooks, setCurrentBook);

  // Add a force refresh function with debounce to prevent multiple rapid calls
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing books data...');
    refreshCounterRef.current += 1;
    setRefreshTrigger(refreshCounterRef.current);
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
