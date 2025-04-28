
import { useCallback, useRef } from 'react';
import { BookPage } from '@/types/book';
import { useSavingState } from './useSavingState';

export function useTextEditor(
  updatePage: (page: BookPage) => Promise<void>
) {
  const { setSaving } = useSavingState();
  const textDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle text changes with debounce
  const handleTextChange = useCallback(async (text: string) => {
    // This function will be called with the currentPageData from usePageState hook
    const currentPageData = arguments[1] as BookPage | null;
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
    setSaving(true);
    
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
        setSaving(false);
        textDebounceRef.current = null;
      }
    }, 800);
  }, [updatePage, setSaving]);

  return {
    handleTextChange
  };
}
