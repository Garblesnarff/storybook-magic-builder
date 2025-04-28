
import { useState, useEffect } from 'react';
import { Book } from '@/types/book';

export function usePageSelection(currentBook: Book | null) {
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  
  // Select the first page when book changes or there's no selected page
  useEffect(() => {
    if (currentBook?.pages.length && (!selectedPageId || !currentBook.pages.find(page => page.id === selectedPageId))) {
      console.log('Selecting first page in current book');
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook, selectedPageId]);

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  return {
    selectedPageId,
    setSelectedPageId,
    handlePageSelect
  };
}
