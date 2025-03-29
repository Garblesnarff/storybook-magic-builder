
import { useRef, useCallback, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';

export function usePageActions(
  currentBook: any, 
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void
) {
  // Use saving state to track operations
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Use refs for debounce timeouts
  const textChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle text changes
  const handleTextChange = useCallback((value: string) => {
    if (!currentPageData) return;
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      text: value
    });
    
    // Debounce the save to the backend
    if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);
    
    textChangeTimeoutRef.current = setTimeout(() => {
      trackSavingOperation();
      
      updatePage({
        ...currentPageData,
        text: value
      })
      .then(() => completeSavingOperation())
      .catch(() => completeSavingOperation());
      
    }, 1000);
  }, [currentPageData, setCurrentPageData, updatePage, trackSavingOperation, completeSavingOperation]);
  
  // Handle layout changes - immediately save
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;
    
    // Update local state immediately
    setCurrentPageData({
      ...currentPageData,
      layout
    });
    
    // Save to the backend immediately
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      layout
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());
    
  }, [currentPageData, setCurrentPageData, updatePage, trackSavingOperation, completeSavingOperation]);
  
  // Handle text formatting changes - immediately save
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
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
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      textFormatting: updatedTextFormatting
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());
    
  }, [currentPageData, setCurrentPageData, updatePage, trackSavingOperation, completeSavingOperation]);
  
  // Handle image settings changes with improved reliability
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return;
    
    console.log('Image settings change received:', settings);
    
    // Make a deep clone to avoid reference issues
    const updatedPageData = {
      ...JSON.parse(JSON.stringify(currentPageData)),
      imageSettings: settings
    };
    
    // Update local state immediately
    setCurrentPageData(updatedPageData);
    
    // Use the settings directly from parameter to avoid stale closures
    // Cancel any pending timeouts to prevent race conditions
    if (imageSettingsTimeoutRef.current) {
      clearTimeout(imageSettingsTimeoutRef.current);
    }
    
    imageSettingsTimeoutRef.current = setTimeout(() => {
      trackSavingOperation();
      console.log('Saving image settings to backend:', settings);
      
      // Use the latest page data but with the settings parameter
      const latestPageData = {
        ...currentPageData, // Use reference for latest
        imageSettings: settings // Use parameter directly
      };
      
      updatePage(latestPageData)
        .then(() => {
          console.log('Image settings saved successfully');
          completeSavingOperation();
        })
        .catch((error) => {
          console.error('Failed to save image settings:', error);
          completeSavingOperation();
        });
    }, 250); // Shorter timeout for better responsiveness
    
  }, [currentPageData, setCurrentPageData, updatePage, trackSavingOperation, completeSavingOperation]);
  
  // Clean up timeouts to prevent memory leaks
  const cleanupTimeouts = useCallback(() => {
    if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);
    if (imageSettingsTimeoutRef.current) clearTimeout(imageSettingsTimeoutRef.current);
  }, []);
  
  // Clean up timeouts on unmount or when currentPageData changes
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, [cleanupTimeouts]);
  
  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    cleanupTimeouts
  };
}
