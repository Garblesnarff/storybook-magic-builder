
import React from 'react';
import { BookPage } from '@/types/book';

interface LayoutProps {
  page: BookPage;
}

export const FullPageText: React.FC<LayoutProps> = ({ page }) => {
  return (
    <div className="h-full p-12 flex items-center justify-center overflow-auto">
      <div 
        style={{ 
          fontFamily: page.textFormatting?.fontFamily || 'Inter',
          fontSize: `${page.textFormatting?.fontSize || 16}px`,
          color: page.textFormatting?.fontColor || '#000000',
          fontWeight: page.textFormatting?.isBold ? 'bold' : 'normal',
          fontStyle: page.textFormatting?.isItalic ? 'italic' : 'normal',
        }}
      >
        {page.text}
      </div>
    </div>
  );
};
