
import React from 'react';
import { Book, BookPage, ImageSettings, PageLayout } from '@/types/book';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorContent } from '@/components/editor/EditorContent';
import { PageList } from '@/components/PageList';

interface EditorMainContentProps {
  currentBook: Book;
  selectedPageId: string | undefined;
  currentPageData: BookPage | null;
  isSaving: boolean;
  isExporting: boolean;
  processingStory: boolean;
  isGenerating: boolean;
  isNarrating: boolean;
  handlePageSelect: (pageId: string) => void;
  handleAddPage: () => Promise<string | undefined>;
  handleDuplicatePage: (pageId: string) => Promise<void>;
  handleDeletePage: (pageId: string) => Promise<void>;
  handleReorderPage: (sourceIndex: number, destinationIndex: number) => void;
  handleExportPDF: () => Promise<void>;
  handleApplyAIText: (prompt: string) => void;
  handleApplyAIImage: (prompt: string) => void;
  handleTextChange: (text: string) => Promise<void>;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: any, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  handleImageSettingsChange: (settings: ImageSettings) => Promise<void>;
  handleGenerateNarration: () => Promise<void>;
  updatePage: (page: BookPage) => Promise<void>;
  updateBookTitle: (title: string) => Promise<boolean>;
}

export const EditorMainContent: React.FC<EditorMainContentProps> = ({
  currentBook,
  selectedPageId,
  currentPageData,
  isSaving,
  isExporting,
  processingStory,
  isGenerating,
  isNarrating,
  handlePageSelect,
  handleAddPage,
  handleDuplicatePage,
  handleDeletePage,
  handleReorderPage,
  handleExportPDF,
  handleApplyAIText,
  handleApplyAIImage,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  handleImageSettingsChange,
  handleGenerateNarration,
  updatePage,
  updateBookTitle
}) => {
  // Create an adapter function to convert between the interface expected by PageList
  // and the actual handleReorderPage function signature
  const handleReorderAdapter = (sourceIndex: number, destinationIndex: number) => {
    handleReorderPage(sourceIndex, destinationIndex);
  };

  return (
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
        onUpdateTitle={updateBookTitle}
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
  );
};
