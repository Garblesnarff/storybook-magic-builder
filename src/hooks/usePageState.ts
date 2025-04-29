
import { useEffect, useCallback } from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { usePageOperations } from './usePageOperations';
import { usePageSelection } from '@/hooks/page/usePageSelection';
import { useTextEditor } from '@/hooks/page/useTextEditor';
import { usePageData } from '@/hooks/page/usePageData';
import { useSavingState } from '@/hooks/page/useSavingState';
import { useLayoutManager } from '@/hooks/page/useLayoutManager';
import { useImageSettings } from '@/hooks/page/useImageSettings';
import { usePageActions } from '@/hooks/page/usePageActions';
import { useBookTitle } from '@/hooks/page/useBookTitle';
import { useNarration } from '@/hooks/ai/useNarration';
import { toast } from 'sonner';

export function usePageState(bookId: string | undefined) {
  // Get book data from context
  const { currentBook, updateBook, updatePage, loadBook } = useBook();
  
  // Save state management
  const { isSaving, setSaving } = useSavingState();
  
  // Page selection
  const { selectedPageId, handlePageSelect } = usePageSelection(currentBook);
  
  // Page operations from the book context
  const { addPage, duplicatePage, deletePage, reorderPage } = usePageOperations();
  
  // Text editing
  const { handleTextChange } = useTextEditor(updatePage);
  
  // Current page data
  const { currentPageData } = usePageData(currentBook, selectedPageId);
  
  // Page layout management
  const { handleLayoutChange } = useLayoutManager(currentPageData, updatePage);

  // Add narration functionality
  const { generateNarration, isNarrating } = useNarration();
  
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
  const { handleImageSettingsChange: imageSettingsHandler } = useImageSettings(updatePage, setSaving);
  
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

  // Create a wrapped version of handleImageSettingsChange that works with the expected signature
  const wrappedHandleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const updatedPage: BookPage = {
        ...currentPageData,
        imageSettings: settings
      };
      
      setSaving(true);
      updatePage(updatedPage)
        .then(() => resolve())
        .catch(reject)
        .finally(() => setSaving(false));
    });
  }, [currentPageData, setSaving, updatePage]);

  // Add function to handle narration generation
  const handleGenerateNarration = useCallback(async () => {
    if (!currentPageData || !currentBook?.id) {
      toast.error("Cannot generate narration: No page selected or book ID is missing");
      return Promise.resolve();
    }

    try {
      setSaving(true);
      const narrationUrl = await generateNarration(
        currentPageData.text,
        currentBook.id, // Use currentBook.id instead of bookId to ensure we have a value
        currentPageData.id
      );

      if (narrationUrl) {
        // Update the page with the new narration URL
        const updatedPage = {
          ...currentPageData,
          narrationUrl
        };
        await updatePage(updatedPage);
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error generating narration:", error);
      toast.error("Failed to generate narration");
      return Promise.resolve();
    } finally {
      setSaving(false);
    }
  }, [currentPageData, currentBook, generateNarration, updatePage, setSaving]);
  
  return {
    currentPageData,
    selectedPageId,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange: (text: string) => handleTextChange(text, currentPageData),
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange: wrappedHandleImageSettingsChange,
    updatePage,
    handleReorderPage,
    handleDeletePage,
    updateBookTitle,
    isSaving,
    isNarrating,
    handleGenerateNarration
  };
}
