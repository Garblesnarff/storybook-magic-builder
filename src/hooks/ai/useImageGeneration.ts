
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useImageGeneration() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerateImage = async (
    currentPageData: BookPage | null,
    updatePage: (page: BookPage) => void,
    setCurrentPageData: (page: BookPage | null) => void
  ) => {
    if (!currentPageData) return;
    
    try {
      const style = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt: currentPageData.text, 
          style 
        })
      });

      if (response.error) {
        toast.error('Failed to generate image', {
          description: response.error.message
        });
        return;
      }

      const updatedPage = { 
        ...currentPageData, 
        image: `data:image/png;base64,${response.data.image}` 
      };
      
      updatePage(updatedPage);
      setCurrentPageData(updatedPage);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC'): Promise<string | null> => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt, 
          style: imageStyle
        })
      });

      if (response.error) {
        toast.error('Image generation failed', {
          description: response.error.message
        });
        console.error('Image generation error:', response.error);
        return null;
      }

      const imageData = `data:image/png;base64,${response.data.image}`;
      setGeneratedImage(imageData);
      toast.success('Image generated successfully!');
      return imageData;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Image generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleApplyAIImage = (
    imageData: string,
    currentPageData: BookPage | null,
    updatePage: (page: BookPage) => void,
    setCurrentPageData: (page: BookPage | null) => void
  ) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  return {
    isGeneratingImage,
    generatedImage,
    setGeneratedImage,
    handleGenerateImage,
    generateImage,
    handleApplyAIImage
  };
}
