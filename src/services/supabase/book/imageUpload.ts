
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Function to upload an image to Supabase storage
 */
export const uploadImageToSupabase = async (file: File, userId: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    const filePath = `images/${userId}/${bookId}/${pageId}/${file.name}`;
    
    console.log('Uploading image to path:', filePath);
    
    const { data, error } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Use upsert to overwrite existing files with the same path
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', {
        description: error.message
      });
      return null;
    }

    // Use the Supabase client to get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('book-images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      console.error('Failed to generate public URL');
      toast.error('Failed to generate image URL');
      return null;
    }

    console.log('Image successfully uploaded. Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error during image upload:', errorMessage);
    toast.error('Failed to upload image', {
      description: errorMessage
    });
    return null;
  }
};
