
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Book } from '@/types/book';
import { useSavingState } from './useSavingState';

export function usePageOperationsHandlers(
  currentBook: Book | null,
  selectedPageId: string | undefined,
  addPage: () => Promise<string | undefined>,
  duplicatePage: (id: string) => Promise<string | undefined>,
  deletePage: (id: string) => Promise<void>,
  reorderPage: (id: string, newPosition: number) => Promise<void>,
  setSelectedPageId: (id: string | undefined) => void
) {
  const { isSaving, setSaving, trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Handle adding a new page
  const handleAddPage = useCallback(async (): Promise<string | undefined> => {
    try {
      trackSavingOperation();
      const newPageId = await addPage();
      if (newPageId) {
        toast.success('New page added');
        return newPageId;
      } else {
        toast.error('Failed to add new page');
        return undefined;
      }
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add new page');
      return undefined;
    } finally {
      completeSavingOperation();
    }
  }, [addPage, trackSavingOperation, completeSavingOperation]);

  // Handle duplicating a page
  const handleDuplicatePage = useCallback(async (pageId: string): Promise<void> => {
    try {
      trackSavingOperation();
      const newPageId = await duplicatePage(pageId);
      if (newPageId) {
        setSelectedPageId(newPageId);
        toast.success('Page duplicated');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
    } finally {
      completeSavingOperation();
    }
  }, [duplicatePage, setSelectedPageId, trackSavingOperation, completeSavingOperation]);

  // Handle deleting a page
  const handleDeletePage = useCallback(async (pageId: string): Promise<void> => {
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
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    } finally {
      completeSavingOperation();
    }
  }, [currentBook, selectedPageId, deletePage, setSelectedPageId, trackSavingOperation, completeSavingOperation]);

  // Handle reordering pages
  const handleReorderPage = useCallback(async (pageId: string, newPosition: number): Promise<void> => {
    if (!currentBook) return;
    
    try {
      trackSavingOperation();
      await reorderPage(pageId, newPosition);
    } catch (error) {
      console.error('Error reordering page:', error);
      toast.error('Failed to reorder page');
    } finally {
      completeSavingOperation();
    }
  }, [currentBook, reorderPage, trackSavingOperation, completeSavingOperation]);

  return {
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleReorderPage
  };
}
