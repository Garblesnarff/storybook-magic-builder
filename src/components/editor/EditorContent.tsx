
import React from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { PageEditor } from './PageEditor';
import { PageSettings } from './PageSettings';

interface EditorContentProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (value: any) => void;
  handleTextFormattingChange: (key: any, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  handleImageSettingsChange?: (settings: ImageSettings) => void;
  isGenerating?: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  handleImageSettingsChange,
  isGenerating = false
}) => {
  return (
    <div className="flex flex-col md:flex-row flex-grow">
      <PageEditor
        currentPageData={currentPageData}
        handleTextChange={handleTextChange}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
        onImageSettingsChange={handleImageSettingsChange}
      />

      <PageSettings
        currentPageData={currentPageData}
        handleTextChange={handleTextChange}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
      />
    </div>
  );
};
