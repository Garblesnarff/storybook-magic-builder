
import React, { useState } from 'react';
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
import { PageLayout } from '@/types/book';

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
    updatePage,
    setCurrentPageData,
    handleReorderPage,
    handleDeletePage // Add the delete page handler from usePageState
  } = usePageState(id);
  
  const {
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  } = useAIOperations(currentPageData, updatePage, setCurrentPageData);

  // Create a proper adapter function for layout changes
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
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
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

  if (!id || (books.length > 0 && !books.some(book => book.id === id))) {
    return <Navigate to="/books" />;
  }

  if (!currentBook) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <div className="min-h-screen flex flex-col">
        <EditorHeader 
          book={currentBook}
          onExportPDF={handleExportPDF}
          onApplyAIText={handleApplyAIText}
          onApplyAIImage={handleApplyAIImage}
          initialPrompt={currentPageData?.text}
          isExporting={isExporting}
          isSaving={isSaving}
        />
        
        <div className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <PageList
              pages={currentBook.pages}
              selectedPageId={selectedPageId}
              onPageSelect={handlePageSelect}
              onAddPage={handleAddPage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage} // Pass the delete page handler
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
          isGenerating={isGenerating}
        />
      </div>
    </Layout>
  );
};

export default EditorPage;
