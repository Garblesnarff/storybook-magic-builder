
import React from 'react';
import { Layout } from '@/components/Layout';
import { PageList } from '@/components/PageList';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePageState } from '@/hooks/usePageState';
import { useAIOperations } from '@/hooks/useAIOperations';

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    books,
    currentBook,
    selectedPageId,
    currentPageData,
    handlePageSelect,
    handleAddPage,
    handleDuplicatePage,
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    updatePage,
    setCurrentPageData
  } = usePageState(id);
  
  const {
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  } = useAIOperations(currentPageData, updatePage, setCurrentPageData);

  const handleExportPDF = () => {
    toast.success('PDF export is not implemented in this demo');
  };

  if (!id || (books.length > 0 && !books.some(book => book.id === id))) {
    return <Navigate to="/books" />;
  }

  if (!currentBook) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p>Loading book...</p>
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
        />
        
        <div className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <PageList
              pages={currentBook.pages}
              selectedPageId={selectedPageId}
              onPageSelect={handlePageSelect}
              onAddPage={handleAddPage}
              onDuplicatePage={handleDuplicatePage}
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
