
import React, { useState, useEffect } from 'react';
import { BookPage } from '@/types/book';
import { PageEditor } from './PageEditor';
import { PageSettings } from './PageSettings';

interface EditorContentProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (value: any) => void;
  handleTextFormattingChange: (key: any, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  isGenerating = false
}) => {
  // State for real-time text preview
  const [previewText, setPreviewText] = useState<string | undefined>(undefined);
  
  // Reset preview text when the page changes
  useEffect(() => {
    setPreviewText(undefined);
  }, [currentPageData?.id]);
  
  // Create a wrapper for text change that updates both the preview and the actual data
  const handleTextChangeWithPreview = (value: string) => {
    // Update the persistent data
    handleTextChange(value);
    // Clear the preview since the actual data has been updated
    setPreviewText(undefined);
  };
  
  // Handle real-time preview updates
  const handlePreviewTextChange = (value: string) => {
    setPreviewText(value);
  };

  return (
    <div className="flex flex-col md:flex-row flex-grow">
      <PageEditor
        currentPageData={currentPageData}
        handleTextChange={handleTextChange}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
        previewText={previewText}
      />
      
      <PageSettings
        currentPageData={currentPageData}
        handleTextChange={handleTextChangeWithPreview}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
        onPreviewTextChange={handlePreviewTextChange}
      />
    </div>
  );
};
