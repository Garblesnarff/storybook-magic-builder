
import React from 'react';
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
      </div>
      
      <Button 
        onClick={onGenerate} 
        className="w-full"
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Image
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
