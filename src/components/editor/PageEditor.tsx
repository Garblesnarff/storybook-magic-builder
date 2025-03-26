
import React from 'react';
import { BookPage, PageLayout, TextFormatting, layoutNames } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Sparkles, Image } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageEditorProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
  handleGenerateImage: () => Promise<void>;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage
}) => {
  if (!currentPageData) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <p>Select a page to edit</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div 
        className="aspect-[3/4] bg-white rounded-xl shadow-lg border overflow-hidden max-h-[80vh]" 
        style={{ width: 'auto', height: '80vh' }}
      >
        {currentPageData.layout === 'text-left-image-right' && (
          <div className="flex h-full">
            <div className="w-1/2 p-8 overflow-auto">
              <div 
                style={{ 
                  fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                  fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                  color: currentPageData.textFormatting?.fontColor || '#000000',
                  fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                  fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                }}
              >
                {currentPageData.text}
              </div>
            </div>
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              {currentPageData.image ? (
                <img 
                  src={currentPageData.image} 
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentPageData.layout === 'image-left-text-right' && (
          <div className="flex h-full">
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              {currentPageData.image ? (
                <img 
                  src={currentPageData.image} 
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              )}
            </div>
            <div className="w-1/2 p-8 overflow-auto">
              <div 
                style={{ 
                  fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                  fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                  color: currentPageData.textFormatting?.fontColor || '#000000',
                  fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                  fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                }}
              >
                {currentPageData.text}
              </div>
            </div>
          </div>
        )}
        
        {currentPageData.layout === 'text-top-image-bottom' && (
          <div className="flex flex-col h-full">
            <div className="h-1/2 p-8 overflow-auto">
              <div 
                style={{ 
                  fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                  fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                  color: currentPageData.textFormatting?.fontColor || '#000000',
                  fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                  fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                }}
              >
                {currentPageData.text}
              </div>
            </div>
            <div className="h-1/2 bg-gray-100 flex items-center justify-center">
              {currentPageData.image ? (
                <img 
                  src={currentPageData.image} 
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentPageData.layout === 'image-top-text-bottom' && (
          <div className="flex flex-col h-full">
            <div className="h-1/2 bg-gray-100 flex items-center justify-center">
              {currentPageData.image ? (
                <img 
                  src={currentPageData.image} 
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              )}
            </div>
            <div className="h-1/2 p-8 overflow-auto">
              <div 
                style={{ 
                  fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                  fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                  color: currentPageData.textFormatting?.fontColor || '#000000',
                  fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                  fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                }}
              >
                {currentPageData.text}
              </div>
            </div>
          </div>
        )}
        
        {currentPageData.layout === 'full-page-image' && (
          <div className="relative h-full">
            {currentPageData.image ? (
              <img 
                src={currentPageData.image} 
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
              <div 
                style={{ 
                  fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                  fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                  color: '#FFFFFF',
                  fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                  fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                }}
              >
                {currentPageData.text}
              </div>
            </div>
          </div>
        )}
        
        {currentPageData.layout === 'full-page-text' && (
          <div className="h-full p-12 flex items-center justify-center overflow-auto">
            <div 
              style={{ 
                fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                color: currentPageData.textFormatting?.fontColor || '#000000',
                fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
              }}
            >
              {currentPageData.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
