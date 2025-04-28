
import { useCallback, useRef, useEffect } from 'react';
import { BookPage, ImageSettings } from '@/types/book';

export function useImageSettings(
  updatePage: (page: BookPage) => Promise<void>,
  setSaving: (saving: boolean) => void
) {
  const imageSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isImageSaveDebouncing = useRef(false);
  const lastImageSettings = useRef<ImageSettings | null>(null);
  
  // Handle image settings changes with debounce
  const handleImageSettingsChange = useCallback(async (settings: ImageSettings) => {
    return async (currentPageData: BookPage | null) => {
      if (!currentPageData) return;

      // Skip update if settings haven't changed to prevent unnecessary saves
      const currentSettingsStr = JSON.stringify(settings);
      const lastSettingsStr = JSON.stringify(lastImageSettings.current);
      
      if (currentSettingsStr === lastSettingsStr) {
        console.log("useImageSettings: Settings unchanged, skipping update");
        return;
      }
      
      // Store the latest settings
      lastImageSettings.current = JSON.parse(JSON.stringify(settings));

      console.log(`useImageSettings: handleImageSettingsChange called for page ${currentPageData.id}. Debouncing updatePage.`);

      // Clear any previously scheduled save
      if (imageSettingsTimeoutRef.current) {
        clearTimeout(imageSettingsTimeoutRef.current);
        console.log("useImageSettings: Cleared previous image settings timeout.");
      } else {
        // Only track saving when starting a brand new debounce sequence
        if (!isImageSaveDebouncing.current) {
          console.log("useImageSettings: Starting new image save sequence, tracking operation.");
          setSaving(true);
          isImageSaveDebouncing.current = true;
        }
      }

      // Create a deep copy of the current page data to avoid reference issues
      const pageDataCopy = JSON.parse(JSON.stringify(currentPageData));

      imageSettingsTimeoutRef.current = setTimeout(async () => {
        console.log(`useImageSettings: Debounced timeout fired. Calling updatePage for page ${pageDataCopy.id}`);
        
        if (!pageDataCopy) {
          console.warn("useImageSettings: pageDataCopy is null during debounce, skipping save.");
          if (isImageSaveDebouncing.current) {
            setSaving(false);
            isImageSaveDebouncing.current = false;
          }
          imageSettingsTimeoutRef.current = null;
          return;
        }
        
        // Make sure we don't lose other page data when updating
        const updatedPage = {
          ...pageDataCopy,
          imageSettings: lastImageSettings.current
        };

        try {
          await updatePage(updatedPage);
          console.log(`useImageSettings: updatePage successful for page ${pageDataCopy.id}`);
        } catch (error) {
          console.error(`useImageSettings: updatePage failed for page ${pageDataCopy.id}`, error);
        } finally {
          imageSettingsTimeoutRef.current = null;
          if (isImageSaveDebouncing.current) {
            console.log("useImageSettings: Completing image save sequence.");
            setSaving(false);
            isImageSaveDebouncing.current = false;
          }
        }
      }, 400); // Slightly longer debounce to ensure user is done adjusting
    };
  }, [updatePage, setSaving]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (imageSettingsTimeoutRef.current) {
        clearTimeout(imageSettingsTimeoutRef.current);
        if (isImageSaveDebouncing.current) {
          console.log("useImageSettings: Cleanup clearing pending image save.");
          setSaving(false);
          isImageSaveDebouncing.current = false;
        }
      }
    };
  }, [setSaving]);

  return {
    handleImageSettingsChange
  };
}
