
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadImage } from '@/services/supabase/storage';

export function useAIImageGeneration() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC', bookId?: string, pageId?: string) => {
    // Validate input
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    // Verify authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please sign in to generate images');
      return null;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      console.log('Generating image with prompt:', prompt.substring(0, 50));
      
      // Generate image
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ prompt, style: imageStyle })
      });

      if (!response.data?.image) {
        throw new Error('No image data received from generation service');
      }

      const imageData = `data:image/png;base64,${response.data.image}`;
      setGeneratedImage(imageData);
      
      // Upload to storage if book and page IDs provided
      if (bookId && pageId) {
        console.log('Uploading generated image to storage...');
        const imageUrl = await uploadImage(imageData, bookId, pageId);
        
        if (!imageUrl) {
          throw new Error('Failed to save image to storage');
        }
        
        toast.success('Image generated and saved successfully');
        return imageUrl;
      }

      toast.success('Image generated successfully');
      return imageData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Image generation failed:', errorMessage);
      toast.error('Failed to generate image', {
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
