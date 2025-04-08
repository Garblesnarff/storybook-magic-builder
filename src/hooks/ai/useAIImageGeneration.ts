
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    try {
      console.log(`Generating image with prompt: "${prompt.substring(0, 30)}..." and style: ${imageStyle}`);
      
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt, 
          style: imageStyle
        })
      });

      // Check for errors in the response
      if (response.error) {
        console.error('Image generation error from edge function:', response.error);
        toast.error('Image generation failed', {
          description: response.error.message || 'Unknown error'
        });
        return null;
      }
      
      // Check for error in the data response
      if (response.data && response.data.error) {
        console.error('Image generation API error:', response.data.error);
        console.error('Error details:', response.data.details || 'No details provided');
        
        // Format a user-friendly error message
        const errorMessage = response.data.details || response.data.error;
        toast.error('Image generation failed', {
          description: errorMessage
        });
        return null;
      }

      // Check if image data is present
      if (!response.data || !response.data.image) {
        console.error('No image data returned from edge function');
        toast.error('Image generation failed', {
          description: 'No image was returned from the API'
        });
        return null;
      }

      // Format and return the image data
      const imageData = `data:image/png;base64,${response.data.image}`;
      console.log('Image generated successfully');
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
    isGeneratingImage,
    generatedImage,
    setGeneratedImage,
    generateImage
  };
}
