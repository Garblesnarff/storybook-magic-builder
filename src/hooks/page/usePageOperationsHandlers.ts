
import React, { useState } from 'react'; // Add missing React import
import { toast } from 'sonner';
import { Book } from '@/types/book';
import { useSavingState } from './useSavingState';

export function usePageOperationsHandlers(
  currentBook: Book | null,
  selectedPageId: string | undefined,
  addPage: () => Promise<string | undefined>, // Expect addPage to return the new ID
  duplicatePage: (id: string) => Promise<string | undefined>,
  deletePage: (id: string) => Promise<void>,
  reorderPage: (id: string, newPosition: number) => Promise<void>,
  setSelectedPageId: (id: string | undefined) => void
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Modify handleAddPage to be async and return the new page ID
  const handleAddPage = async (): Promise<string | undefined> => {
    try {
      const newPageId = await addPage(); // Await the context function
      if (newPageId) {
        toast.success('New page added');
        return newPageId; // Return the ID
      } else {
        toast.error('Failed to add new page');
        return undefined;
      }
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add new page');
      return undefined;
    }
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
      trackSavingOperation();
      await deletePage(pageId);
      
      // After deleting, select the first page or the previous page
      if (pageId === selectedPageId && currentBook.pages.length > 0) {
        const deletedPageIndex = currentBook.pages.findIndex(page => page.id === pageId);
        const newSelectedPageIndex = Math.max(0, deletedPageIndex - 1);
        setSelectedPageId(currentBook.pages[newSelectedPageIndex]?.id);
      }
      
      toast.success('Page deleted');
      completeSavingOperation();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
      completeSavingOperation();
    }
  };

  const handleReorderPage = (sourceIndex: number, destinationIndex: number) => {
    if (!currentBook) return;
    
    // Get the actual page from the visiblePages array
    const pageToMove = currentBook.pages[sourceIndex];
    
    if (pageToMove) {
      trackSavingOperation();
      reorderPage(pageToMove.id, destinationIndex)
        .then(() => completeSavingOperation())
        .catch(() => completeSavingOperation());
    }
  };

  return {
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleReorderPage
  };
}
