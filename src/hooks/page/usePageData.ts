
import { useState, useEffect } from 'react';
import { BookPage } from '@/types/book';

export function usePageData(currentBook: any, selectedPageId: string | undefined) {
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Update the current page data when the selected page changes
  useEffect(() => {
    if (currentBook && selectedPageId) {
      console.log('Updating current page data for page ID:', selectedPageId);
      const page = currentBook.pages.find((page: BookPage) => page.id === selectedPageId);
      if (page) {
        // Deep clone to avoid reference issues
        setCurrentPageData(JSON.parse(JSON.stringify(page)));
      } else {
        console.log('Selected page not found in current book');
      }
    }
  }, [selectedPageId, currentBook]);

  return {
    currentPageData,
    setCurrentPageData
  };
}
