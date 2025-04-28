
import { useState, useEffect, useCallback } from 'react';
import { BookPage, ImageSettings, PageLayout } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { usePageOperations } from './usePageOperations';
import { usePageSelection } from './hooks/page/usePageSelection';
import { useTextEditor } from './hooks/page/useTextEditor';
import { usePageData } from './hooks/page/usePageData';
import { useSavingState } from './hooks/page/useSavingState';
import { useLayoutManager } from './hooks/page/useLayoutManager';
import { useImageSettings } from './hooks/page/useImageSettings';
import { usePageActions } from './hooks/page/usePageActions';
import { useBookTitle } from './hooks/page/useBookTitle';

export function usePageState(bookId: string | undefined) {
  // Get book data from context
  const { currentBook, updateBook, updatePage, loadBook } = useBook();
  
  // Save state management
  const { isSaving, setSaving } = useSavingState();
  
  // Page selection
  const { selectedPageId, handlePageSelect } = usePageSelection(bookId, currentBook);
  
  // Page operations from the book context
  const { addPage, duplicatePage, deletePage, reorderPage } = usePageOperations();
  
  // Text editing
  const { handleTextChange } = useTextEditor(updatePage, setSaving);
  
  // Page layout management
  const { handleLayoutChange } = useLayoutManager(updatePage, setSaving);
  
  // Page data access
  const { currentPageData } = usePageData(currentBook, selectedPageId);
  
  // Text formatting
  const handleTextFormattingChange = useCallback((key: string, value: any) => {
    if (!currentPageData) return;
    
    const updatedPage: BookPage = {
      ...currentPageData,
      textFormatting: {
        ...currentPageData.textFormatting,
        [key]: value
      }
    };
    
    setSaving(true);
    updatePage(updatedPage).finally(() => setSaving(false));
  }, [currentPageData, updatePage, setSaving]);
  
  // Image settings
  const { handleImageSettingsChange } = useImageSettings(updatePage, setSaving);
  
  // Page actions
  const { handleAddPage, handleDuplicatePage, handleDeletePage, handleReorderPage } = 
    usePageActions(bookId, addPage, duplicatePage, deletePage, reorderPage, handlePageSelect);
  
  // Book title updating
  const { updateBookTitle } = useBookTitle(currentBook, updateBook);
  
  // Effect to load the book if not already loaded
  useEffect(() => {
    if (bookId && !currentBook) {
      loadBook(bookId);
    }
  }, [bookId, currentBook, loadBook]);
  
  return {
    currentPageData,
    selectedPageId,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    handleReorderPage,
    handleDeletePage,
    updateBookTitle,
    isSaving,
  };
}
