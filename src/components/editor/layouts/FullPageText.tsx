
import React from 'react';
import { BookPage } from '@/types/book';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
}

export const FullPageText: React.FC<LayoutProps> = ({ page }) => {
  return (
    <div className="h-full p-12 flex items-center justify-center overflow-auto">
      <BookTextRenderer 
        text={page.text || ''} 
        textFormatting={page.textFormatting}
      />
    </div>
  );
};
