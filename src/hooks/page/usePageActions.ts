
import { useRef, useCallback, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Handle text changes with more robust saving
  const handleTextChange = useCallback(async (value: string) => {
    if (!currentPageData) return;
    
    console.log(`handleTextChange called with value: "${value.substring(0, 30)}..." for page ${currentPageData.id}`);
    
    // Update local state immediately for UI responsiveness
    setCurrentPageData({
      ...currentPageData,
      text: value
    });
    
    // Clear any existing timeout
    if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);
    
    // Track the saving operation
    trackSavingOperation();
    
    try {
      // First, directly update in Supabase for immediate persistence
      const { error } = await supabase
        .from('book_pages')
        .update({
          text: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPageData.id);
        
      if (error) {
        console.error('Direct Supabase update error:', error);
        throw error;
      }
      
      // Then also update through the normal flow for state management
      await updatePage({
        ...currentPageData,
        text: value
      });
      
      console.log(`Text successfully saved for page ${currentPageData.id}`);
    } catch (error) {
      console.error('Error saving text:', error);
    } finally {
      completeSavingOperation();
    }
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
    
    console.log('handleImageSettingsChange called with:', settings);
    
    // Create a completely new object to avoid any reference issues
    const updatedPage = {
      ...currentPageData,
      imageSettings: { ...settings } // Create a new object to avoid reference issues
    };
    
    // Update UI immediately
    setCurrentPageData(updatedPage);
    
    // Cancel any pending timeouts to prevent race conditions
    if (imageSettingsTimeoutRef.current) {
      clearTimeout(imageSettingsTimeoutRef.current);
    }
    
    // Directly save without debouncing to ensure changes persist
    trackSavingOperation();
    console.log('Saving image settings to backend:', settings);
    
    // Use the updated page with the new settings
    updatePage(updatedPage)
      .then(() => {
        console.log('Image settings saved successfully');
        completeSavingOperation();
      })
      .catch((error) => {
        console.error('Failed to save image settings:', error);
        completeSavingOperation();
      });
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
