
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

  // Note: We no longer return setCurrentPageData as this hook doesn't manage state directly.
  // State updates should happen via the context's updatePage function.
  return {
    currentPageData
  };
}
