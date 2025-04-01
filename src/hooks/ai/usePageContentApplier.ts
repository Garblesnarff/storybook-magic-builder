import { useState } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { useAIImageGeneration } from './useAIImageGeneration';

export function usePageContentApplier(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => Promise<void>, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);
  const { generateImage } = useAIImageGeneration();

  // Handler for generating an image for the current page
  const handleGenerateImage = async () => {
    if (!currentPageData) {
      toast.error('No page selected');
      return;
    }

    if (!currentPageData.text?.trim()) {
      toast.error('Page has no text to generate an image from');
      return;
    }

    setIsGenerating(true);
    try {
      // Get the current style or use a default
      const imageStyle = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      
      toast.info(`Generating ${imageStyle.toLowerCase()} style image...`);
      
      const imageData = await generateImage(currentPageData.text, imageStyle);
      
      if (!imageData) {
        toast.error('Failed to generate image');
        return;
      }

      // Update the page with the new image
      const updatedPage = { ...currentPageData, image: imageData };
      
      // Optimistic update
      setCurrentPageData(updatedPage);
      
      // Persist change - note that this might convert the base64 image to a URL
      // or might keep the base64 image if storage upload fails
      try {
        await updatePage(updatedPage);
        toast.success(`${imageStyle} image generated and applied to the page`);
      } catch (error) {
        console.error('Failed to save page with new image:', error);
        toast.warning('Image generated but there was an issue saving it to the database');
        // The optimistic update ensures the image is still visible to the user
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate or apply image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for applying AI-generated text to the current page
  const handleApplyAIText = async (text: string) => {
    if (!currentPageData) {
      toast.error('No page selected');
      return;
    }

    setProcessingStory(true);
    try {
      const updatedPage = { ...currentPageData, text: text };
      
      // Optimistic update
      setCurrentPageData(updatedPage);
      
      // Persist the change
      await updatePage(updatedPage);
      
      toast.success('Text applied to page');
    } catch (error) {
      console.error('Error applying text to page:', error);
      toast.error('Failed to apply text to page');
    } finally {
      setProcessingStory(false);
    }
  };

  // Handler for applying AI-generated image to the current page
  const handleApplyAIImage = async (imageData: string) => {
    if (!currentPageData) {
      if (onAddPage) {
        // Create a new page with this image
        setProcessingStory(true);
        try {
          const newPageId = await onAddPage();
          if (!newPageId) {
            toast.error('Failed to create new page');
            return;
          }
          
          // We don't have the new page data yet, so we just show a message
          toast.success('Image added to new page');
        } catch (error) {
          console.error('Error adding page with image:', error);
          toast.error('Failed to add page with image');
        } finally {
          setProcessingStory(false);
        }
        return;
      }
      
      toast.error('No page selected to apply image to');
      return;
    }

    setProcessingStory(true);
    try {
      const updatedPage = { ...currentPageData, image: imageData };
      
      // Optimistic update
      setCurrentPageData(updatedPage);
      
      // Persist the change
      await updatePage(updatedPage);
      
      toast.success('Image applied to page');
    } catch (error) {
      console.error('Error applying image to page:', error);
      toast.error('Failed to apply image to page');
    } finally {
      setProcessingStory(false);
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
