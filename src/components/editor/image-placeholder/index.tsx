
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  isGenerating?: boolean;
  onGenerate: () => Promise<void>;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  isGenerating = false,
  onGenerate
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        variant="ghost"
        size="lg"
        className="flex flex-col gap-2 p-8"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Generating image...</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8" />
            <span>Generate image from text</span>
          </>
        )}
      </Button>
    </div>
  );
};
