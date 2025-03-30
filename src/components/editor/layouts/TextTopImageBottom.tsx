
import React, { useCallback, memo } from 'react';
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

export const TextTopImageBottom: React.FC<LayoutProps> = memo(({ 
  page, 
  handleGenerateImage,
  isGenerating = false,
  previewText,
  onImageSettingsChange
}) => {
  // Memoized handler for image settings changes
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (onImageSettingsChange) {
      onImageSettingsChange(settings);
    }
  }, [onImageSettingsChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="h-1/2 p-8 overflow-auto">
        <BookTextRenderer 
          text={page.text} 
          textFormatting={page.textFormatting}
          previewText={previewText}
        />
      </div>
      <div className="h-1/2 bg-gray-100 flex items-center justify-center">
        {page.image ? (
          <div className="w-full h-full">
            <ZoomableImage 
              src={page.image} 
              alt="Page illustration"
              initialSettings={page.imageSettings}
              onSettingsChange={handleImageSettingsChange}
            />
          </div>
        ) : (
          <ImagePlaceholder
            isGenerating={isGenerating}
            onGenerate={handleGenerateImage}
          />
        )}
      </div>
    </div>
  );
});

TextTopImageBottom.displayName = 'TextTopImageBottom';
