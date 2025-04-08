
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { useAITextGeneration } from './ai/useAITextGeneration';
import { useAIImageGeneration } from './ai/useAIImageGeneration';
import { usePageContentApplier } from './ai/usePageContentApplier';

export function useAIOperations(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => Promise<void>, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined> // Update expected return type
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
    generateImage
  };
}
