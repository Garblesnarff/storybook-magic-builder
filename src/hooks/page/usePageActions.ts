
import { useState, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';

export function usePageActions(
  currentBook: any, 
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void
) {
  // Local state for tracking when we should save changes
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Handle text changes
  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      text: value
    });
    
    // Debounce the save to the backend
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => {
      updatePage({
        ...currentPageData,
        text: value
      });
    }, 1000);
    setSaveTimeout(timeout);
  };
  
  // Handle layout changes
  const handleLayoutChange = (layout: PageLayout) => {
    if (!currentPageData) return;
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      layout
    });
    
    // Save to the backend
    updatePage({
      ...currentPageData,
      layout
    });
  };
  
  // Handle text formatting changes
  const handleTextFormattingChange = (key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    
    const updatedTextFormatting = {
      ...currentPageData.textFormatting,
      [key]: value
    };
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      textFormatting: updatedTextFormatting
    });
    
    // Save to the backend
    updatePage({
      ...currentPageData,
      textFormatting: updatedTextFormatting
    });
  };
  
  // Handle image settings changes
  const handleImageSettingsChange = (settings: ImageSettings) => {
    if (!currentPageData) return;
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      imageSettings: settings
    });
    
    // Debounce the save to the backend
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => {
      updatePage({
        ...currentPageData,
        imageSettings: settings
      });
    }, 500); // Use a shorter timeout for image settings to feel more responsive
    setSaveTimeout(timeout);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [saveTimeout]);
  
  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  };
}
