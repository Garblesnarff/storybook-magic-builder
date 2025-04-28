
import React from 'react';
import { BookPage, PageLayout, ImageSettings } from '@/types/book';
import { TextLeftImageRight } from './layouts/TextLeftImageRight';
import { ImageLeftTextRight } from './layouts/ImageLeftTextRight';
import { TextTopImageBottom } from './layouts/TextTopImageBottom';
import { ImageTopTextBottom } from './layouts/ImageTopTextBottom';
import { FullPageText } from './layouts/FullPageText';
import { FullPageImage } from './layouts/FullPageImage';
import { EmptyPagePlaceholder } from './layouts/EmptyPagePlaceholder';

interface PageEditorProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: any, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
  previewText?: string;
  onImageSettingsChange?: (settings: ImageSettings) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  currentPageData,
  // Commenting unused props to prevent TypeScript warnings
  // handleTextChange,
  // handleLayoutChange,
  // handleTextFormattingChange,
  handleGenerateImage,
  isGenerating = false,
  previewText,
  onImageSettingsChange
}) => {
  if (!currentPageData) {
    return <EmptyPagePlaceholder />;
  }

  // Logic to determine which layout component to render
  const layout = currentPageData.layout || 'text-left-image-right';

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div 
        className="aspect-[3/4] bg-white rounded-xl shadow-lg border overflow-hidden max-h-[80vh]" 
        style={{ width: 'auto', height: '80vh' }}
      >
        {layout === 'text-left-image-right' && (
          <TextLeftImageRight
            page={currentPageData}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
            previewText={previewText}
            onImageSettingsChange={onImageSettingsChange}
          />
        )}
        
        {layout === 'image-left-text-right' && (
          <ImageLeftTextRight
            page={currentPageData}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
            previewText={previewText}
            onImageSettingsChange={onImageSettingsChange}
          />
        )}
        
        {layout === 'text-top-image-bottom' && (
          <TextTopImageBottom
            page={currentPageData}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
            previewText={previewText}
            onImageSettingsChange={onImageSettingsChange}
          />
        )}
        
        {layout === 'image-top-text-bottom' && (
          <ImageTopTextBottom
            page={currentPageData}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
            previewText={previewText}
            onImageSettingsChange={onImageSettingsChange}
          />
        )}
        
        {layout === 'full-page-text' && (
          <FullPageText
            page={currentPageData}
            previewText={previewText}
          />
        )}
        
        {layout === 'full-page-image' && (
          <FullPageImage
            page={currentPageData}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
            previewText={previewText}
            onImageSettingsChange={onImageSettingsChange}
          />
        )}
      </div>
    </div>
  );
};
