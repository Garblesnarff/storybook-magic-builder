
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { useAITextGeneration } from './useAITextGeneration';
import { useAIImageGeneration } from './useAIImageGeneration';

export function usePageContentApplier(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => Promise<void>, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);
  
  const { generateText } = useAITextGeneration();
  const { generateImage } = useAIImageGeneration();

  // Handle applying AI-generated text to the current page
  const handleApplyAIText = async (prompt: string) => {
    if (!currentPageData) {
      toast.error('No page is selected');
      return;
    }
    
    setProcessingStory(true);
    try {
      const generatedText = await generateText(prompt);
      
      if (generatedText) {
        console.log('Applying generated text to page:', currentPageData.id);
        
        // Create updated page object
        const updatedPage = {
          ...currentPageData,
          text: generatedText
        };
        
        // Update local state first for immediate feedback
        setCurrentPageData(updatedPage);
        
        // Update in database
        await updatePage(updatedPage);
        
        toast.success('Story applied to page');
      }
    } catch (error) {
      console.error('Error applying AI text:', error);
      toast.error('Failed to apply generated text');
    } finally {
      setProcessingStory(false);
    }
  };

  // Handle applying AI-generated image to the current page
  const handleApplyAIImage = async (prompt: string) => {
    if (!currentPageData) {
      toast.error('No page is selected');
      return;
    }
    
    setProcessingStory(true);
    try {
      if (!currentPageData.bookId) {
        toast.error('Could not determine book ID');
        return;
      }
      
      console.log(`Generating image for page ${currentPageData.id} in book ${currentPageData.bookId}`);
      const imageStyle = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      
      // Generate and upload the image, returning the storage URL
      const imageUrl = await generateImage(prompt, imageStyle, currentPageData.bookId, currentPageData.id);
      
      if (imageUrl) {
        console.log('Image URL from generation:', imageUrl);
        
        // Create updated page object
        const updatedPage = {
          ...currentPageData,
          image: imageUrl
        };
        
        // Update local state first for immediate feedback
        setCurrentPageData(updatedPage);
        
        // Update in database
        await updatePage(updatedPage);
        
        toast.success('Image applied to page');
      }
    } catch (error) {
      console.error('Error applying AI image:', error);
      toast.error('Failed to apply generated image');
    } finally {
      setProcessingStory(false);
    }
  };

  // Generate image directly for the current page
  const handleGenerateImage = async () => {
    if (!currentPageData) {
      toast.error('No page is selected');
      return;
    }
    
    if (!currentPageData.text || currentPageData.text.trim() === '') {
      toast.error('Page has no text to generate an image from');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      if (!currentPageData.bookId) {
        toast.error('Could not determine book ID');
        return;
      }
      
      const imageStyle = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      
      console.log(`Generating image directly for page ${currentPageData.id} with style ${imageStyle}`);
      
      // Generate and upload the image, returning the storage URL
      const imageUrl = await generateImage(
        currentPageData.text,
        imageStyle,
        currentPageData.bookId,
        currentPageData.id
      );
      
      if (imageUrl) {
        console.log('Generated image URL:', imageUrl);
        
        // Create updated page object
        const updatedPage = {
          ...currentPageData,
          image: imageUrl
        };
        
        // Update local state first for immediate feedback
        setCurrentPageData(updatedPage);
        
        // Update in database
        await updatePage(updatedPage);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    processingStory,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
