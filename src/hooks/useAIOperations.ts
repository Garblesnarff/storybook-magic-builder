
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { useAITextGeneration } from './ai/useAITextGeneration';
import { useAIImageGeneration } from './ai/useAIImageGeneration';
import { usePageContentApplier } from './ai/usePageContentApplier';

export function useAIOperations(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => void, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<void>
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
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  } = usePageContentApplier(currentPageData, updatePage, setCurrentPageData, onAddPage);

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
