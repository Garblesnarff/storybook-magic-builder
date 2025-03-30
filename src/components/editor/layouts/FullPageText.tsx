
import React from 'react';
import { BookPage } from '@/types/book';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
  previewText?: string; // New prop for real-time text preview
}

export const FullPageText: React.FC<LayoutProps> = ({ page, previewText }) => {
  return (
    <div className="h-full p-12 flex flex-col items-center justify-center overflow-auto">
      <BookTextRenderer 
        text={page.text || ''} 
        textFormatting={page.textFormatting}
        previewText={previewText}
      />
      
      {page.narrationUrl && (
        <div className="mt-6 w-full max-w-md">
          <audio controls src={page.narrationUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};
