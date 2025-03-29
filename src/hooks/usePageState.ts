
import { useState, useEffect, useRef } from 'react';
import { BookPage, PageLayout, ImageSettings } from '@/types/book';
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
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Helper function to show saving indicator with controlled timing
  const showSavingIndicator = () => {
    // Clear any existing timeout to prevent flickering
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Show saving indicator
    setIsSaving(true);
    
    // Hide indicator after a short delay
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
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

  // Handle page deletion
  const handleDeletePage = async (pageId: string) => {
    if (!currentBook) return;
    
    try {
      showSavingIndicator();
      await deletePage(pageId);
      
      // After deleting, select the first page or the previous page
      if (pageId === selectedPageId && currentBook.pages.length > 0) {
        const deletedPageIndex = currentBook.pages.findIndex(page => page.id === pageId);
        const newSelectedPageIndex = Math.max(0, deletedPageIndex - 1);
        setSelectedPageId(currentBook.pages[newSelectedPageIndex]?.id);
      }
      
      toast.success('Page deleted');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  // This handler receives debounced text from the TextSettings component
  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Always update the page, even with empty text
    console.log('Updating page text to:', value);
    
    showSavingIndicator();
    
    // Update local state and save to backend
    setCurrentPageData(prevState => {
      if (!prevState) return null;
      const updatedPage = { ...prevState, text: value };
      
      // Save the changes to the database
      updatePage(updatedPage);
      return updatedPage;
    });
  };

  // Function for layout changes
  const handleLayoutChange = (value: PageLayout) => {
    if (!currentPageData) return;
    
    showSavingIndicator();
    const updatedPage = { ...currentPageData, layout: value };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleTextFormattingChange = (key: any, value: any) => {
    if (!currentPageData) return;
    
    showSavingIndicator();
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

  // Function to handle image settings changes
  const handleImageSettingsChange = (settings: ImageSettings) => {
    if (!currentPageData) return;
    
    showSavingIndicator();
    const updatedPage = { 
      ...currentPageData, 
      imageSettings: settings 
    };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleReorderPage = (sourceIndex: number, destinationIndex: number) => {
    if (!currentBook) return;
    
    // Get the actual page from the visiblePages array
    const pageToMove = currentBook.pages[sourceIndex];
    
    if (pageToMove) {
      showSavingIndicator();
      reorderPage(pageToMove.id, destinationIndex);
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
    handleDeletePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage
  };
}
