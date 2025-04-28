
import { Layout } from '@/components/Layout';
import { Navigate, useParams } from 'react-router-dom';
import { usePageState } from '@/hooks/usePageState';
import { EditorLoading } from '@/components/editor/EditorLoading';
import { EditorMainContent } from '@/components/editor/EditorMainContent';
import { useBook } from '@/contexts/BookContext';

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { books, currentBook, loading: bookLoading } = useBook();
  
  const editorState = usePageState(id);
  
  // Extract properties needed for EditorMainContent
  const {
    currentPageData,
    selectedPageId,
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
    updateBookTitle,
    isSaving,
  } = editorState;
  
  // These are placeholders for functions that will be implemented later
  const isExporting = false;
  const isGenerating = false;
  const processingStory = false;
  const isNarrating = false;
  
  const handleExportPDF = async () => {
    // Placeholder function
    console.log('Export PDF functionality will be implemented later');
  };
  
  const handleApplyAIText = (prompt: string) => {
    // Placeholder function
    console.log('Apply AI text functionality will be implemented later', prompt);
  };
  
  const handleApplyAIImage = (imageUrl: string) => {
    // Placeholder function
    console.log('Apply AI image functionality will be implemented later', imageUrl);
  };
  
  const handleGenerateNarration = async () => {
    // Placeholder function
    console.log('Generate narration functionality will be implemented later');
    return Promise.resolve();
  };

  // Create an adapter function to convert between the function signatures
  const handleReorderAdapter = (sourceIndex: number, destinationIndex: number) => {
    if (currentBook && currentBook.pages[sourceIndex]) {
      const pageId = currentBook.pages[sourceIndex].id;
      handleReorderPage(pageId, destinationIndex);
    }
  };

  // Create placeholder function for handleGenerateImage
  const handleGenerateImage = async () => {
    console.log('Generate image functionality will be implemented later');
    return Promise.resolve();
  };

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
          handleReorderPage={handleReorderAdapter}
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
          updateBookTitle={updateBookTitle}
        />
      )}
    </Layout>
  );
};

export default EditorPage;
