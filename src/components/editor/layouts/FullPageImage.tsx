
import React from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { ZoomableImage } from '../ZoomableImage';
import { ImagePlaceholder } from '../ImagePlaceholder';
import { BookTextRenderer } from '../BookTextRenderer';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
  previewText?: string;
  onImageSettingsChange?: (settings: ImageSettings) => void;
}

export const FullPageImage: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false,
  previewText,
  onImageSettingsChange
}) => {
  return (
    <div className="relative h-full">
      {page.image ? (
        <div className="w-full h-full">
          <ZoomableImage 
            src={page.image} 
            alt="Page illustration"
            initialSettings={page.imageSettings}
            onSettingsChange={onImageSettingsChange}
          />
        </div>
      ) : (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <ImagePlaceholder
            isGenerating={isGenerating}
            onGenerate={handleGenerateImage}
          />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
        <div className="text-white">
          <BookTextRenderer 
            text={page.text} 
            textFormatting={{
              ...page.textFormatting,
              fontColor: '#FFFFFF' // Override color for visibility
            }}
            previewText={previewText}
          />
        </div>
      </div>
    </div>
  );
};
