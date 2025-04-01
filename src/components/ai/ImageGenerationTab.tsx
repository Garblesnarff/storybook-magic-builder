
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { IMAGE_STYLES } from '@/types/book';
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
  // On component mount, apply default image style from localStorage
  useEffect(() => {
    const defaultStyle = localStorage.getItem('defaultImageStyle');
    if (defaultStyle) {
      setImageStyle(defaultStyle);
    }
  }, [setImageStyle]);

  // Get the current style name for display
  const currentStyleName = IMAGE_STYLES.find(style => style.id === imageStyle)?.name || 'Realistic';
  
  // Handle the generate button click with proper error handling
  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }
    
    try {
      await onGenerate();
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageStyle">Image Style</Label>
        <Select
          value={imageStyle}
          onValueChange={(value) => setImageStyle(value)}
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
          {IMAGE_STYLES.find(style => style.id === imageStyle)?.description}
        </p>
      </div>
      
      <Button 
        onClick={handleGenerateClick} 
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
      
      {generatedImage && (
        <div className="space-y-4 mt-4">
          <div className="border rounded-md overflow-hidden">
            <img 
              src={generatedImage} 
              alt="AI generated" 
              className="w-full h-auto"
            />
          </div>
          <Button 
            onClick={() => {
              onApply();
              toast.success('Image applied to page');
            }} 
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
