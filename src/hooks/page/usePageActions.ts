
import { useRef, useCallback, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';

export function usePageActions(
  currentBook: any, 
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
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

    // Clear any existing timeout
    if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);

    // Track the saving operation
    trackSavingOperation();

    try {
      // Update through the normal flow for state management and persistence
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
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle layout changes - immediately save
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;

    // Save to the backend immediately
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      layout
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes - immediately save
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;

    const updatedTextFormatting = {
      ...currentPageData.textFormatting,
      [key]: value
    };

    // Save to the backend
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      textFormatting: updatedTextFormatting
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle image settings changes - with improved debouncing
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return;

    console.log('handleImageSettingsChange called with settings:', settings);

    // No need to debounce again as the ZoomableImage component already handles this
    // Track the saving operation
    trackSavingOperation(); 

    // Update the page with new image settings
    updatePage({
      ...currentPageData, 
      imageSettings: settings 
    })
    .then(() => {
      console.log('Image settings saved successfully');
      completeSavingOperation();
    })
    .catch((error) => {
      console.error('Failed to save image settings:', error);
      completeSavingOperation();
    });
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

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
