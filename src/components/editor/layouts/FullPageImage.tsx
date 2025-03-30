
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

export const FullPageImage: React.FC<LayoutProps> = ({ 
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
    <div className="relative h-full">
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
