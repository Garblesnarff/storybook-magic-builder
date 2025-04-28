
import { useCallback } from 'react';
import { BookPage, PageLayout } from '@/types/book';
import { toast } from 'sonner';

export function useLayoutManager(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  // Handle layout changes
  const handleLayoutChange = useCallback((layout: PageLayout) => {
    if (!currentPageData) return;
    
    // Don't update if the layout is the same to prevent unnecessary saves
    if (currentPageData.layout === layout) {
      console.log('Layout unchanged, skipping update');
      return;
    }
    
    console.log(`useLayoutManager: handleLayoutChange called for page ${currentPageData.id} to layout ${layout}`);
    
    // Make a deep copy to avoid reference issues and preserve all other settings
    const updatedPage = JSON.parse(JSON.stringify(currentPageData));
    updatedPage.layout = layout;
    
    updatePage(updatedPage)
      .then(() => {
        console.log(`useLayoutManager: updatePage successful for layout change on page ${currentPageData.id}`);
        toast.success(`Layout changed to ${layout}`);
      })
      .catch(error => {
        console.error(`useLayoutManager: updatePage failed for layout change on page ${currentPageData.id}`, error);
        toast.error('Failed to update layout');
      });
  }, [currentPageData, updatePage]);

  return {
    handleLayoutChange
  };
}
