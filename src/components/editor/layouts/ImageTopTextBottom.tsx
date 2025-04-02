
import React from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { ZoomableImage } from '../image-zoom';
import { ImagePlaceholder } from '../image-placeholder';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
  previewText?: string;
  onImageSettingsChange?: (settings: ImageSettings) => void;
}

export const ImageTopTextBottom: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false, 
  previewText,
  onImageSettingsChange
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-1/2 bg-gray-100 flex items-center justify-center">
        {page.image ? (
          <div className="w-full h-full">
            <ZoomableImage 
              src={page.image} 
              alt="Page illustration"
              settings={page.imageSettings}
              onSettingsChange={onImageSettingsChange}
            />
          </div>
        ) : (
          <ImagePlaceholder
            isGenerating={isGenerating}
            onGenerate={handleGenerateImage}
          />
        )}
      </div>
      <div className="h-1/2 p-8 overflow-auto">
        <BookTextRenderer 
          text={page.text || ''} 
          textFormatting={page.textFormatting}
          previewText={previewText}
        />
      </div>
    </div>
  );
};
