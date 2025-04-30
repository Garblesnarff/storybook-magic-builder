
import { useState } from 'react';
import { BookPage, Book } from '@/types/book';
import { useAITextGeneration } from './ai/useAITextGeneration';
import { useAIImageGeneration } from './ai/useAIImageGeneration';
import { usePageContentApplier } from './ai/usePageContentApplier';

export function useAIOperations(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => Promise<void>, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined>,
  currentBook?: Book | null
) {
  // Use the separate hook modules for AI operations
  const { 
    isGeneratingText, 
    generatedText, 
    setGeneratedText, 
    generateText 
  } = useAITextGeneration();
  
  const { 
    isGeneratingImage, 
    generatedImage, 
    setGeneratedImage, 
    generateImage 
  } = useAIImageGeneration();
  
  const {
    isGenerating,
    processingStory,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  } = usePageContentApplier(currentPageData, updatePage, setCurrentPageData, onAddPage);

  // Enhanced version of generateImage that includes book context
  const generateImageWithContext = async (prompt: string, style: string = 'REALISTIC') => {
    if (currentBook && currentPageData) {
      return generateImage(prompt, style, currentBook.id, currentPageData.id);
    }
    return generateImage(prompt, style);
  };

  return {
    // Original functions for direct page updates
    isGenerating,
    processingStory,
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
    generateImage: generateImageWithContext
  };
}
