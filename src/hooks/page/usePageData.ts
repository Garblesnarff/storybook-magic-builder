
import { useMemo } from 'react';
import { Book, BookPage } from '@/types/book';

/**
 * Hook to derive the current page data directly from the current book and selected page ID.
 * It does not maintain its own state but calculates the data on each render based on props.
 */
export function usePageData(currentBook: Book | null, selectedPageId: string | undefined) {
  
  const currentPageData = useMemo(() => {
    if (!currentBook || !selectedPageId) {
      return null;
    }
    const page = currentBook.pages.find((p: BookPage) => p.id === selectedPageId);
    
    // Return the found page or null if not found
    // No cloning needed here as the source of truth is the context state
    return page || null; 
    
  }, [currentBook, selectedPageId]);

  // We need to return a setCurrentPageData function to match the expected interface
  // This is a dummy function that will be overridden by the real implementation later
  const setCurrentPageData = (_page: BookPage | null) => {
    console.log("setCurrentPageData called, but this is a no-op in usePageData");
    // This is intentionally empty as the actual state updates happen via the context
  };

  return {
    currentPageData,
    setCurrentPageData
  };
}
