
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getStyleDescriptionById } from '@/types/book';

export function useAIImageGeneration() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC') => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);
    
    // Get the style description for the selected style
    const styleDescription = getStyleDescriptionById(imageStyle);
    
    try {
      toast.info(`Generating ${imageStyle.toLowerCase()} style image...`);
      
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
      
      // Make sure toast is called with the success message
      toast.success(`${imageStyle} image generated successfully!`);
      
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
    isGeneratingImage,
    generatedImage,
    setGeneratedImage,
    generateImage
  };
}
