
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { verifyImageUrl } from '@/utils/imageVerification';

export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('Upload attempted without authentication');
      toast.error('Please sign in to upload images');
      return null;
    }

    console.log(`Starting image upload for book ${bookId}, page ${pageId}`);
    
    if (image.startsWith('http')) {
      console.log('Image is already a URL, skipping upload');
      return image;
    }

    const blob = await fetch(image).then(res => res.blob());
    const filePath = `${bookId}/${pageId}.png`;
    
    console.log('Uploading to path:', filePath);
    
    const { error: uploadError, data: uploadData } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '0'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload completed but no path returned');
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
    
    try {
      await verifyImageUrl(cacheBustedUrl);
      console.log('Image URL successfully verified');
      return cacheBustedUrl;
    } catch (verifyError) {
      console.error('Image verification failed after upload:', verifyError);
      toast.error('Image uploaded but verification failed. Trying again...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        await verifyImageUrl(cacheBustedUrl);
        console.log('Image URL verified on second attempt');
        return cacheBustedUrl;
      } catch (retryError) {
        console.error('Second verification attempt failed:', retryError);
        throw new Error('Image verification failed after multiple attempts');
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Image upload failed:', errorMessage);
    toast.error('Failed to upload image', { description: errorMessage });
    return null;
  }
};
