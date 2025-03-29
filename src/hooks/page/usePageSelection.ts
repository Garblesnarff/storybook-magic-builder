
import { useState, useEffect } from 'react';
import { Book } from '@/types/book';

export function usePageSelection(currentBook: Book | null, books: Book[]) {
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  
  // Load the book when the component mounts or the book ID changes
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
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
