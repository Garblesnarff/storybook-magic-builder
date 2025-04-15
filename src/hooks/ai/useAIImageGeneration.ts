
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

    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to generate images');
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

      if (response.error || !response.data || !response.data.image) {
        throw new Error(response.error?.message || 'No image data returned');
      }

      const imageData = `data:image/png;base64,${response.data.image}`;
      console.log('Image generated successfully');
      setGeneratedImage(imageData);
      
      // If book ID and page ID are provided, upload to storage
      if (bookId && pageId) {
        const imageUrl = await uploadImage(imageData, bookId, pageId);
        if (!imageUrl) {
          throw new Error('Failed to upload image to storage');
        }
        toast.success('Image generated and saved successfully!');
        return imageUrl;
      }

      toast.success('Image generated successfully!');
      return imageData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Image generation error:', errorMessage);
      toast.error('Image generation failed', {
        description: errorMessage
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
