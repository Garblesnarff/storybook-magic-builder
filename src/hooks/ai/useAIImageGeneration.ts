
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadImage } from '@/services/supabase/storage';

export function useAIImageGeneration() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC', bookId?: string, pageId?: string) => {
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
      if (response.error || !response.data || !response.data.image) {
        const errorDetails = response.error?.message || 'No image data returned';
        console.error('Image generation failed:', errorDetails);
        toast.error('Image generation failed', {
          description: errorDetails
        });
        return null;
      }

      // Format the base64 image data
      const imageData = `data:image/png;base64,${response.data.image}`;
      console.log('Image generated successfully');
      setGeneratedImage(imageData);
      
      // If book ID and page ID are provided, upload to storage
      if (bookId && pageId) {
        const imageUrl = await uploadImage(imageData, bookId, pageId);
        
        if (imageUrl) {
          toast.success('Image generated and saved successfully!');
          return imageUrl;
        } else {
          toast.error('Image generated but could not be saved');
          return imageData;
        }
      }

      toast.success('Image generated successfully!');
      return imageData;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Image generation failed');
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
