import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { imageStyleOptions } from '@/data/aiStyles';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGenerationTabProps {
  prompt: string;
  imageStyle: string;
  setImageStyle: (value: string) => void;
  isGenerating: boolean;
  generatedImage: string | null;
  onGenerate: () => Promise<void>;
  onApply: () => void;
  bookId?: string;
  pageId?: string;
}

export const ImageGenerationTab: React.FC<ImageGenerationTabProps> = ({
  prompt,
  imageStyle,
  setImageStyle,
  isGenerating,
  generatedImage,
  onGenerate,
  onApply,
  bookId,
  pageId
}) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    try {
      const defaultStyle = localStorage.getItem('defaultImageStyle');
      if (defaultStyle) {
        setImageStyle(defaultStyle);
      }
    } catch (e) {
      console.error('Error loading default style from localStorage:', e);
    }
  }, [setImageStyle]);

  const handleStyleChange = (value: string) => {
    try {
      setImageStyle(value);
      localStorage.setItem('defaultImageStyle', value);
    } catch (e) {
      console.error('Error saving style to localStorage:', e);
    }
  };

  useEffect(() => {
    if (generatedImage) {
      setImageLoadError(false);
    }
  }, [generatedImage]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setError(null);
    setImageLoadError(false);
    
    try {
      console.log('Starting image generation with prompt:', prompt.substring(0, 50));
      if (bookId && pageId) {
        console.log(`For book ID: ${bookId}, page ID: ${pageId}`);
      }
      
      await onGenerate();
      
      setRetryCount(0);
    } catch (err) {
      console.error('Image generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Image generation failed', {
        description: errorMessage
      });
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    const backoffDelay = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
    
    toast.info(`Retrying image generation in ${backoffDelay/1000} seconds...`);
    
    setTimeout(() => {
      handleGenerate();
    }, backoffDelay);
  };

  const currentStyleName = imageStyleOptions.find(style => style.id === imageStyle)?.name || 'Realistic';
  const styleDescription = imageStyleOptions.find(style => style.id === imageStyle)?.description || '';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageStyle">Image Style</Label>
        <Select
          value={imageStyle}
          onValueChange={handleStyleChange}
        >
          <SelectTrigger id="imageStyle">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            {imageStyleOptions.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          {styleDescription}
        </p>
      </div>

      <Button 
        onClick={handleGenerate} 
        className="w-full"
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating {currentStyleName.toLowerCase()} image...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate {currentStyleName} Image
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Image generation failed</p>
              <p className="mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="mt-2"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {imageLoadError && !error && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Image display issue</p>
              <p className="mt-1">The image was generated but couldn't be displayed properly. You can still apply it to the page.</p>
            </div>
          </div>
        </div>
      )}

      {generatedImage && !error && (
        <div className="space-y-4 mt-4">
          <div className="border rounded-md overflow-hidden">
            <img 
              src={generatedImage} 
              alt="AI generated" 
              className="w-full h-auto"
              onError={(e) => {
                console.error('Generated image failed to load in preview');
                setImageLoadError(true);
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIGdlbmVyYXRlZCBidXQgY291bGRuJ3QgYmUgZGlzcGxheWVkPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
          <Button 
            onClick={onApply} 
            disabled={!generatedImage}
            className="w-full"
          >
            Apply to Page
          </Button>
        </div>
      )}
    </div>
  );
};
