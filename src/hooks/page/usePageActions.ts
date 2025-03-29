
import { BookPage, PageLayout, ImageSettings } from '@/types/book';
import { toast } from 'sonner';
import { useSavingState } from './useSavingState';

export function usePageActions(
  currentBook: any,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Always update the page, even with empty text
    console.log('Updating page text to:', value);
    
    trackSavingOperation();
    
    // Update local state and save to backend
    setCurrentPageData(prevState => {
      if (!prevState) return null;
      const updatedPage = { ...prevState, text: value };
      
      // Save the changes to the database
      updatePage(updatedPage)
        .then(() => completeSavingOperation())
        .catch(() => completeSavingOperation());
        
      return updatedPage;
    });
  };

  // Function for layout changes
  const handleLayoutChange = (value: PageLayout) => {
    if (!currentPageData) return;
    
    trackSavingOperation();
    const updatedPage = { ...currentPageData, layout: value };
    setCurrentPageData(updatedPage);
    
    updatePage(updatedPage)
      .then(() => completeSavingOperation())
      .catch(() => completeSavingOperation());
  };

  const handleTextFormattingChange = (key: any, value: any) => {
    if (!currentPageData) return;
    
    trackSavingOperation();
    const updatedFormatting = { 
      ...currentPageData.textFormatting,
      [key]: value 
    };
    const updatedPage = { 
      ...currentPageData, 
      textFormatting: updatedFormatting 
    };
    setCurrentPageData(updatedPage);
    
    updatePage(updatedPage)
      .then(() => completeSavingOperation())
      .catch(() => completeSavingOperation());
  };

  // Function to handle image settings changes
  const handleImageSettingsChange = (settings: ImageSettings) => {
    if (!currentPageData) return;
    
    console.log('Saving image settings:', settings);
    trackSavingOperation();
    
    // Create a deep clone of the current page data to prevent reference issues
    const updatedPage = JSON.parse(JSON.stringify(currentPageData));
    updatedPage.imageSettings = settings;
    
    setCurrentPageData(updatedPage);
    updatePage(updatedPage)
      .then(() => completeSavingOperation())
      .catch(() => completeSavingOperation());
  };

  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  };
}
