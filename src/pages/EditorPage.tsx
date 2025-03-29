
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PageList } from '@/components/PageList';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePageState } from '@/hooks/usePageState';
import { useAIOperations } from '@/hooks/useAIOperations';
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
    handleDeletePage
  } = usePageState(id);
  
  const handleAddPageAsync = async () => {
    return new Promise<void>((resolve) => {
      handleAddPage();
      setTimeout(resolve, 1000);
    });
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
                onReorderPage={handleReorderPage}
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
          />
        </div>
      )}
    </Layout>
  );
};

export default EditorPage;
