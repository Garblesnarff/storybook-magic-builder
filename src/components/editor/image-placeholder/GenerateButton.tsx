
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  isGenerating: boolean;
  onClick: () => Promise<void>;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onClick
}) => {
  return (
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={onClick}
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
