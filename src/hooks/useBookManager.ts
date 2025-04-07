
import { Book } from '../types/book';
import { BookTemplate } from '@/data/bookTemplates';
import { useBookOperations } from './useBookOperations';
import { usePageOperations } from './usePageOperations';
import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useBookManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading: authLoading } = useAuth();
  
  // Log the current state for debugging
  useEffect(() => {
    console.log('useBookManager: Auth state -', {
      authLoading,
      hasUser: !!user,
      refreshTrigger
    });
  }, [authLoading, user, refreshTrigger]);
  
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

  // Add a force refresh function that increments the refresh trigger
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing books data...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Force refresh when auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Auth state updated with user, triggering book refresh');
      forceRefresh();
    }
  }, [authLoading, user, forceRefresh]);

  // Combine loading and error states
  const loading = authLoading || bookLoading || pageLoading;
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
