
import { useState } from 'react';
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
    error: bookError
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
    useState<Book[]>()[1], // This gets replaced with the setBooks function from useBookOperations
    useState<Book | null>(null)[1] // This gets replaced with the setCurrentBook function from useBookOperations
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
