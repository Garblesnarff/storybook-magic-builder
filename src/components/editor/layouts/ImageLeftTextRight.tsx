
import React, { useCallback, useMemo } from 'react'; // <-- Add useMemo
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

export const ImageLeftTextRight: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false,
  previewText,
  onImageSettingsChange
}) => {
  // Handler for image settings changes with memoization to prevent re-renders
  const handleImageSettingsChange = useCallback((settings: ImageSettings) => {
    if (onImageSettingsChange) {
      onImageSettingsChange(settings);
    }
  }, [onImageSettingsChange]);

  // *** ADD THIS useMemo ***
  const memoizedImageSettings = useMemo(() => {
    // Explicitly cast the default object to satisfy the ImageSettings type
    return page.imageSettings || { scale: 1, position: { x: 0, y: 0 }, fitMethod: 'contain' } as ImageSettings;
  }, [
    page.imageSettings?.scale,
    page.imageSettings?.position?.x,
    page.imageSettings?.position?.y,
    page.imageSettings?.fitMethod
  ]);
  // ***********************

  return (
    <div className="flex h-full">
      <div className="w-1/2 h-full bg-gray-100 flex items-center justify-center">
        {page.image ? (
          <div className="w-full h-full">
            <ZoomableImage 
              src={page.image} 
              alt="Page illustration"
              // *** USE THE MEMOIZED VALUE ***
              initialSettings={memoizedImageSettings}
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
