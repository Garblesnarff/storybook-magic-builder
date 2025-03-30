
import { useState, useCallback, useEffect } from 'react';
import { Book, BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';
import { useBookLoading } from './page/useBookLoading';
import { usePageSelection } from './page/usePageSelection';
import { usePageData } from './page/usePageData';
import { useSavingState } from './page/useSavingState';
import { usePageOperationsHandlers } from './page/usePageOperationsHandlers';
import { usePageActions } from './page/usePageActions';

export const usePageState = (bookId?: string) => {
  // Use the book context
  const {
    books,
    currentBook,
    loadBook,
    updateBook,
    addPage,
    updatePage,
    deletePage,
    duplicatePage,
    reorderPage,
    loading,
    error
  } = useBook();
  
  // Use the book loading hook
  useBookLoading(bookId, books, loadBook);
  
  // Use the page selection hook
  const {
    selectedPageId,
    setSelectedPageId,
    handlePageSelect
  } = usePageSelection(currentBook, books);
  
  // Use the page data hook
  const { currentPageData, setCurrentPageData } = usePageData(currentBook, selectedPageId);
  
  // Use the saving state hook
  const { isSaving, trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Use the page operations handlers hook
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
  
  // Use the page actions hook for content changes
  const {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  } = usePageActions(currentBook, currentPageData, updatePage);
  
  // Handle updating the book title
  const updateBookTitle = useCallback(async (newTitle: string) => {
    if (currentBook) {
      try {
        trackSavingOperation();
        const updatedBook = { ...currentBook, title: newTitle };
        await updateBook(updatedBook);
        return true;
      } catch (error) {
        console.error('Error updating book title:', error);
        toast.error('Failed to update book title');
        return false;
      } finally {
        completeSavingOperation();
      }
    }
    return false;
  }, [currentBook, updateBook, trackSavingOperation, completeSavingOperation]);
  
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
