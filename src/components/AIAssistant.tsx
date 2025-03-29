
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
    await generateText(prompt, temperature, maxTokens);
  };

  const handleGenerateImage = async () => {
    await generateImage(prompt, imageStyle);
  };

  const handleApplyText = () => {
    if (onApplyText && generatedText) {
      onApplyText(generatedText);
      
      // If we have a book and updatePage function, distribute text across pages
      if (currentBook && updatePage && generatedText) {
        const pageBreakMarker = '---PAGE BREAK---';
        const segments = generatedText
          .split(pageBreakMarker)
          .map(segment => segment.trim())
          .filter(segment => segment.length > 0);
        
        console.log('AIAssistant: applying text segments to pages', {
          segments,
          pageCount: segments.length,
          bookPageCount: currentBook.pages.length
        });
        
        // If we have enough pages, update each page with its corresponding text segment
        if (segments.length > 0 && currentBook.pages.length >= segments.length) {
          // Distribute text segments to pages
          segments.forEach((segment, index) => {
            if (index < currentBook.pages.length) {
              const page = currentBook.pages[index];
              console.log(`Updating page ${index} with segment:`, { pageId: page.id, textLength: segment.length });
              updatePage({
                ...page,
                text: segment
              });
            }
          });
          
          console.log('All page texts updated successfully');
        } else {
          console.warn('Not enough pages to distribute all text segments', {
            segments: segments.length,
            availablePages: currentBook.pages.length
          });
        }
      }
    }
  };

  const handleApplyImage = () => {
    if (onApplyImage && generatedImage) {
      onApplyImage(generatedImage);
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
