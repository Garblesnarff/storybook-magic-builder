
import React, { useCallback } from 'react';
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
  // Memoized image settings change handler to prevent excessive updates
  const debouncedImageSettingsChange = useCallback((settings: ImageSettings) => {
    // We can now trust the settings data as it's properly managed
    console.log("Image settings change requested", settings);
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
        onImageSettingsChange={debouncedImageSettingsChange}
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
