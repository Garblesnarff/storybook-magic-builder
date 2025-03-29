
import { BookPage, PageLayout, ImageSettings, TextFormatting } from '@/types/book';
import { toast } from 'sonner';
import { useSavingState } from './useSavingState';

export function usePageActions(
  currentBook: any,
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    // Always update the page, even with empty text
    console.log('Updating page text to:', value);
    
    trackSavingOperation();
    
    // Create updated page object
    const updatedPage = { ...currentPageData, text: value };
    
    // Update local state first
    setCurrentPageData(updatedPage);
    
    // Then save to backend
    updatePage(updatedPage)
      .then(() => completeSavingOperation())
      .catch(() => completeSavingOperation());
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

  const handleTextFormattingChange = (key: keyof TextFormatting, value: any) => {
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
