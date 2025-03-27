
import React from 'react';
import { BookPage } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, Loader2 } from 'lucide-react';

interface LayoutProps {
  page: BookPage;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const ImageTopTextBottom: React.FC<LayoutProps> = ({ 
  page, 
  handleGenerateImage,
  isGenerating = false 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-1/2 bg-gray-100 flex items-center justify-center">
        {page.image ? (
          <img 
            src={page.image} 
            alt="Page illustration"
            className="w-full h-full object-cover"
          />
        ) : (
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
        )}
      </div>
      <div className="h-1/2 p-8 overflow-auto">
        <div 
          style={{ 
            fontFamily: page.textFormatting?.fontFamily || 'Inter',
            fontSize: `${page.textFormatting?.fontSize || 16}px`,
            color: page.textFormatting?.fontColor || '#000000',
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
