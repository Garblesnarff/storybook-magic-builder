
import { useCallback } from 'react';
import { toast } from 'sonner';

export function usePageActions(
  bookId: string | undefined,
  addPage: (bookId: string) => Promise<string | undefined>,
  duplicatePage: (pageId: string) => Promise<string | undefined>,
  deletePage: (pageId: string) => Promise<void>,
  reorderPage: (pageId: string, newPosition: number) => Promise<void>,
  handlePageSelect: (pageId: string) => void
) {
  // Handle adding a page
  const handleAddPage = useCallback(async () => {
    if (!bookId) {
      toast.error("No active book to add page to");
      return;
    }

    try {
      const newPageId = await addPage(bookId);
      if (newPageId) {
        handlePageSelect(newPageId);
        toast.success("New page added");
        return newPageId;
      } else {
        toast.error("Failed to create page");
      }
    } catch (error) {
      console.error("Error adding page:", error);
      toast.error("Failed to add page");
    }
  }, [bookId, addPage, handlePageSelect]);

  // Handle duplicating a page
  const handleDuplicatePage = useCallback(async (pageId: string) => {
    try {
      const newPageId = await duplicatePage(pageId);
      if (newPageId) {
        handlePageSelect(newPageId);
        toast.success("Page duplicated");
      } else {
        toast.error("Failed to duplicate page");
      }
    } catch (error) {
      console.error("Error duplicating page:", error);
      toast.error("Failed to duplicate page");
    }
  }, [duplicatePage, handlePageSelect]);

  // Handle deleting a page
  const handleDeletePage = useCallback(async (pageId: string) => {
    try {
      await deletePage(pageId);
      toast.success("Page deleted");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    }
  }, [deletePage]);

  // Handle reordering pages
  const handleReorderPage = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    try {
      if (bookId) {
        // This will be handled by the parent component which will have access to the currentBook
        // and can extract the pageId from the source index
        await reorderPage(`dummy-id-${sourceIndex}`, destinationIndex);
      }
    } catch (error) {
      console.error("Error reordering pages:", error);
      toast.error("Failed to reorder pages");
    }
  }, [bookId, reorderPage]);

  return {
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleReorderPage
  };
}
