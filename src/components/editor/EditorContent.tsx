
import React, { useCallback, memo } from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { PageEditor } from './PageEditor';
import { PageSettings } from './PageSettings';

interface EditorContentProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (value: any) => void;
  handleTextFormattingChange: (key: any, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  handleImageSettingsChange: (settings: ImageSettings) => void;
  isGenerating?: boolean;
  isNarrating?: boolean;
  handleGenerateNarration?: () => Promise<void>;
}

export const EditorContent: React.FC<EditorContentProps> = memo(({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  handleImageSettingsChange,
  isGenerating = false,
  isNarrating = false,
  handleGenerateNarration
}) => {
  // Use a memoized handler to avoid re-renders
  const imageSettingsChangeHandler = useCallback((settings: ImageSettings) => {
    handleImageSettingsChange(settings);
  }, [handleImageSettingsChange]);

  return (
    <div className="flex flex-col md:flex-row flex-grow">
      <PageEditor
        currentPageData={currentPageData}
        handleTextChange={handleTextChange}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
        onImageSettingsChange={imageSettingsChangeHandler}
      />

      <PageSettings
        currentPageData={currentPageData}
        handleTextChange={handleTextChange}
        handleLayoutChange={handleLayoutChange}
        handleTextFormattingChange={handleTextFormattingChange}
        handleGenerateImage={handleGenerateImage}
        isGenerating={isGenerating}
        isNarrating={isNarrating}
        handleGenerateNarration={handleGenerateNarration}
      />
    </div>
  );
});

EditorContent.displayName = 'EditorContent';
