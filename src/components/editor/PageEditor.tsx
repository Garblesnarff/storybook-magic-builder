
import React, { useState, useEffect } from 'react';
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
  isGenerating?: boolean;
  previewText?: string; // New prop for real-time text preview
}

export const PageEditor: React.FC<PageEditorProps> = ({
  currentPageData,
  handleGenerateImage,
  isGenerating = false,
  previewText
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
        {renderLayoutComponent(currentPageData, handleGenerateImage, isGenerating, previewText)}
      </div>
    </div>
  );
};

function renderLayoutComponent(
  page: BookPage, 
  handleGenerateImage: () => Promise<void>, 
  isGenerating: boolean = false,
  previewText?: string
) {
  const props = {
    page,
    handleGenerateImage,
    isGenerating,
    previewText
  };

  switch (page.layout) {
    case 'text-left-image-right':
      return <TextLeftImageRight {...props} />;
    case 'image-left-text-right':
      return <ImageLeftTextRight {...props} />;
    case 'text-top-image-bottom':
      return <TextTopImageBottom {...props} />;
    case 'image-top-text-bottom':
      return <ImageTopTextBottom {...props} />;
    case 'full-page-image':
      return <FullPageImage {...props} />;
    case 'full-page-text':
      return <FullPageText {...props} />;
    default:
      return <TextLeftImageRight {...props} />;
  }
}
