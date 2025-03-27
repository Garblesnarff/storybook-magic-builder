
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAIOperations(currentPageData: BookPage | null, updatePage: (page: BookPage) => void, setCurrentPageData: (page: BookPage | null) => void) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!currentPageData) return;
    setIsGenerating(true);

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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAIText = (text: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, text };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleApplyAIImage = (imageData: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  return {
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
