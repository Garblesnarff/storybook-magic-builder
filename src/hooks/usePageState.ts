
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
  const [localText, setLocalText] = useState<string>('');
  const [textChangesPending, setTextChangesPending] = useState(false);
  
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
        setLocalText(page.text || '');
        setTextChangesPending(false);
      } else {
        console.log('Selected page not found in current book');
      }
    }
  }, [selectedPageId, currentBook]);

  // Save pending text changes when navigating away
  useEffect(() => {
    return () => {
      if (textChangesPending && currentPageData) {
        saveTextChanges(localText);
      }
      
      if (textUpdateTimeoutRef.current) {
        clearTimeout(textUpdateTimeoutRef.current);
      }
    };
  }, [textChangesPending, currentPageData, localText]);

  const handlePageSelect = (pageId: string) => {
    // Save any pending changes before switching pages
    if (textChangesPending && currentPageData) {
      saveTextChanges(localText);
    }
    
    setSelectedPageId(pageId);
  };
  
  const handleAddPage = () => {
    // Save any pending changes before adding a new page
    if (textChangesPending && currentPageData) {
      saveTextChanges(localText);
    }
    
    addPage();
    toast.success('New page added');
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      // Save any pending changes before duplicating a page
      if (textChangesPending && currentPageData) {
        saveTextChanges(localText);
      }
      
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

  // This function only updates the local state without triggering a save
  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Update local text state immediately for smooth typing experience
    setLocalText(value);
    
    // Mark that we have unsaved changes
    setTextChangesPending(true);
    
    // Update the current page data for rendering
    setCurrentPageData(prevState => {
      if (!prevState) return null;
      return { ...prevState, text: value };
    });
    
    // Clear any existing timeout
    if (textUpdateTimeoutRef.current) {
      clearTimeout(textUpdateTimeoutRef.current);
    }
    
    // Set a new timeout to save changes after user stops typing
    textUpdateTimeoutRef.current = setTimeout(() => {
      saveTextChanges(value);
      textUpdateTimeoutRef.current = null;
    }, 2000); // Increased timeout to 2000ms to give user more time to type
  };

  // This function actually saves the text changes to the server
  const saveTextChanges = (text: string) => {
    if (!currentPageData) return;
    
    console.log('Saving text changes:', text);
    setIsSaving(true);
    
    const updatedPage = { ...currentPageData, text: text };
    updatePage(updatedPage);
    
    setTextChangesPending(false);
    
    // Show saved indicator briefly after saving
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleLayoutChange = (value: any) => {
    if (!currentPageData) return;
    
    // Save any pending text changes first
    if (textChangesPending) {
      saveTextChanges(localText);
    }
    
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
    
    // Save any pending text changes first
    if (textChangesPending) {
      saveTextChanges(localText);
    }
    
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
    
    // Save any pending text changes first
    if (textChangesPending && currentPageData) {
      saveTextChanges(localText);
    }
    
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
