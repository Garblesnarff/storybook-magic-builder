
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
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
import { AIAssistantTabs } from './ai/AIAssistantTabs';

// Import the AI operations hook
import { useAIOperations } from '@/hooks/useAIOperations';
import { BookPage } from '@/types/book';

interface AIAssistantProps {
  onApplyText?: (text: string) => void;
  onApplyImage?: (imageBase64: string) => void;
  initialPrompt?: string;
  currentBook?: {
    pages: BookPage[];
  } | null;
  updatePage?: (page: BookPage) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onApplyText, 
  onApplyImage,
  initialPrompt = '',
  currentBook,
  updatePage
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [imageStyle, setImageStyle] = useState('REALISTIC');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Create an async wrapper function for updatePage that returns a Promise
  const handleUpdatePage = async (page: BookPage): Promise<void> => {
    if (updatePage) {
      updatePage(page);
    }
    return Promise.resolve();
  };

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
  } = useAIOperations(null, handleUpdatePage, () => {});

  const handleGenerateText = async () => {
    await generateText(prompt, temperature, maxTokens);
  };

  const handleGenerateImage = async () => {
    await generateImage(prompt, imageStyle);
  };

  const handleApplyText = () => {
    if (onApplyText && generatedText) {
      onApplyText(generatedText);
    }
  };

  const handleApplyImage = () => {
    if (onApplyImage && generatedImage) {
      onApplyImage(generatedImage);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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

          <AIAssistantTabs
            prompt={prompt}
            temperature={temperature}
            setTemperature={setTemperature}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            imageStyle={imageStyle}
            setImageStyle={setImageStyle}
            isGeneratingText={isGeneratingText}
            isGeneratingImage={isGeneratingImage}
            generatedText={generatedText}
            generatedImage={generatedImage}
            onGenerateText={handleGenerateText}
            onGenerateImage={handleGenerateImage}
            onApplyText={handleApplyText}
            onApplyImage={handleApplyImage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

