
import React from 'react';
import { BookPage } from '@/types/book';
import { ZoomableImage } from '../ZoomableImage';
import { ImagePlaceholder } from '../ImagePlaceholder';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const ImageLeftTextRight: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false
}) => {
  return (
    <div className="flex h-full">
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        {page.image ? (
          <ZoomableImage 
            src={page.image} 
            alt="Page illustration"
          />
        ) : (
          <ImagePlaceholder
            isGenerating={isGenerating}
            onGenerate={handleGenerateImage}
          />
        )}
      </div>
      <div className="w-1/2 p-8 overflow-auto">
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
    </div>
  );
};
