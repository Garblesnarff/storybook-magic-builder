
import React from 'react';
import { BookPage } from '@/types/book';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
  previewText?: string; // New prop for real-time text preview
}

export const FullPageText: React.FC<LayoutProps> = ({ page, previewText }) => {
  return (
    <div className="h-full p-12 flex items-center justify-center overflow-auto">
      <BookTextRenderer 
        text={page.text || ''} 
        textFormatting={page.textFormatting}
        previewText={previewText}
      />
    </div>
  );
};
