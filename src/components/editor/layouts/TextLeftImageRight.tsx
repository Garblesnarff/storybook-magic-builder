
import React from 'react';
import { BookPage, ImageSettings } from '@/types/book';
import { ImagePlaceholder } from '../image-placeholder';
import { ZoomableImage } from '../image-zoom';
import { BookTextRenderer } from '../BookTextRenderer';

interface TextLeftImageRightProps {
  page: BookPage;
  handleGenerateImage?: () => Promise<void>;
  isGenerating?: boolean;
  previewText?: string;
  onImageSettingsChange?: (settings: ImageSettings) => void;
}

export const TextLeftImageRight: React.FC<TextLeftImageRightProps> = ({
  page,
  handleGenerateImage,
  isGenerating = false,
  previewText,
  onImageSettingsChange
}) => {
  // Add debugging to help troubleshoot image display issues
  React.useEffect(() => {
    if (page.image) {
      console.log("Image source in TextLeftImageRight:", typeof page.image === 'string' ? 
        (page.image.length > 100 ? page.image.substring(0, 100) + "..." : page.image) : 
        "Not a string");
    } else {
      console.log("No image provided to TextLeftImageRight component");
    }
  }, [page.image]);
  
  return (
    <div className="flex h-full">
      {/* Text section */}
      <div className="w-1/2 p-4 overflow-auto">
        <BookTextRenderer 
          text={previewText || page.text || ''} 
          textFormatting={page.textFormatting} 
        />
      </div>
      
      {/* Image section */}
      <div className="w-1/2 h-full relative bg-slate-50">
        {page.image ? (
          <ZoomableImage 
            src={page.image} 
            alt="Page illustration" 
            settings={page.imageSettings}
            onSettingsChange={onImageSettingsChange}
          />
        ) : (
          <ImagePlaceholder 
            onGenerate={handleGenerateImage}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
};
