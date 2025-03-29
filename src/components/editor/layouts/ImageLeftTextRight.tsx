
import React from 'react';
import { BookPage } from '@/types/book';
import { ZoomableImage } from '../ZoomableImage';
import { ImagePlaceholder } from '../ImagePlaceholder';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
  previewText?: string;
}

export const ImageLeftTextRight: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false,
  previewText
}) => {
  return (
    <div className="flex h-full">
      <div className="w-1/2 h-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
        <BookTextRenderer 
          text={page.text || ''} 
          textFormatting={page.textFormatting}
          previewText={previewText}
        />
      </div>
    </div>
  );
};
