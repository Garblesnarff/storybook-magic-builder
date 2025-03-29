
import { useRef, useCallback, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';
import { supabase } from '@/integrations/supabase/client';

export function usePageActions(
  currentBook: any, // Type might need refinement if currentBook structure is complex
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
  // Removed setCurrentPageData as it's no longer provided by usePageData
) {
  // Use saving state to track operations
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Use refs for debounce timeouts
  const textChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref seems unused now, consider removing later
  // Removed imageSettingsDebounceTimerRef and delay constant

  // Handle text changes with more robust saving
  const handleTextChange = useCallback(async (value: string) => {
    if (!currentPageData) return;
    
    console.log(`handleTextChange called with value: "${value.substring(0, 30)}..." for page ${currentPageData.id}`);

    // Clear any existing timeout (This ref seems unused here, but keeping for safety unless further refactoring)
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
    // Removed setCurrentPageData from dependency array
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle layout changes - immediately save
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;

    // Removed immediate local state update: setCurrentPageData({...});

    // Save to the backend immediately
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      layout
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());

    // Removed setCurrentPageData from dependency array
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes - immediately save
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;

    const updatedTextFormatting = {
      ...currentPageData.textFormatting,
      [key]: value
    };

    // Removed immediate local state update: setCurrentPageData({...});

    // Save to the backend
    trackSavingOperation();
    updatePage({
      ...currentPageData,
      textFormatting: updatedTextFormatting
    })
    .then(() => completeSavingOperation())
    .catch(() => completeSavingOperation());

    // Removed setCurrentPageData from dependency array
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle image settings changes - Save immediately when called
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return;

    console.log('handleImageSettingsChange called with:', settings);
    // This function is now expected to be called explicitly when saving is desired (e.g., on interaction end)

    // Track the saving operation
    trackSavingOperation(); 

    // Call updatePage directly (optimistic update happens inside usePageOperations)
    updatePage({
      ...currentPageData, 
      imageSettings: settings 
    })
      .then(() => {
        console.log('Image settings save initiated successfully.');
      })
      .catch((error) => {
        // Error handling (rollback) is managed within usePageOperations' updatePage
        console.error('Error initiating image settings save:', error);
      })
      .finally(() => {
        completeSavingOperation(); // Mark saving attempt as complete
      });

  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Clean up timeouts to prevent memory leaks
  const cleanupTimeouts = useCallback(() => {
    // if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current); // Ref seems unused
    // No image settings timer to clear anymore
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
