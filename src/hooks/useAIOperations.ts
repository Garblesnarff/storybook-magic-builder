
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAIOperations(currentPageData: BookPage | null, updatePage: (page: BookPage) => void, setCurrentPageData: (page: BookPage | null) => void) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

  const generateText = async (prompt: string, temperature: number = 0.7, maxTokens: number = 800) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingText(true);
    setGeneratedText('');

    try {
      const response = await supabase.functions.invoke('generate-text', {
        body: JSON.stringify({ 
          prompt, 
          temperature,
          maxTokens
        })
      });

      if (response.error) {
        toast.error('Text generation failed', {
          description: response.error.message
        });
        console.error('Text generation error:', response.error);
        return null;
      }

      setGeneratedText(response.data.text);
      toast.success('Text generated successfully!');
      return response.data.text;
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('Text generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsGeneratingText(false);
    }
  };

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC') => {
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
