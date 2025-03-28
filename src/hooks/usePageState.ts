
import { useState, useEffect, useRef } from 'react';
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
  const textUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (textUpdateTimeoutRef.current) {
        clearTimeout(textUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
  };
  
  const handleAddPage = () => {
    addPage();
    toast.success('New page added');
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const newPageId = await duplicatePage(pageId);
      if (newPageId) {
        setSelectedPageId(newPageId);
        toast.success('Page duplicated');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
    }
  };

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Update local state immediately for smooth typing experience
    const updatedPage = { ...currentPageData, text: value };
    setCurrentPageData(updatedPage);
    
    // Show saving indicator
    setIsSaving(true);
    
    // Clear any existing timeout
    if (textUpdateTimeoutRef.current) {
      clearTimeout(textUpdateTimeoutRef.current);
    }
    
    // Set a new timeout
    textUpdateTimeoutRef.current = setTimeout(() => {
      updatePage(updatedPage);
      // Show saved indicator briefly after saving
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
      textUpdateTimeoutRef.current = null;
    }, 500);
  };

  const handleLayoutChange = (value: any) => {
    if (!currentPageData) return;
    setIsSaving(true);
    const updatedPage = { ...currentPageData, layout: value };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
    // Show saved indicator briefly after saving
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleTextFormattingChange = (key: any, value: any) => {
    if (!currentPageData) return;
    setIsSaving(true);
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
    // Show saved indicator briefly after saving
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleReorderPage = (sourceIndex: number, destinationIndex: number) => {
    if (!currentBook) return;
    
    // Get the actual page from the visiblePages array
    const pageToMove = currentBook.pages[sourceIndex];
    
    if (pageToMove) {
      setIsSaving(true);
      reorderPage(pageToMove.id, destinationIndex);
      // Show saved indicator briefly after saving
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  return {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    isSaving,
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
