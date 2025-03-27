
import React from 'react';
import { BookPage } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, Loader2 } from 'lucide-react';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const FullPageImage: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false
}) => {
  return (
    <div className="relative h-full">
      {page.image ? (
        <img 
          src={page.image} 
          alt="Page illustration"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No image generated yet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleGenerateImage}
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
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
        <div 
          style={{ 
            fontFamily: page.textFormatting?.fontFamily || 'Inter',
            fontSize: `${page.textFormatting?.fontSize || 16}px`,
            color: '#FFFFFF',
            fontWeight: page.textFormatting?.isBold ? 'bold' : 'normal',
            fontStyle: page.textFormatting?.isItalic ? 'italic' : 'normal',
          }}
        >
          {page.text}
        </div>
      </div>
    </div>
  );
};
