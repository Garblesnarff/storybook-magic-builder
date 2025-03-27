import { useState, useEffect } from 'react';
import { BookPage } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';

export function usePageState(bookId: string | undefined) {
  // Ensure context is available before using it
  const bookContext = useBook();
  const { 
    books, 
    loadBook, 
    currentBook, 
    addPage, 
    updatePage, 
    deletePage, 
    duplicatePage, 
    reorderPage 
  } = bookContext;

  console.log('usePageState: initializing with bookId:', bookId);
  console.log('usePageState: books available:', books.length);
  if (currentBook) {
    console.log('usePageState: current book:', currentBook.title);
  }
  
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  // Load the book when the component mounts or the book ID changes
  useEffect(() => {
    if (bookId && books.length > 0) {
      console.log('Attempting to load book with ID:', bookId);
      const bookExists = books.some(book => book.id === bookId);
      if (bookExists) {
        console.log('Book found, loading...');
        loadBook(bookId);
      } else {
        console.log('Book not found in available books');
      }
    }
  }, [bookId, books, loadBook]);
  
  // Select the first page when the book loads or changes
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
      console.log('Selecting first page in current book');
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook, selectedPageId]);
  
  // Update the current page data when the selected page changes
  useEffect(() => {
    if (currentBook && selectedPageId) {
      console.log('Updating current page data for page ID:', selectedPageId);
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      if (page) {
        setCurrentPageData({ ...page });
      } else {
        console.log('Selected page not found in current book');
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
