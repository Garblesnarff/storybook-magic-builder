
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useBook } from '@/contexts/BookContext';
import { BookPage, ImageSettings } from '@/types/book';

export function useEditorPage() {
  // Get book data from context
  const { currentBook, updatePage } = useBook();
  
  // Get URL parameters
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  // State for the current page being edited
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Save current page data if it's changed
  const handleSavePage = useCallback(async (newPageData: BookPage) => {
    if (!newPageData) {
      toast.error('No page to save');
      return;
    }
    
    try {
      // Save the page data
      await updatePage(newPageData);
      toast.success('Page saved');
      
      // Update the local state after successful save
      setCurrentPageData(newPageData);
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  }, [updatePage]);
  
  // Update the page text
  const handleTextChange = useCallback(async (text: string) => {
    if (!currentPageData) return;
    
    const updatedPage: BookPage = {
      ...currentPageData,
      text
    };
    
    await handleSavePage(updatedPage);
  }, [currentPageData, handleSavePage]);
  
  // Update the page layout
  const handleLayoutChange = useCallback(async (layout: string) => {
    if (!currentPageData) return;
    
    const updatedPage: BookPage = {
      ...currentPageData,
      layout: layout as any
    };
    
    await handleSavePage(updatedPage);
  }, [currentPageData, handleSavePage]);
  
  // Update text formatting
  const handleTextFormattingChange = useCallback(async (textFormatting: any) => {
    if (!currentPageData) return;
    
    const updatedPage: BookPage = {
      ...currentPageData,
      textFormatting: {
        ...currentPageData.textFormatting,
        ...textFormatting
      }
    };
    
    await handleSavePage(updatedPage);
  }, [currentPageData, handleSavePage]);
  
  // Set the current page when the book loads or changes
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0) {
      // Get the first page of the book if no current page is set
      if (!currentPageData) {
        setCurrentPageData(currentBook.pages[0]);
      }
    }
  }, [currentBook, currentPageData]);
  
  // Handle image settings changes
  const handleImageSettingsChange = useCallback(async (settings: ImageSettings) => {
    if (!currentPageData) return;
    
    const updatedPage: BookPage = {
      ...currentPageData,
      imageSettings: settings
    };
    
    await handleSavePage(updatedPage);
  }, [currentPageData, handleSavePage]);
  
  // Tell the parent wrapper to update page data safely
  const updateCurrentPageData = useCallback((page: BookPage | null) => {
    if (page === null) {
      setCurrentPageData(null);
      return;
    }
    
    setCurrentPageData(page);
  }, []);
  
  return {
    currentPageData,
    setCurrentPageData: updateCurrentPageData,
    handleSavePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  };
}
