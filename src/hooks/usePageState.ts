import { useState, useCallback } from 'react';
import { useBook } from '@/contexts/BookContext';
import { useBookLoading } from './page/useBookLoading';
import { usePageSelection } from './page/usePageSelection';
import { usePageData } from './page/usePageData';
import { usePageOperationsHandlers } from './page/usePageOperationsHandlers';
import { useSavingState } from './page/useSavingState';
import { useLayoutManager } from './page/useLayoutManager';
import { useTextEditor } from './page/useTextEditor';
import { useImageSettings } from './page/useImageSettings';
import { useBookTitle } from './page/useBookTitle';
import { BookPage, ImageSettings } from '@/types/book';
import { toast } from 'sonner';

export const usePageState = (bookId?: string) => {
  // Use the book context
  const {
    books,
    currentBook,
    loadBook,
    updateBook,
    addPage,
    updatePage: contextUpdatePage,
    deletePage,
    duplicatePage,
    reorderPage,
    loading,
    error
  } = useBook();
  
  // Initialize saving state
  const { isSaving, trackSavingOperation, completeSavingOperation } = useSavingState();

  // Load the book based on ID
  useBookLoading(bookId, books, loadBook);
  
  // Handle page selection
  const { selectedPageId, setSelectedPageId, handlePageSelect } = usePageSelection(currentBook, books);
  
  // Get current page data
  const { currentPageData, setCurrentPageData } = usePageData(currentBook, selectedPageId);
  
  // Create wrapper for updatePage to handle saving state and ensure proper state updates
  const updatePage = useCallback(async (page: BookPage): Promise<void> => {
    try {
      // Log the update operation
      console.log(`updatePage in usePageState called for page ${page.id}`);
      trackSavingOperation();
      
      // Make a deep copy of the page to avoid reference issues
      const pageToUpdate = JSON.parse(JSON.stringify(page));
      
      // Update the local state immediately for responsive UI
      if (currentPageData && currentPageData.id === page.id) {
        console.log('Updating local state with new page data');
        setCurrentPageData(pageToUpdate);
      }
      
      // Persist to the database
      await contextUpdatePage(pageToUpdate);
      console.log(`Page ${page.id} successfully updated in database`);
    } catch (error) {
      console.error('Error in updatePage:', error);
      toast.error('Failed to update page');
      throw error;
    } finally {
      completeSavingOperation();
    }
  }, [contextUpdatePage, trackSavingOperation, completeSavingOperation, currentPageData, setCurrentPageData]);
  
  // Page operations (add, delete, duplicate, reorder)
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
  
  // Hook for text editing
  const { handleTextChange, handleTextFormattingChange } = useTextEditor(currentPageData, updatePage);
  
  // Hook for layout management
  const { handleLayoutChange } = useLayoutManager(currentPageData, updatePage);
  
  // Hook for image settings
  const { handleImageSettingsChange } = useImageSettings(currentPageData, updatePage);
  
  // Book title management
  const { updateBookTitle } = useBookTitle(currentBook, updateBook);
  
  return {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    isSaving,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage,
    handleDeletePage,
    loading,
    error,
    updateBookTitle
  };
};
