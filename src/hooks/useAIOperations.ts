
import { useState } from 'react';
import { usePageContentApplier } from '@/hooks/ai/usePageContentApplier';
import { BookPage } from '@/types/book';
import { useAITextGeneration } from './ai/useAITextGeneration';
import { useAIImageGeneration } from './ai/useAIImageGeneration';

// Hook that wraps usePageContentApplier for cleaner usage
export function useAIOperations(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);

  const { applyText, applyImage } = usePageContentApplier(
    (text: string) => {
      if (currentPageData) {
        const updatedPage = { ...currentPageData, text };
        return updatePage(updatedPage);
      }
      return Promise.resolve();
    },
    (imageUrl: string) => {
      if (currentPageData) {
        const updatedPage = { ...currentPageData, image: imageUrl };
        return updatePage(updatedPage);
      }
      return Promise.resolve();
    }
  );
  
  const { generateText: apiGenerateText } = useAITextGeneration();
  const { generateImage: apiGenerateImage } = useAIImageGeneration();

  // Handle applying AI text to current page
  const handleApplyAIText = async (text: string) => {
    setProcessingStory(true);
    try {
      await applyText(text);
    } finally {
      setProcessingStory(false);
    }
  };

  // Handle applying AI image to current page
  const handleApplyAIImage = async (imageUrl: string) => {
    setProcessingStory(true);
    try {
      await applyImage(imageUrl);
    } finally {
      setProcessingStory(false);
    }
  };

  // Handle generating an image for the current page
  const handleGenerateImage = async () => {
    if (!currentPageData) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await apiGenerateImage(
        currentPageData.text,
        'REALISTIC', // Default style
        currentPageData.bookId,
        currentPageData.id
      );
      
      if (imageUrl && currentPageData) {
        const updatedPage = { ...currentPageData, image: imageUrl };
        await updatePage(updatedPage);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
