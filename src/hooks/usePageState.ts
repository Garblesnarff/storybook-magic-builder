
import { useState, useEffect, useCallback } from 'react';
import { Book, BookPage, PageLayout, TextFormatting, ImageSettings } from '@/types/book';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';

export const usePageState = (bookId?: string) => {
  // Use the book context
  const {
    books,
    currentBook,
    loadBook,
    updateBook,
    addPage,
    updatePage,
    deletePage,
    duplicatePage,
    reorderPage,
    loading,
    error
  } = useBook();
  
  // Local state
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load the book and select the first page when component mounts
  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Only fetch if we have a book id and it's not the current book
        if (bookId && (!currentBook || currentBook.id !== bookId)) {
          await loadBook(bookId);
        }
      } catch (error) {
        console.error('Failed to load book:', error);
        toast.error('Failed to load book');
      }
    };
    
    fetchBook();
  }, [bookId, currentBook, loadBook]);
  
  // Select the first page when book changes or there's no selected page
  useEffect(() => {
    if (currentBook?.pages.length && (!selectedPageId || !currentBook.pages.find(page => page.id === selectedPageId))) {
      // Select the first page when the book loads or when the selected page doesn't exist
      setSelectedPageId(currentBook.pages[0].id);
    }
  }, [currentBook, selectedPageId]);
  
  // Update currentPageData when selectedPageId changes or book updates
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      setCurrentPageData(page || null);
    } else {
      setCurrentPageData(null);
    }
  }, [currentBook, selectedPageId]);
  
  // Handle page selection
  const handlePageSelect = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
  }, []);
  
  // Handle adding a new page
  const handleAddPage = useCallback(async (): Promise<string | undefined> => {
    try {
      setIsSaving(true);
      return await addPage();
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add page');
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }, [addPage]);
  
  // Handle duplicating a page
  const handleDuplicatePage = useCallback(async (pageId: string) => {
    try {
      setIsSaving(true);
      const newPageId = await duplicatePage(pageId);
      if (newPageId) {
        setSelectedPageId(newPageId);
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
    } finally {
      setIsSaving(false);
    }
  }, [duplicatePage]);
  
  // Handle updating text content
  const handleTextChange = useCallback(async (text: string) => {
    if (currentPageData) {
      const updatedPage = { ...currentPageData, text };
      setCurrentPageData(updatedPage);
      
      try {
        setIsSaving(true);
        await updatePage(updatedPage);
      } catch (error) {
        console.error('Error updating page text:', error);
        // Don't show a toast for every text change error
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentPageData, updatePage]);
  
  // Handle updating layout
  const handleLayoutChange = useCallback(async (layout: PageLayout) => {
    if (currentPageData) {
      const updatedPage = { ...currentPageData, layout };
      setCurrentPageData(updatedPage);
      
      try {
        setIsSaving(true);
        await updatePage(updatedPage);
        toast.success(`Layout changed to ${layout}`);
      } catch (error) {
        console.error('Error updating page layout:', error);
        toast.error('Failed to update layout');
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentPageData, updatePage]);
  
  // Handle updating text formatting
  const handleTextFormattingChange = useCallback(async (textFormatting: Partial<TextFormatting>) => {
    if (currentPageData) {
      const updatedPage = {
        ...currentPageData,
        textFormatting: {
          ...(currentPageData.textFormatting || {}),
          ...textFormatting
        }
      };
      setCurrentPageData(updatedPage);
      
      try {
        setIsSaving(true);
        await updatePage(updatedPage);
      } catch (error) {
        console.error('Error updating text formatting:', error);
        toast.error('Failed to update text formatting');
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentPageData, updatePage]);
  
  // Handle updating image settings
  const handleImageSettingsChange = useCallback(async (imageSettings: Partial<ImageSettings>) => {
    if (currentPageData) {
      const updatedPage = {
        ...currentPageData,
        imageSettings: {
          ...(currentPageData.imageSettings || {}),
          ...imageSettings
        }
      };
      setCurrentPageData(updatedPage);
      
      try {
        setIsSaving(true);
        await updatePage(updatedPage);
      } catch (error) {
        console.error('Error updating image settings:', error);
        toast.error('Failed to update image settings');
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentPageData, updatePage]);
  
  // Handle deleting a page
  const handleDeletePage = useCallback(async (pageId: string) => {
    try {
      setIsSaving(true);
      await deletePage(pageId);
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    } finally {
      setIsSaving(false);
    }
  }, [deletePage]);
  
  // Handle reordering pages
  const handleReorderPage = useCallback(async (pageId: string, newPosition: number) => {
    try {
      setIsSaving(true);
      await reorderPage(pageId, newPosition);
    } catch (error) {
      console.error('Error reordering page:', error);
      toast.error('Failed to reorder page');
    } finally {
      setIsSaving(false);
    }
  }, [reorderPage]);
  
  // Handle updating the book title
  const updateBookTitle = useCallback(async (newTitle: string) => {
    if (currentBook) {
      try {
        setIsSaving(true);
        const updatedBook = { ...currentBook, title: newTitle };
        await updateBook(updatedBook);
        return true;
      } catch (error) {
        console.error('Error updating book title:', error);
        toast.error('Failed to update book title');
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return false;
  }, [currentBook, updateBook]);
  
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
    handleImageSettingsChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage,
    handleDeletePage,
    loading,
    error,
    updateBookTitle
  };
};
