
import { useState, useEffect, useCallback } from 'react';
import { Book, BookPage } from '@/types/book';
import { useBook } from '@/contexts/BookContext';

export function usePageData(currentBook: Book | null, selectedPageId: string | undefined) {
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  const { updateBook } = useBook();
  
  // Update currentPageData when selectedPageId or book updates
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      setCurrentPageData(page || null);
    } else {
      setCurrentPageData(null);
    }
  }, [currentBook, selectedPageId]);

  // Enhanced setCurrentPageData that also updates the book
  const updateCurrentPageData = useCallback(async (newPageData: BookPage) => {
    if (!currentBook) return;

    // Update local state immediately for responsiveness
    setCurrentPageData(newPageData);

    // Update the book's pages with the new page data
    const updatedPages = currentBook.pages.map(page => 
      page.id === newPageData.id ? {
        ...newPageData,
        updatedAt: new Date().toISOString() // Add timestamp to force re-render
      } : page
    );

    const updatedBook = {
      ...currentBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };

    // Update the book context to refresh all components
    await updateBook(updatedBook);
  }, [currentBook, updateBook]);

  return {
    currentPageData,
    setCurrentPageData: updateCurrentPageData
  };
}
