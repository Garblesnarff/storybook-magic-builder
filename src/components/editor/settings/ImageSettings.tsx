
import React from 'react';
import { BookPage, TextFormatting, IMAGE_STYLES } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div className="space-y-4">
      <Label htmlFor="imageStyle">Image Style</Label>
      <Select
        value={currentPageData.textFormatting?.imageStyle || "REALISTIC"}
        onValueChange={(value) => handleTextFormattingChange('imageStyle', value)}
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
      
      <div className="pt-4">
        <Button 
          onClick={handleGenerateImage} 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Image from Text
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          This will generate an image based on the current page text using Google's Gemini 2.0 model.
        </p>
      </div>
      
      {currentPageData.image && (
        <div className="pt-2">
          <Label>Current Image</Label>
          <div className="mt-2 border rounded-md overflow-hidden bg-gray-50">
            <img 
              src={currentPageData.image} 
              alt="Generated illustration" 
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
