// src/hooks/page/usePageActions.ts
import { useRef, useCallback, useEffect } from 'react';
import { BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book'; // Corrected import path
import { useSavingState } from './useSavingState'; // Ensure this import is present

export function usePageActions(
  currentBook: any, // Or specific Book type
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  const textChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isImageSaveDebouncing = useRef(false); // Tracks if a save is currently debouncing

  // Handle text changes - This is now primarily handled by TextSettings onBlur/unmount
  const handleTextChange = useCallback(async (value: string) => {
    if (!currentPageData) return;
    console.log(`usePageActions: handleTextChange called for page ${currentPageData.id}`);
    // The actual save logic is here, called by TextSettings
    trackSavingOperation();
    try {
      await updatePage({ ...currentPageData, text: value });
      console.log(`usePageActions: updatePage successful for text change on page ${currentPageData.id}`);
    } catch (error) {
      console.error(`usePageActions: updatePage failed for text change on page ${currentPageData.id}`, error);
    } finally {
      completeSavingOperation();
    }
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle layout changes - Save immediately
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;
    console.log(`usePageActions: handleLayoutChange called for page ${currentPageData.id}`);
    trackSavingOperation();
    updatePage({ ...currentPageData, layout })
      .then(() => console.log(`usePageActions: updatePage successful for layout change on page ${currentPageData.id}`))
      .catch(error => console.error(`usePageActions: updatePage failed for layout change on page ${currentPageData.id}`, error))
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes - Save immediately
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    console.log(`usePageActions: handleTextFormattingChange called for page ${currentPageData.id}`);
    const updatedTextFormatting = { ...currentPageData.textFormatting, [key]: value };
    trackSavingOperation();
    updatePage({ ...currentPageData, textFormatting: updatedTextFormatting })
      .then(() => console.log(`usePageActions: updatePage successful for formatting change on page ${currentPageData.id}`))
      .catch(error => console.error(`usePageActions: updatePage failed for formatting change on page ${currentPageData.id}`, error))
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);


  // --- Ensure this function has the setTimeout ---
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (!currentPageData) return;

    console.log(`usePageActions: handleImageSettingsChange called for page ${currentPageData.id}. Debouncing updatePage.`);

    // Clear any previously scheduled (but not yet executed) save
    if (imageSettingsTimeoutRef.current) {
      clearTimeout(imageSettingsTimeoutRef.current);
      console.log("usePageActions: Cleared previous image settings timeout.");
      // Keep isImageSaveDebouncing true as we are setting a new timeout
    } else {
      // Only track saving when starting a brand new debounce sequence
      if (!isImageSaveDebouncing.current) {
        console.log("usePageActions: Starting new image save sequence, tracking operation.");
        trackSavingOperation(); // Show saving indicator
        isImageSaveDebouncing.current = true; // Mark that a save is pending/debouncing
      }
    }

    // *** THIS setTimeout IS CRITICAL ***
    imageSettingsTimeoutRef.current = setTimeout(async () => {
      console.log(`usePageActions: Debounced timeout fired. Calling updatePage for page ${currentPageData.id}`);
      // Ensure we use the latest currentPageData from the closure, but apply the new settings
       if (!currentPageData) { // Re-check currentPageData in case it changed during debounce
          console.warn("usePageActions: currentPageData became null during debounce, skipping save.");
          if (isImageSaveDebouncing.current) {
              completeSavingOperation();
              isImageSaveDebouncing.current = false;
          }
          imageSettingsTimeoutRef.current = null;
          return;
       }
      const updatedPage = {
        ...currentPageData, // Use the currentPageData available when the callback was created
        imageSettings: settings // Use the latest settings passed to the handler
      };

      try {
        await updatePage(updatedPage); // The actual save call
        console.log(`usePageActions: updatePage successful for page ${currentPageData.id}`);
      } catch (error) {
        console.error(`usePageActions: updatePage failed for page ${currentPageData.id}`, error);
      } finally {
        // Reset timeout ref and flag *after* save attempt
        imageSettingsTimeoutRef.current = null;
        if (isImageSaveDebouncing.current) {
           console.log("usePageActions: Completing image save sequence.");
           completeSavingOperation(); // Hide saving indicator (after its delay)
           isImageSaveDebouncing.current = false; // Reset the flag
        }
      }
    }, 300); // Debounce delay (e.g., 300ms)
    // *** END of setTimeout ***

  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);
  // --- End of handleImageSettingsChange ---

  // --- Cleanup logic ---
   const cleanupTimeouts = useCallback(() => {
     if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);
     if (imageSettingsTimeoutRef.current) {
          clearTimeout(imageSettingsTimeoutRef.current);
          // If we cancel a pending timeout, clean up saving state
          if(isImageSaveDebouncing.current) {
              console.log("usePageActions: Cleanup clearing pending image save.");
              completeSavingOperation();
              isImageSaveDebouncing.current = false;
          }
     }
   }, [completeSavingOperation]); // Add dependency

   useEffect(() => {
     return () => {
       cleanupTimeouts();
     };
   }, [cleanupTimeouts]);
  // --- End Cleanup ---


  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    cleanupTimeouts
  };
}
