
import { useEffect } from 'react';
import { useBook } from '@/contexts/BookContext';
import { usePageSelection } from './page/usePageSelection';
import { usePageData } from './page/usePageData';
import { usePageActions } from './page/usePageActions';
import { useSavingState } from './page/useSavingState';
import { useBookLoading } from './page/useBookLoading';
import { usePageOperationsHandlers } from './page/usePageOperationsHandlers';

export function usePageState(bookId: string | undefined) {
  // Get context data
  const bookContext = useBook();
  const { 
    books, 
    loadBook, 
    currentBook, 
    addPage, 
    updatePage, 
    deletePage, 
    duplicatePage, 
    reorderPage 
  } = bookContext;

  console.log('usePageState: initializing with bookId:', bookId);
  console.log('usePageState: books available:', books.length);
  if (currentBook) {
    console.log('usePageState: current book:', currentBook.title);
  }
  
  // Use the separate hooks
  const { isSaving, cleanupSavingTimeout } = useSavingState();
  const { selectedPageId, setSelectedPageId, handlePageSelect } = usePageSelection(currentBook, books);
  const { currentPageData, setCurrentPageData } = usePageData(currentBook, selectedPageId);
  const { 
    handleTextChange, 
    handleLayoutChange, 
    handleTextFormattingChange, 
    handleImageSettingsChange,
    cleanupTimeouts
  } = usePageActions(currentBook, currentPageData, updatePage, setCurrentPageData);
  
  // Handle book loading
  useBookLoading(bookId, books, loadBook);
  
  // Page operation handlers
  const { 
    handleAddPage, 
    handleDuplicatePage, 
    handleDeletePage, 
    handleReorderPage 
  } = usePageOperationsHandlers(
    currentBook,
    selectedPageId,
    addPage, 
    duplicatePage, 
    deletePage, 
    reorderPage, 
    setSelectedPageId
  );
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSavingTimeout();
      cleanupTimeouts();
    };
  }, [cleanupSavingTimeout, cleanupTimeouts]);
  
  // Additional effect to clean up timeouts when the page changes
  useEffect(() => {
    if (selectedPageId) {
      cleanupTimeouts();
    }
  }, [selectedPageId, cleanupTimeouts]);

  return {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    isSaving,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage
  };
}
