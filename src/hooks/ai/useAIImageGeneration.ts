
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadImage } from '@/services/supabase/storageService';

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
      
      if (bookId && pageId) {
        console.log(`Image will be saved with consistent name for book: ${bookId}, page: ${pageId}`);
      }
      
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

      // Format the base64 image data
      const imageData = `data:image/png;base64,${response.data.image}`;
      console.log('Image generated successfully');
      setGeneratedImage(imageData);
      
      // If book ID and page ID are provided, upload to storage
      if (bookId && pageId) {
        console.log(`Uploading image with consistent filename for page ${pageId}`);
        const imageUrl = await uploadImage(imageData, bookId, pageId);
        
        if (imageUrl) {
          console.log('Image uploaded successfully with consistent filename:', imageUrl);
          // Return the public URL instead of the base64 data
          toast.success('Image generated and uploaded successfully!');
          return imageUrl;
        } else {
          console.error('Failed to upload image to storage');
          toast.error('Image upload failed', {
            description: 'Generated image could not be saved to storage'
          });
          // Still return the base64 data so the user can see the image
          return imageData;
        }
      } else {
        toast.success('Image generated successfully!');
        return imageData;
      }
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
