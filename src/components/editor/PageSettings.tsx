
import React from 'react';
import { BookPage, PageLayout, TextFormatting, IMAGE_STYLES, layoutNames } from '@/types/book';
import { Button } from '@/components/ui/button';
import { TextCursor, Layout as LayoutIcon, Image, Sparkles } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageSettingsProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
  handleGenerateImage: () => Promise<void>;
}

export const PageSettings: React.FC<PageSettingsProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage
}) => {
  if (!currentPageData) return null;

  return (
    <div className="w-full md:w-80 lg:w-96 border-l bg-white p-4 overflow-y-auto">
      <Tabs defaultValue="text">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="text">
            <TextCursor className="w-4 h-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="layout">
            <LayoutIcon className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="image">
            <Image className="w-4 h-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageText">Page Text</Label>
              <Textarea
                id="pageText"
                placeholder="Once upon a time..."
                className="h-40"
                value={currentPageData.text || ""}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontFamily">Font</Label>
                <Select
                  value={currentPageData.textFormatting?.fontFamily || "Inter"}
                  onValueChange={(value) => handleTextFormattingChange('fontFamily', value)}
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fontSize">Size</Label>
                <Select 
                  value={String(currentPageData.textFormatting?.fontSize || "16")} 
                  onValueChange={(value) => handleTextFormattingChange('fontSize', parseInt(value))}
                >
                  <SelectTrigger id="fontSize">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                    <SelectItem value="28">28px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <Label htmlFor="layout">Page Layout</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(layoutNames).map(([layout, name]) => (
              <div
                key={layout}
                className={`p-3 rounded-md border-2 cursor-pointer text-center text-sm ${
                  currentPageData.layout === layout ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
                onClick={() => handleLayoutChange(layout as PageLayout)}
              >
                {name}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
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
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image from Text
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
