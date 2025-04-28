
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { useAITextGeneration } from './useAITextGeneration';
import { useAIImageGeneration } from './useAIImageGeneration';

// Helper function to create a deep copy of page data
const createPageCopy = (page: BookPage | null): BookPage | null => {
  if (!page) return null;
  return JSON.parse(JSON.stringify(page));
};

// Helper function to handle error toast and state restoration
const handleUpdateError = (
  error: unknown, 
  message: string, 
  originalPage: BookPage,
  setCurrentPageData: (page: BookPage | null) => void
) => {
  console.error(`Error ${message}:`, error);
  toast.error(`Failed to ${message}`);
  // Restore previous state on error
  setCurrentPageData(originalPage);
};

export function usePageContentApplier(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => Promise<void>, 
  setCurrentPageData: (page: BookPage | null) => void,
  // Explicitly mark as optional with ? so it's clearly undefined when not provided
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
        
        // Create updated page object - ensure it has all required properties
        const updatedPage: BookPage = {
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

  // Validate page data before operations
  const validatePageData = (): boolean => {
    if (!currentPageData) {
      toast.error('No page is selected');
      return false;
    }
    
    if (!currentPageData.bookId) {
      toast.error('Could not determine book ID');
      return false;
    }
    
    return true;
  };

  // Get image style from page formatting
  const getImageStyle = (): string => {
    if (!currentPageData || !currentPageData.textFormatting?.imageStyle) {
      return 'REALISTIC';
    }
    return currentPageData.textFormatting.imageStyle;
  };

  // Update page with new image
  const updatePageWithImage = async (imageUrl: string): Promise<void> => {
    if (!currentPageData) return;
    
    // Create a deep copy of the current page data
    const pageToUpdate = createPageCopy(currentPageData);
    if (!pageToUpdate) return;
    
    // Create updated page object with the new image
    const updatedPage: BookPage = {
      ...pageToUpdate,
      image: imageUrl
    };
    
    console.log('Updated page data before setting:', updatedPage);
    
    // Update local state first for immediate feedback
    setCurrentPageData(updatedPage);
    
    // Update in database
    try {
      console.log('Saving page with new image to database:', updatedPage);
      await updatePage(updatedPage);
      console.log('Database update complete for image');
      toast.success('Image applied to page');
    } catch (error) {
      handleUpdateError(error, 'save page with new image', currentPageData, setCurrentPageData);
    }
  };

  // Handle applying AI-generated image to the current page
  const handleApplyAIImage = async (prompt: string) => {
    if (!validatePageData()) return;
    
    setProcessingStory(true);
    try {
      // Safe to access currentPageData properties after validatePageData
      if (currentPageData) {
        console.log(`Generating image for page ${currentPageData.id} in book ${currentPageData.bookId}`);
        const imageStyle = getImageStyle();
        
        // Generate and upload the image, returning the storage URL
        const imageUrl = await generateImage(prompt, imageStyle, currentPageData.bookId, currentPageData.id);
        
        if (imageUrl) {
          console.log('Image URL from generation:', imageUrl);
          await updatePageWithImage(imageUrl);
        }
      }
    } catch (error) {
      console.error('Error applying AI image:', error);
      toast.error('Failed to apply generated image');
    } finally {
      setProcessingStory(false);
    }
  };

  // Validate page text for image generation
  const validatePageText = (): boolean => {
    if (!currentPageData?.text || currentPageData.text.trim() === '') {
      toast.error('Page has no text to generate an image from');
      return false;
    }
    return true;
  };

  // Generate image directly for the current page
  const handleGenerateImage = async () => {
    if (!validatePageData()) return;
    if (!validatePageText()) return;
    
    setIsGenerating(true);
    
    try {
      // Safe to access currentPageData after validation checks
      if (currentPageData) {
        const imageStyle = getImageStyle();
        
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
          await updatePageWithImage(imageUrl);
          toast.success('Image generated and applied to page');
        }
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
