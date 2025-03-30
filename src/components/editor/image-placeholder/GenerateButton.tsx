
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Import toast for error notifications

interface GenerateButtonProps {
  isGenerating: boolean;
  onClick: () => Promise<void>;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onClick
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onClick();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={handleClick}
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
  );
};
