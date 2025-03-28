
import React from 'react';
import { BookPage } from '@/types/book';
import { ZoomableImage } from '../ZoomableImage';
import { ImagePlaceholder } from '../ImagePlaceholder';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const FullPageImage: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false
}) => {
  return (
    <div className="relative h-full">
      {page.image ? (
        <ZoomableImage 
          src={page.image} 
          alt="Page illustration"
        />
      ) : (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <ImagePlaceholder
            isGenerating={isGenerating}
            onGenerate={handleGenerateImage}
          />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
        <div 
          style={{ 
            fontFamily: page.textFormatting?.fontFamily || 'Inter',
            fontSize: `${page.textFormatting?.fontSize || 16}px`,
            color: '#FFFFFF',
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
