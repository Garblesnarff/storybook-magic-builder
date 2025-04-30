
import { useCallback, useRef } from 'react';
import { BookPage, TextFormatting } from '@/types/book';
import { useSavingState } from './useSavingState';

export function useTextEditor(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  const textDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextFormatting = useRef<TextFormatting | null>(null);
  
  // Handle text changes with debounce
  const handleTextChange = useCallback(async (text: string) => {
    if (!currentPageData) return;
    
    // Skip update if text hasn't changed
    if (currentPageData.text === text) {
      return;
    }
    
    console.log(`useTextEditor: handleTextChange called for page ${currentPageData.id}`);
    
    // Clear any previous timeout
    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
    }
    
    // Start tracking the save operation
    trackSavingOperation();
    
    // Create a deep copy to avoid reference issues
    const updatedPage = JSON.parse(JSON.stringify(currentPageData));
    updatedPage.text = text;
    
    // Debounce for typing
    textDebounceRef.current = setTimeout(async () => {
      try {
        await updatePage(updatedPage);
        console.log(`useTextEditor: updatePage successful for text change on page ${currentPageData.id}`);
      } catch (error) {
        console.error(`useTextEditor: updatePage failed for text change on page ${currentPageData.id}`, error);
      } finally {
        completeSavingOperation();
        textDebounceRef.current = null;
      }
    }, 800);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    
    // Initialize last formatting reference if needed
    if (!lastTextFormatting.current && currentPageData.textFormatting) {
      lastTextFormatting.current = JSON.parse(JSON.stringify(currentPageData.textFormatting));
    }
    
    // Skip update if value hasn't changed
    if (lastTextFormatting.current && lastTextFormatting.current[key] === value) {
      console.log(`useTextEditor: ${key} unchanged, skipping update`);
      return;
    }
    
    console.log(`useTextEditor: handleTextFormattingChange called for page ${currentPageData.id}, key: ${key}, value: ${value}`);
    
    // Make a deep copy of current formatting or create a new object
    const updatedTextFormatting = currentPageData.textFormatting 
      ? { ...JSON.parse(JSON.stringify(currentPageData.textFormatting)), [key]: value } 
      : { [key]: value };
    
    // Store the latest formatting for comparison
    lastTextFormatting.current = { ...updatedTextFormatting };
    
    // Create a deep copy of the page to avoid reference issues
    const updatedPage = JSON.parse(JSON.stringify(currentPageData));
    updatedPage.textFormatting = updatedTextFormatting;
    
    trackSavingOperation();
    updatePage(updatedPage)
      .then(() => console.log(`useTextEditor: updatePage successful for formatting change on page ${currentPageData.id}`))
      .catch(error => {
        console.error(`useTextEditor: updatePage failed for formatting change on page ${currentPageData.id}`, error);
      })
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  return {
    handleTextChange,
    handleTextFormattingChange
  };
}
