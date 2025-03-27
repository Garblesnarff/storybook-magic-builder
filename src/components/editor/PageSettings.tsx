
import React from 'react';
import { BookPage, PageLayout, TextFormatting } from '@/types/book';
import { TextCursor, Layout as LayoutIcon, Image } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TextSettings } from './settings/TextSettings';
import { LayoutSettings } from './settings/LayoutSettings';
import { ImageSettings } from './settings/ImageSettings';

interface PageSettingsProps {
  currentPageData: BookPage | null;
  handleTextChange: (value: string) => void;
  handleLayoutChange: (layout: PageLayout) => void;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
  handleGenerateImage: () => Promise<void>;
  isGenerating?: boolean;
}

export const PageSettings: React.FC<PageSettingsProps> = ({
  currentPageData,
  handleTextChange,
  handleLayoutChange,
  handleTextFormattingChange,
  handleGenerateImage,
  isGenerating = false
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
        
        <TabsContent value="text">
          <TextSettings 
            currentPageData={currentPageData}
            handleTextChange={handleTextChange}
            handleTextFormattingChange={handleTextFormattingChange}
          />
        </TabsContent>
        
        <TabsContent value="layout">
          <LayoutSettings 
            currentPageData={currentPageData}
            handleLayoutChange={handleLayoutChange}
          />
        </TabsContent>
        
        <TabsContent value="image">
          <ImageSettings 
            currentPageData={currentPageData}
            handleTextFormattingChange={handleTextFormattingChange}
            handleGenerateImage={handleGenerateImage}
            isGenerating={isGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
