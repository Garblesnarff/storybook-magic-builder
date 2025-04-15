
import React from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePlaceholderProps {
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
  error?: string | null;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  isGenerating,
  onGenerate,
  error
}) => {
  return (
    <div className="text-center p-8">
      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 mb-4">
        {error || 'No image generated yet'}
      </p>
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating}
        variant="outline"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Image'
        )}
      </Button>
    </div>
  );
};
