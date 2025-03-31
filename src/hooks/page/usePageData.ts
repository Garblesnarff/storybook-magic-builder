
import { useState, useEffect } from 'react';
import { Book, BookPage } from '@/types/book';

/**
 * Hook to manage the current page data based on the selected page ID
 */
export function usePageData(currentBook: Book | null, selectedPageId: string | undefined) {
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Update currentPageData when selectedPageId changes or book updates
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      setCurrentPageData(page || null);
    } else {
      setCurrentPageData(null);
    }
  }, [currentBook, selectedPageId]);

  return {
    currentPageData,
    setCurrentPageData
  };
}
