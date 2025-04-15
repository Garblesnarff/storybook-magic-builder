
import React, { useEffect, useState } from 'react';
import { BookPage, TextFormatting, IMAGE_STYLES } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useImageLoading } from '@/hooks/useImageLoading';

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
  // Track local state of selected style to avoid UI flickering
  const [selectedStyle, setSelectedStyle] = useState(
    currentPageData.textFormatting?.imageStyle || 'REALISTIC'
  );
  
  // Use image loading hook to get loading state and errors
  const { isLoading: isImageLoading, error: imageError } = 
    useImageLoading(currentPageData.image);
    
  // Update local state when page changes
  useEffect(() => {
    if (currentPageData.textFormatting?.imageStyle) {
      setSelectedStyle(currentPageData.textFormatting.imageStyle);
    }
  }, [currentPageData.id, currentPageData.textFormatting?.imageStyle]);

  // On component mount, apply default image style if none is set
  useEffect(() => {
    const applyDefaultStyleIfNeeded = () => {
      if (!currentPageData.textFormatting?.imageStyle) {
        console.log('No image style set, applying default');
        const defaultStyle = localStorage.getItem('defaultImageStyle') || 'REALISTIC';
        setSelectedStyle(defaultStyle);
        handleTextFormattingChange('imageStyle', defaultStyle);
      }
    };
    applyDefaultStyleIfNeeded();
  }, [currentPageData.id]);

  const handleStyleChange = (value: string) => {
    // Update local state immediately for responsive UI
    setSelectedStyle(value);
    
    // Then update in the database
    handleTextFormattingChange('imageStyle', value);
    
    // Store as default for future pages
    try {
      localStorage.setItem('defaultImageStyle', value);
    } catch (e) {
      console.error('Failed to save style preference to localStorage:', e);
    }
  };

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
    style.id === selectedStyle
  )?.name || 'Realistic';

  return (
    <div className="space-y-4">
      <Label htmlFor="imageStyle">Image Style</Label>
      <Select 
        value={selectedStyle}  
        onValueChange={handleStyleChange}
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
          disabled={isGenerating || !currentPageData.text || isImageLoading}
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
            {!isGenerating && !isImageLoading && (
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
            {isImageLoading ? (
              <div className="w-full h-32 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <img 
                src={currentPageData.image} 
                alt="Generated illustration" 
                className="w-full h-auto object-fill"
                onError={(e) => {
                  console.error('Image failed to load:', currentPageData.image);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            )}
          </div>
          {imageError && (
            <p className="text-red-500 text-xs mt-1">Error: {imageError}</p>
          )}
        </div>
      )}
    </div>
  );
};
