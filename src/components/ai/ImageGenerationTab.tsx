
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { IMAGE_STYLES, getStyleDescriptionById } from '@/types/book';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface ImageGenerationTabProps {
  prompt: string;
  imageStyle: string;
  setImageStyle: (value: string) => void;
  isGenerating: boolean;
  generatedImage: string | null;
  onGenerate: () => Promise<void>;
  onApply: () => void;
}

export const ImageGenerationTab: React.FC<ImageGenerationTabProps> = ({
  prompt,
  imageStyle,
  setImageStyle,
  isGenerating,
  generatedImage,
  onGenerate,
  onApply
}) => {
  const [error, setError] = useState<string | null>(null);

  // On component mount, apply default image style from localStorage
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

  // When user selects a style, save it as default
  const handleStyleChange = (value: string) => {
    try {
      setImageStyle(value);
      localStorage.setItem('defaultImageStyle', value);
    } catch (e) {
      console.error('Error saving style to localStorage:', e);
    }
  };

  // Handle generate with additional error catching
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setError(null);
    
    try {
      await onGenerate();
    } catch (err) {
      console.error('Image generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Image generation failed', {
        description: errorMessage
      });
    }
  };
  
  // Get the current style name for display
  const currentStyleName = IMAGE_STYLES.find(style => style.id === imageStyle)?.name || 'Realistic';
  const styleDescription = IMAGE_STYLES.find(style => style.id === imageStyle)?.description || '';
  
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
            {IMAGE_STYLES.map((style) => (
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
