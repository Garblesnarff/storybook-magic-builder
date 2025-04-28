
import { useState } from 'react';
import { usePageContentApplier } from '@/hooks/ai/usePageContentApplier';
import { BookPage } from '@/types/book';
import { useAITextGeneration } from './ai/useAITextGeneration';
import { useAIImageGeneration } from './ai/useAIImageGeneration';

// Hook that wraps usePageContentApplier for cleaner usage
export function useAIOperations(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined>
) {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { 
    isGenerating, 
    processingStory, 
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage 
  } = usePageContentApplier(currentPageData, updatePage, setCurrentPageData, onAddPage);
  
  const { generateText: apiGenerateText } = useAITextGeneration();
  const { generateImage: apiGenerateImage } = useAIImageGeneration();

  // Generate text without applying it to a page
  const generateText = async (prompt: string, temperature = 0.7, maxTokens = 800): Promise<void> => {
    setIsGeneratingText(true);
    try {
      const result = await apiGenerateText(prompt, temperature, maxTokens);
      if (result) {
        setGeneratedText(result);
      }
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  // Generate image without applying it to a page
  const generateImage = async (prompt: string, imageStyle: string): Promise<void> => {
    setIsGeneratingImage(true);
    try {
      // Using a placeholder book ID and page ID since we're not saving to a page yet
      const imageUrl = await apiGenerateImage(
        prompt, 
        imageStyle,
        'temp-book-id',
        'temp-page-id'
      );
      
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGenerating,
    processingStory,
    isGeneratingText,
    isGeneratingImage,
    generatedText,
    generatedImage,
    setGeneratedText,
    setGeneratedImage,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage,
    generateText,
    generateImage
  };
}
