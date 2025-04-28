
import { useState, useEffect } from 'react';
import { Book, BookPage } from '@/types/book';

export function usePageData(currentBook: Book | null, selectedPageId: string | undefined) {
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Update currentPageData when selectedPageId or book updates
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      console.log('Current page found:', page?.id, 'with image:', page?.image?.substring(0, 50));
      setCurrentPageData(page || null);
    } else {
      setCurrentPageData(null);
    }
  }, [currentBook, selectedPageId]);

  return {
    currentPageData
  };
}
