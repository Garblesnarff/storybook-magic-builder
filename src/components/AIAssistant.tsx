
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Import our components
import { PromptInput } from './ai/PromptInput';
import { TextGenerationTab } from './ai/TextGenerationTab';
import { ImageGenerationTab } from './ai/ImageGenerationTab';

// Import the AI operations hook
import { useAIOperations } from '@/hooks/useAIOperations';

interface AIAssistantProps {
  onApplyText?: (text: string) => void;
  onApplyImage?: (imageBase64: string) => void;
  initialPrompt?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onApplyText, 
  onApplyImage,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [imageStyle, setImageStyle] = useState('REALISTIC');

  // Initialize the hook with null values since we're not operating on a specific page
  const {
    isGeneratingText,
    isGeneratingImage,
    generatedText,
    generatedImage,
    setGeneratedText,
    setGeneratedImage,
    generateText,
    generateImage
  } = useAIOperations(null, () => {}, () => {});

  const handleGenerateText = async () => {
    const text = await generateText(prompt, temperature, maxTokens);
    // Text is already set in the hook state, nothing more to do here
  };

  const handleGenerateImage = async () => {
    const image = await generateImage(prompt, imageStyle);
    // Image is already set in the hook state, nothing more to do here
  };

  const handleApplyText = () => {
    if (onApplyText && generatedText) {
      onApplyText(generatedText);
      toast.success('Text applied to page');
    }
  };

  const handleApplyImage = () => {
    if (onApplyImage && generatedImage) {
      onApplyImage(generatedImage);
      toast.success('Image applied to page');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>AI Book Assistant</SheetTitle>
          <SheetDescription>
            Generate text and images for your children's book using AI.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <PromptInput 
            prompt={prompt} 
            setPrompt={setPrompt} 
          />

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
                onGenerate={handleGenerateText}
                onApply={handleApplyText}
              />
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <ImageGenerationTab
                prompt={prompt}
                imageStyle={imageStyle}
                setImageStyle={setImageStyle}
                isGenerating={isGeneratingImage}
                generatedImage={generatedImage}
                onGenerate={handleGenerateImage}
                onApply={handleApplyImage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
