
import { useCallback, useRef, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';
import { toast } from 'sonner';

export function usePageActions(
  currentBook: any,
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  const textChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isImageSaveDebouncing = useRef(false);

  // Handle text changes
  const handleTextChange = useCallback(async (text: string) => {
    if (!currentPageData) return;
    
    console.log(`usePageActions: handleTextChange called for page ${currentPageData.id}`);
    trackSavingOperation();
    
    try {
      await updatePage({ ...currentPageData, text });
      console.log(`usePageActions: updatePage successful for text change on page ${currentPageData.id}`);
    } catch (error) {
      console.error(`usePageActions: updatePage failed for text change on page ${currentPageData.id}`, error);
    } finally {
      completeSavingOperation();
    }
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle layout changes
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;
    
    console.log(`usePageActions: handleLayoutChange called for page ${currentPageData.id}`);
    trackSavingOperation();
    
    updatePage({ ...currentPageData, layout })
      .then(() => {
        console.log(`usePageActions: updatePage successful for layout change on page ${currentPageData.id}`);
        toast.success(`Layout changed to ${layout}`);
      })
      .catch(error => {
        console.error(`usePageActions: updatePage failed for layout change on page ${currentPageData.id}`, error);
        toast.error('Failed to update layout');
      })
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    
    console.log(`usePageActions: handleTextFormattingChange called for page ${currentPageData.id}`);
    const updatedTextFormatting = { 
      ...(currentPageData.textFormatting || {}), 
      [key]: value 
    };
    
    trackSavingOperation();
    updatePage({ ...currentPageData, textFormatting: updatedTextFormatting })
      .then(() => console.log(`usePageActions: updatePage successful for formatting change on page ${currentPageData.id}`))
      .catch(error => {
        console.error(`usePageActions: updatePage failed for formatting change on page ${currentPageData.id}`, error);
        toast.error('Failed to update text formatting');
      })
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle image settings changes with debounce
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return;

    console.log(`usePageActions: handleImageSettingsChange called for page ${currentPageData.id}. Debouncing updatePage.`);

    // Clear any previously scheduled save
    if (imageSettingsTimeoutRef.current) {
      clearTimeout(imageSettingsTimeoutRef.current);
      console.log("usePageActions: Cleared previous image settings timeout.");
    } else {
      // Only track saving when starting a brand new debounce sequence
      if (!isImageSaveDebouncing.current) {
        console.log("usePageActions: Starting new image save sequence, tracking operation.");
        trackSavingOperation();
        isImageSaveDebouncing.current = true;
      }
    }

    imageSettingsTimeoutRef.current = setTimeout(async () => {
      console.log(`usePageActions: Debounced timeout fired. Calling updatePage for page ${currentPageData.id}`);
      
      if (!currentPageData) {
        console.warn("usePageActions: currentPageData became null during debounce, skipping save.");
        if (isImageSaveDebouncing.current) {
          completeSavingOperation();
          isImageSaveDebouncing.current = false;
        }
        imageSettingsTimeoutRef.current = null;
        return;
      }
      
      const updatedPage = {
        ...currentPageData,
        imageSettings: settings
      };

      try {
        await updatePage(updatedPage);
        console.log(`usePageActions: updatePage successful for page ${currentPageData.id}`);
      } catch (error) {
        console.error(`usePageActions: updatePage failed for page ${currentPageData.id}`, error);
      } finally {
        imageSettingsTimeoutRef.current = null;
        if (isImageSaveDebouncing.current) {
          console.log("usePageActions: Completing image save sequence.");
          completeSavingOperation();
          isImageSaveDebouncing.current = false;
        }
      }
    }, 300);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (textChangeTimeoutRef.current) {
        clearTimeout(textChangeTimeoutRef.current);
      }
      
      if (imageSettingsTimeoutRef.current) {
        clearTimeout(imageSettingsTimeoutRef.current);
        if (isImageSaveDebouncing.current) {
          console.log("usePageActions: Cleanup clearing pending image save.");
          completeSavingOperation();
          isImageSaveDebouncing.current = false;
        }
      }
    };
  }, [completeSavingOperation]);

  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  };
}
