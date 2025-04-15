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
import { verifyImageUrl } from '@/utils/imageVerification';

export const usePageState = (bookId?: string) => {
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
  
  const { isSaving, trackSavingOperation, completeSavingOperation } = useSavingState();
  
  useBookLoading(bookId, books, loadBook);
  const { selectedPageId, setSelectedPageId, handlePageSelect } = usePageSelection(currentBook, books);
  const { currentPageData, setCurrentPageData } = usePageData(currentBook, selectedPageId);
  
  const updatePage = useCallback(async (page: BookPage): Promise<void> => {
    try {
      console.log(`updatePage in usePageState called for page ${page.id}`);
      trackSavingOperation();
      
      // Make a deep copy of the page to avoid reference issues
      const pageToUpdate = JSON.parse(JSON.stringify(page));
      
      // If there's an image, verify it's accessible before proceeding
      if (pageToUpdate.image) {
        try {
          await verifyImageUrl(pageToUpdate.image);
        } catch (error) {
          console.error('Image verification failed:', error);
          toast.error('Failed to verify image URL');
          completeSavingOperation();
          return;
        }
      }
      
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
  
  const { handleTextChange, handleTextFormattingChange } = useTextEditor(currentPageData, updatePage);
  
  const { handleLayoutChange } = useLayoutManager(currentPageData, updatePage);
  
  const { handleImageSettingsChange } = useImageSettings(currentPageData, updatePage);
  
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
