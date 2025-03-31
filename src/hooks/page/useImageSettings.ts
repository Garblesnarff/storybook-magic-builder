
import { useCallback, useRef, useEffect } from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { useSavingState } from './useSavingState';

export function useImageSettings(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  const imageSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isImageSaveDebouncing = useRef(false);
  
  // Handle image settings changes with debounce
  const handleImageSettingsChange = useCallback(async (settings: ImageSettings) => {
    if (!currentPageData) return;

    console.log(`useImageSettings: handleImageSettingsChange called for page ${currentPageData.id}. Debouncing updatePage.`);

    // Clear any previously scheduled save
    if (imageSettingsTimeoutRef.current) {
      clearTimeout(imageSettingsTimeoutRef.current);
      console.log("useImageSettings: Cleared previous image settings timeout.");
    } else {
      // Only track saving when starting a brand new debounce sequence
      if (!isImageSaveDebouncing.current) {
        console.log("useImageSettings: Starting new image save sequence, tracking operation.");
        trackSavingOperation();
        isImageSaveDebouncing.current = true;
      }
    }

    imageSettingsTimeoutRef.current = setTimeout(async () => {
      console.log(`useImageSettings: Debounced timeout fired. Calling updatePage for page ${currentPageData.id}`);
      
      if (!currentPageData) {
        console.warn("useImageSettings: currentPageData became null during debounce, skipping save.");
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
        console.log(`useImageSettings: updatePage successful for page ${currentPageData.id}`);
      } catch (error) {
        console.error(`useImageSettings: updatePage failed for page ${currentPageData.id}`, error);
      } finally {
        imageSettingsTimeoutRef.current = null;
        if (isImageSaveDebouncing.current) {
          console.log("useImageSettings: Completing image save sequence.");
          completeSavingOperation();
          isImageSaveDebouncing.current = false;
        }
      }
    }, 300);
    
    // Return a promise that resolves immediately to match the expected Promise<void> return type
    return Promise.resolve();
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (imageSettingsTimeoutRef.current) {
        clearTimeout(imageSettingsTimeoutRef.current);
        if (isImageSaveDebouncing.current) {
          console.log("useImageSettings: Cleanup clearing pending image save.");
          completeSavingOperation();
          isImageSaveDebouncing.current = false;
        }
      }
    };
  }, [completeSavingOperation]);

  return {
    handleImageSettingsChange
  };
}
