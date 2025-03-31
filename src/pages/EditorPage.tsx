
import React from 'react';
import { Layout } from '@/components/Layout';
import { Navigate, useParams } from 'react-router-dom';
import { useEditorPage } from '@/hooks/useEditorPage';
import { EditorLoading } from '@/components/editor/EditorLoading';
import { EditorMainContent } from '@/components/editor/EditorMainContent';

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
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
  } = useEditorPage(id);

  return (
    <Layout fullWidth className="bg-books-background bg-cover bg-center bg-no-repeat">
      {!id || (books.length > 0 && !books.some(book => book.id === id)) ? (
        <Navigate to="/books" />
      ) : !currentBook ? (
        <EditorLoading />
      ) : (
        <EditorMainContent 
          currentBook={currentBook}
          selectedPageId={selectedPageId}
          currentPageData={currentPageData}
          isSaving={isSaving}
          isExporting={isExporting}
          processingStory={processingStory}
          isGenerating={isGenerating}
          isNarrating={isNarrating}
          handlePageSelect={handlePageSelect}
          handleAddPage={handleAddPage}
          handleDuplicatePage={handleDuplicatePage}
          handleDeletePage={handleDeletePage}
          handleReorderPage={handleReorderPage}
          handleExportPDF={handleExportPDF}
          handleApplyAIText={handleApplyAIText}
          handleApplyAIImage={handleApplyAIImage}
          handleTextChange={handleTextChange}
          handleLayoutChange={handleLayoutChange}
          handleTextFormattingChange={handleTextFormattingChange}
          handleGenerateImage={handleGenerateImage}
          handleImageSettingsChange={handleImageSettingsChange}
          handleGenerateNarration={handleGenerateNarration}
          updatePage={updatePage}
          updateBookTitle={handleTitleUpdate}
        />
      )}
    </Layout>
  );
};

export default EditorPage;
