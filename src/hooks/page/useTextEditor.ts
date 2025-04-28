
import { useCallback, useRef } from 'react';
import { BookPage } from '@/types/book';

export function useTextEditor(
  updatePage: (page: BookPage) => Promise<void>
) {
  const textDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle text changes with debounce
  const handleTextChange = useCallback((text: string, currentPageData: BookPage | null) => {
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
        textDebounceRef.current = null;
      }
    }, 800);
  }, [updatePage]);

  return {
    handleTextChange
  };
}
