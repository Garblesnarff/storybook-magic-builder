
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImagePlaceholderProps {
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  isGenerating,
  onGenerate
}) => {
  return (
    <div className="text-center p-8">
      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No image generated yet</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onGenerate}
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
            Generate Image
          </>
        )}
      </Button>
    </div>
  );
};
