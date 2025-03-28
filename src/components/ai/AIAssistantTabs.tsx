
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Wand2, Sparkles } from 'lucide-react';
import { TextGenerationTab } from './TextGenerationTab';
import { ImageGenerationTab } from './ImageGenerationTab';

interface AIAssistantTabsProps {
  prompt: string;
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  imageStyle: string;
  setImageStyle: (value: string) => void;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  generatedText: string;
  generatedImage: string | null;
  onGenerateText: () => Promise<void>;
  onGenerateImage: () => Promise<void>;
  onApplyText: () => void;
  onApplyImage: () => void;
}

export const AIAssistantTabs: React.FC<AIAssistantTabsProps> = ({
  prompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  imageStyle,
  setImageStyle,
  isGeneratingText,
  isGeneratingImage,
  generatedText,
  generatedImage,
  onGenerateText,
  onGenerateImage,
  onApplyText,
  onApplyImage
}) => {
  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="text">
          <Wand2 className="mr-2 h-4 w-4" />
          Text
        </TabsTrigger>
        <TabsTrigger value="image">
          <Sparkles className="mr-2 h-4 w-4" />
          Image
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="text" className="space-y-4">
        <TextGenerationTab
          prompt={prompt}
          temperature={temperature}
          setTemperature={setTemperature}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          isGenerating={isGeneratingText}
          generatedText={generatedText}
          onGenerate={onGenerateText}
          onApply={onApplyText}
        />
      </TabsContent>
      
      <TabsContent value="image" className="space-y-4">
        <ImageGenerationTab
          prompt={prompt}
          imageStyle={imageStyle}
          setImageStyle={setImageStyle}
          isGenerating={isGeneratingImage}
          generatedImage={generatedImage}
          onGenerate={onGenerateImage}
          onApply={onApplyImage}
        />
      </TabsContent>
    </Tabs>
  );
};
