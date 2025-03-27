
import { useState, useEffect } from 'react';
import { BookPage } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';

export function usePageState(bookId: string | undefined) {
  const { books, loadBook, currentBook, addPage, updatePage, deletePage, duplicatePage, reorderPage } = useBook();
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Load the book when the component mounts or the book ID changes
  useEffect(() => {
    if (bookId && books.length > 0) {
      const bookExists = books.some(book => book.id === bookId);
      if (bookExists) {
        loadBook(bookId);
      }
    }
  }, [bookId, books, loadBook]);
  
  // Select the first page when the book loads or changes
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook, selectedPageId]);
  
  // Update the current page data when the selected page changes
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      if (page) {
        setCurrentPageData({ ...page });
      }
    }
  }, [selectedPageId, currentBook]);

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
  };
  
  const handleAddPage = () => {
    addPage();
    toast.success('New page added');
  };

  const handleDuplicatePage = (pageId: string) => {
    const newPageId = duplicatePage(pageId);
    if (newPageId) {
      setSelectedPageId(newPageId);
      toast.success('Page duplicated');
    }
  };

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    const updatedPage = { ...currentPageData, text: value };
    setCurrentPageData(updatedPage);
    
    const timeoutId = setTimeout(() => {
      updatePage(updatedPage);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLayoutChange = (value: any) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, layout: value };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleTextFormattingChange = (key: any, value: any) => {
    if (!currentPageData) return;
    const updatedFormatting = { 
      ...currentPageData.textFormatting,
      [key]: value 
    };
    const updatedPage = { 
      ...currentPageData, 
      textFormatting: updatedFormatting 
    };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleReorderPage = (sourceIndex: number, destinationIndex: number) => {
    if (!currentBook) return;
    
    // Get the actual page from the visiblePages array
    const pageToMove = currentBook.pages[sourceIndex];
    
    if (pageToMove) {
      reorderPage(pageToMove.id, destinationIndex);
    }
  };

  return {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage
  };
}
