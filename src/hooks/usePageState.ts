
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
  
  // Only try to load the book if we have a valid bookId
  useBookLoading(bookId && bookId !== 'undefined' ? bookId : undefined, books, loadBook);
  
  const { selectedPageId, setSelectedPageId, handlePageSelect } = usePageSelection(currentBook, books);
  const { currentPageData, setCurrentPageData } = usePageData(currentBook, selectedPageId);
  
  const updatePage = useCallback(async (page: BookPage): Promise<void> => {
    // Add validation to ensure we have a valid page with required properties
    if (!page || !page.id) {
      console.error('Invalid page data provided to updatePage:', page);
      toast.error('Invalid page data');
      return;
    }
    
    try {
      console.log(`updatePage in usePageState called for page ${page.id}`);
      trackSavingOperation();
      
      // Make a deep copy of the page to avoid reference issues
      const pageToUpdate = JSON.parse(JSON.stringify(page));
      
      // Update local state immediately for responsive UI
      await setCurrentPageData(pageToUpdate);

      try {
        // If there's an image, verify it's accessible before proceeding
        if (pageToUpdate.image) {
          // Skip verification for base64 images
          if (!pageToUpdate.image.startsWith('data:image')) {
            console.log(`Verifying image URL: ${pageToUpdate.image.substring(0, 40)}...`);
            await verifyImageUrl(pageToUpdate.image);
          }
        }
        
        // Persist to the database
        console.log('Calling contextUpdatePage to persist changes to database');
        await contextUpdatePage(pageToUpdate);
        console.log(`Page ${page.id} successfully updated in database`);
      } catch (error) {
        console.error('Error in updatePage:', error);
        
        // Handle image verification failure specifically
        if (error instanceof Error && error.message.includes('verification failed')) {
          toast.error('Image could not be verified. Please try again.');
        } else {
          toast.error('Failed to update page');
        }
        
        throw error;
      }
    } finally {
      completeSavingOperation();
    }
  }, [contextUpdatePage, trackSavingOperation, completeSavingOperation, setCurrentPageData]);

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
  
  // Only pass valid data to hooks
  const { handleTextChange, handleTextFormattingChange } = useTextEditor(
    currentPageData, 
    updatePage
  );
  
  const { handleLayoutChange } = useLayoutManager(
    currentPageData, 
    updatePage
  );
  
  const { handleImageSettingsChange } = useImageSettings(
    currentPageData, 
    updatePage
  );
  
  const { updateBookTitle } = useBookTitle(
    currentBook, 
    updateBook
  );
  
  return {
    books: Array.isArray(books) ? books : [],
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
