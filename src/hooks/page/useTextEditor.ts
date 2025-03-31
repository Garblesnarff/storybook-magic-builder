
import { useCallback } from 'react';
import { BookPage, TextFormatting } from '@/types/book';
import { useSavingState } from './useSavingState';

export function useTextEditor(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { trackSavingOperation, completeSavingOperation } = useSavingState();
  
  // Handle text changes
  const handleTextChange = useCallback(async (text: string) => {
    if (!currentPageData) return;
    
    console.log(`useTextEditor: handleTextChange called for page ${currentPageData.id}`);
    trackSavingOperation();
    
    try {
      await updatePage({ ...currentPageData, text });
      console.log(`useTextEditor: updatePage successful for text change on page ${currentPageData.id}`);
    } catch (error) {
      console.error(`useTextEditor: updatePage failed for text change on page ${currentPageData.id}`, error);
    } finally {
      completeSavingOperation();
    }
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  // Handle text formatting changes
  const handleTextFormattingChange = useCallback((key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    
    console.log(`useTextEditor: handleTextFormattingChange called for page ${currentPageData.id}`);
    const updatedTextFormatting = { 
      ...(currentPageData.textFormatting || {}), 
      [key]: value 
    };
    
    trackSavingOperation();
    updatePage({ ...currentPageData, textFormatting: updatedTextFormatting })
      .then(() => console.log(`useTextEditor: updatePage successful for formatting change on page ${currentPageData.id}`))
      .catch(error => {
        console.error(`useTextEditor: updatePage failed for formatting change on page ${currentPageData.id}`, error);
      })
      .finally(completeSavingOperation);
  }, [currentPageData, updatePage, trackSavingOperation, completeSavingOperation]);

  return {
    handleTextChange,
    handleTextFormattingChange
  };
}
