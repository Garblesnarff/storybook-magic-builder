
import React, { useEffect } from 'react';
import { BookPage, TextFormatting, IMAGE_STYLES } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface ImageSettingsProps {
  currentPageData: BookPage;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({
  currentPageData,
  handleTextFormattingChange,
  handleGenerateImage,
  isGenerating = false
}) => {
  // On component mount, apply default image style if none is set
  useEffect(() => {
    const applyDefaultStyleIfNeeded = () => {
      // Only apply default if no style is currently set
      if (!currentPageData.textFormatting?.imageStyle) {
        const defaultStyle = localStorage.getItem('defaultImageStyle') || 'REALISTIC';
        handleTextFormattingChange('imageStyle', defaultStyle);
      }
    };
    applyDefaultStyleIfNeeded();
  }, [currentPageData.id]); // Re-apply when page changes

  const handleGenerateWithRetry = async () => {
    if (!currentPageData.text || currentPageData.text.trim() === '') {
      toast.error('Page has no text to generate an image from');
      return;
    }
    
    try {
      await handleGenerateImage();
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error('Image generation failed. Please try again.');
    }
  };

  // Get current style name for display
  const currentStyleName = IMAGE_STYLES.find(style => 
    style.id === currentPageData.textFormatting?.imageStyle
  )?.name || 'Realistic';

  return (
    <div className="space-y-4">
      <Label htmlFor="imageStyle">Image Style</Label>
      <Select 
        value={currentPageData.textFormatting?.imageStyle || "REALISTIC"} 
        onValueChange={value => handleTextFormattingChange('imageStyle', value)}
      >
        <SelectTrigger id="imageStyle">
          <SelectValue placeholder="Style" />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_STYLES.map(style => (
            <SelectItem key={style.id} value={style.id}>
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="pt-4">
        <Button 
          onClick={handleGenerateWithRetry} 
          className="w-full" 
          disabled={isGenerating || !currentPageData.text}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {currentStyleName} Image
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          This will generate a {currentStyleName.toLowerCase()} style 
          image based on the current page text.
        </p>
      </div>
      
      {currentPageData.image && (
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <Label>Current Image</Label>
            {!isGenerating && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGenerateWithRetry} 
                title="Regenerate image"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="mt-2 border rounded-md overflow-hidden bg-gray-50">
            <img 
              src={currentPageData.image} 
              alt="Generated illustration" 
              className="w-full h-auto object-fill"
              onError={(e) => {
                console.error('Image failed to load:', currentPageData.image);
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
