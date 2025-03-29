
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { useImageGeneration } from './useImageGeneration';
import { useTextGeneration } from './useTextGeneration';

export function useAIOperations(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => void, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<void>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    isGeneratingImage,
    generatedImage,
    setGeneratedImage,
    handleGenerateImage: imageGenerationHandler,
    generateImage,
    handleApplyAIImage: imageApplyHandler
  } = useImageGeneration();
  
  const {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText,
    handleApplyAIText: textApplyHandler
  } = useTextGeneration();

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    await imageGenerationHandler(currentPageData, updatePage, setCurrentPageData);
    setIsGenerating(false);
  };

  const handleApplyAIText = async (text: string) => {
    await textApplyHandler(text, currentPageData, updatePage, onAddPage);
  };

  const handleApplyAIImage = (imageData: string) => {
    imageApplyHandler(imageData, currentPageData, updatePage, setCurrentPageData);
  };

  return {
    // Original functions for direct page updates
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage,
    
    // New general-purpose AI functions
    isGeneratingText,
    isGeneratingImage,
    generatedText,
    generatedImage,
    setGeneratedText,
    setGeneratedImage,
    generateText,
    generateImage
  };
}
