
import React from 'react';
import { BookPage, PageLayout, TextFormatting } from '@/types/book';
import {
  TextLeftImageRight,
  ImageLeftTextRight,
  TextTopImageBottom,
  ImageTopTextBottom,
  FullPageImage,
  FullPageText,
  EmptyPagePlaceholder
} from './layouts';

interface PageEditorProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
  handleGenerateImage: () => Promise<void>;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  currentPageData,
  handleGenerateImage
}) => {
  if (!currentPageData) {
    return <EmptyPagePlaceholder />;
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div 
        className="aspect-[3/4] bg-white rounded-xl shadow-lg border overflow-hidden max-h-[80vh]" 
        style={{ width: 'auto', height: '80vh' }}
      >
        {renderLayoutComponent(currentPageData, handleGenerateImage)}
      </div>
    </div>
  );
};

function renderLayoutComponent(page: BookPage, handleGenerateImage: () => Promise<void>) {
  switch (page.layout) {
    case 'text-left-image-right':
      return <TextLeftImageRight page={page} handleGenerateImage={handleGenerateImage} />;
    case 'image-left-text-right':
      return <ImageLeftTextRight page={page} handleGenerateImage={handleGenerateImage} />;
    case 'text-top-image-bottom':
      return <TextTopImageBottom page={page} handleGenerateImage={handleGenerateImage} />;
    case 'image-top-text-bottom':
      return <ImageTopTextBottom page={page} handleGenerateImage={handleGenerateImage} />;
    case 'full-page-image':
      return <FullPageImage page={page} handleGenerateImage={handleGenerateImage} />;
    case 'full-page-text':
      return <FullPageText page={page} />;
    default:
      return <TextLeftImageRight page={page} handleGenerateImage={handleGenerateImage} />;
  }
}
