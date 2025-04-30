
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
      console.log('Current page found:', page?.id, 'with image:', page?.image?.substring(0, 50));
      setCurrentPageData(page || null);
    } else {
      setCurrentPageData(null);
    }
  }, [currentBook, selectedPageId]);

  // Enhanced setCurrentPageData that also updates the book
  const updateCurrentPageData = useCallback(async (newPageData: BookPage) => {
    if (!currentBook) return;

    console.log('Updating page data:', newPageData.id, 'with image:', newPageData.image?.substring(0, 50));

    // Add timestamp to force re-render and cache busting
    const timestamp = Date.now();
    const updatedPageData = {
      ...newPageData,
      imageTimestamp: timestamp, // Add timestamp for tracking image changes
      updatedAt: new Date().toISOString()
    };

    // Update local state immediately for responsiveness
    setCurrentPageData(updatedPageData);

    // Update the book's pages with the new page data
    const updatedPages = currentBook.pages.map(page => 
      page.id === updatedPageData.id ? updatedPageData : page
    );

    const updatedBook = {
      ...currentBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };

    console.log('Updating book with new page data');
    
    // Update the book context to refresh all components
    await updateBook(updatedBook);
  }, [currentBook, updateBook]);

  return {
    currentPageData,
    setCurrentPageData: updateCurrentPageData
  };
}
