
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PageList } from '@/components/PageList';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePageState } from '@/hooks/usePageState';
import { useAIOperations } from '@/hooks/useAIOperations';
import { useNarration } from '@/hooks/ai/useNarration';
import { exportBookToPdf, generatePdfFilename } from '@/services/pdfExport';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout, ImageSettings } from '@/types/book';

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
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
    handleLayoutChange: handlePageLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange,
    updatePage,
    setCurrentPageData,
    handleReorderPage,
    handleDeletePage,
    updateBookTitle
  } = usePageState(id);
  
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

  const handleLayoutChange = (layout: PageLayout) => {
    handlePageLayoutChange(layout);
  };

  const handleTitleUpdate = async (newTitle: string) => {
    if (currentBook && newTitle !== currentBook.title) {
      try {
        await updateBookTitle(newTitle);
        toast.success('Book title updated');
      } catch (error) {
        console.error('Error updating book title', error);
        toast.error('Failed to update book title');
      }
    }
  };

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

  // Create an adapter function to convert between the interface expected by PageList
  // and the actual handleReorderPage function signature
  const handleReorderAdapter = (sourceIndex: number, destinationIndex: number) => {
    if (!currentBook || !currentBook.pages[sourceIndex]) return;
    
    const pageId = currentBook.pages[sourceIndex].id;
    handleReorderPage(pageId, destinationIndex);
  };

  return (
    <Layout fullWidth>
      {!id || (books.length > 0 && !books.some(book => book.id === id)) ? (
        <Navigate to="/books" />
      ) : !currentBook ? (
        <div className="flex flex-col space-y-4 p-8 w-full max-w-5xl mx-auto">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <EditorHeader 
            book={currentBook}
            onExportPDF={handleExportPDF}
            onApplyAIText={handleApplyAIText}
            onApplyAIImage={handleApplyAIImage}
            initialPrompt={currentPageData?.text}
            isExporting={isExporting}
            isSaving={isSaving || processingStory}
            currentBook={currentBook}
            updatePage={updatePage}
            onUpdateTitle={handleTitleUpdate}
          />
          
          <div className="border-b bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto">
              <PageList
                pages={currentBook.pages}
                selectedPageId={selectedPageId}
                onPageSelect={handlePageSelect}
                onAddPage={handleAddPage}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
                onReorderPage={handleReorderAdapter}
              />
            </div>
          </div>
          
          <EditorContent 
            currentPageData={currentPageData}
            handleTextChange={handleTextChange}
            handleLayoutChange={handleLayoutChange}
            handleTextFormattingChange={handleTextFormattingChange}
            handleGenerateImage={handleGenerateImage}
            handleImageSettingsChange={handleImageSettingsChange}
            isGenerating={isGenerating || processingStory}
            isNarrating={isNarrating}
            handleGenerateNarration={handleGenerateNarration}
          />
        </div>
      )}
    </Layout>
  );
};

export default EditorPage;
