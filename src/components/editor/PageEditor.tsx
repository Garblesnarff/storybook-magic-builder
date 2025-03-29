
import React from 'react';
import { BookPage, PageLayout } from '@/types/book';
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
  previewText?: string; // Add previewText prop
}

export const PageEditor: React.FC<PageEditorProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  isGenerating = false,
  previewText // Receive previewText prop
}) => {
  if (!currentPageData) {
    return <EmptyPagePlaceholder />;
  }

  // Logic to determine which layout component to render
  const layout = currentPageData.layout || 'text-left-image-right';

  return (
    <div className="flex-grow h-full overflow-hidden border-r relative">
      {layout === 'text-left-image-right' && (
        <TextLeftImageRight
          page={currentPageData}
          handleGenerateImage={handleGenerateImage}
          isGenerating={isGenerating}
          previewText={previewText} // Pass previewText to layout
        />
      )}
      
      {layout === 'image-left-text-right' && (
        <ImageLeftTextRight
          page={currentPageData}
          handleGenerateImage={handleGenerateImage}
          isGenerating={isGenerating}
          previewText={previewText} // Pass previewText to layout
        />
      )}
      
      {layout === 'text-top-image-bottom' && (
        <TextTopImageBottom
          page={currentPageData}
          handleGenerateImage={handleGenerateImage}
          isGenerating={isGenerating}
          previewText={previewText} // Pass previewText to layout
        />
      )}
      
      {layout === 'image-top-text-bottom' && (
        <ImageTopTextBottom
          page={currentPageData}
          handleGenerateImage={handleGenerateImage}
          isGenerating={isGenerating}
          previewText={previewText} // Pass previewText to layout
        />
      )}
      
      {layout === 'full-page-text' && (
        <FullPageText
          page={currentPageData}
          previewText={previewText} // Pass previewText to layout
        />
      )}
      
      {layout === 'full-page-image' && (
        <FullPageImage
          page={currentPageData}
          handleGenerateImage={handleGenerateImage}
          isGenerating={isGenerating}
          previewText={previewText} // Pass previewText to layout
        />
      )}
    </div>
  );
};
