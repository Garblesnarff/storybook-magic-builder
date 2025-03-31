
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePageState } from '@/hooks/usePageState';
import { useAIOperations } from '@/hooks/useAIOperations';
import { useNarration } from '@/hooks/ai/useNarration';
import { Book, BookPage } from '@/types/book';
import { exportBookToPdf, generatePdfFilename } from '@/services/pdfExport';

export function useEditorPage(bookId?: string) {
  const [isExporting, setIsExporting] = useState(false);
  
  const {
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
  } = usePageState(bookId);
  
  // Added narration functionality
  const { isNarrating, generateNarration } = useNarration();
  
  // Handler for generating narration
  const handleGenerateNarration = async () => {
    if (!currentPageData || !currentBook) {
      toast.error("Cannot generate narration without a selected page and text.");
      return;
    }
    if (!currentPageData.text?.trim()) {
      toast.error("Page text is empty, cannot generate narration.");
      return;
    }

    const audioUrl = await generateNarration(currentPageData.text, currentBook.id, currentPageData.id);

    if (audioUrl) {
      // Save the URL to the page data using the existing updatePage function
      const updatedPage = { ...currentPageData, narrationUrl: audioUrl };
      setCurrentPageData(updatedPage); // Optimistic UI update
      try {
        await updatePage(updatedPage); // Persist change
      } catch (e) {
        console.error("Failed to save narration URL:", e);
        toast.error("Failed to save narration link.");
        // Revert optimistic update if needed
        setCurrentPageData({ ...currentPageData, narrationUrl: undefined });
      }
    }
  };
  
  // Modify handleAddPageAsync to correctly await and return the new page ID
  const handleAddPageAsync = async (): Promise<string | undefined> => {
    // handleAddPage now returns Promise<string | undefined>
    const newPageId = await handleAddPage(); 
    return newPageId; // Return the ID received from handleAddPage
  };
  
  useEffect(() => {
    if (currentBook) {
      let dataElement = document.querySelector('[data-book-state]') as HTMLElement;
      if (!dataElement) {
        dataElement = document.createElement('div') as HTMLElement;
        dataElement.setAttribute('data-book-state', '{}');
        dataElement.style.display = 'none';
        document.body.appendChild(dataElement);
      }
      
      dataElement.setAttribute('data-book-state', JSON.stringify(currentBook));
    }
    
    return () => {
      const dataElement = document.querySelector('[data-book-state]') as HTMLElement;
      if (dataElement) {
        document.body.removeChild(dataElement);
      }
    };
  }, [currentBook]);
  
  const {
    isGenerating,
    processingStory,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  } = useAIOperations(currentPageData, updatePage, setCurrentPageData, handleAddPageAsync);

  const handleExportPDF = async () => {
    if (!currentBook) {
      toast.error('No book to export');
      return;
    }
    
    try {
      setIsExporting(true);
      toast.info('Preparing PDF export...');
      
      const pdfBlob = await exportBookToPdf(currentBook);
      const filename = generatePdfFilename(currentBook);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTitleUpdate = async (newTitle: string): Promise<boolean> => {
    if (currentBook && newTitle !== currentBook.title) {
      try {
        await updateBookTitle(newTitle);
        toast.success('Book title updated');
        return true;
      } catch (error) {
        console.error('Error updating book title', error);
        toast.error('Failed to update book title');
        return false;
      }
    }
    return false;
  };

  return {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    isSaving,
    isExporting,
    isGenerating,
    processingStory,
    isNarrating,
    loading,
    error,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    handleReorderPage,
    handleDeletePage,
    handleExportPDF,
    handleApplyAIText,
    handleApplyAIImage,
    handleGenerateImage,
    handleGenerateNarration,
    handleTitleUpdate
  };
}
