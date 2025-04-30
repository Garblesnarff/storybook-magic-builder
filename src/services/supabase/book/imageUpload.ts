
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to upload an image to Supabase storage
 */
export const uploadImageToSupabase = async (file: File, userId: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    const filePath = `images/${userId}/${bookId}/${pageId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Construct public URL
    const publicUrl = `https://your-supabase-url/storage/v1/object/public/book-images/${filePath}`; // Replace with your Supabase URL
    return publicUrl;
  } catch (error) {
    console.error('Error during image upload:', error);
    return null;
  }
};
