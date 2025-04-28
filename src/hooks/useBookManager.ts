
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
    setCurrentBook
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
    setCurrentBook
  };
}
