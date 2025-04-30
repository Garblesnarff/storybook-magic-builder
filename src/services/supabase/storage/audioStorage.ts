
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload audio to Supabase Storage
 * @param audioBlob Audio blob data
 * @param bookId The book ID
 * @param pageId The page ID
 * @returns The public URL of the uploaded audio or null if upload failed
 */
export const uploadAudio = async (audioBlob: Blob, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Validate inputs
    if (!audioBlob || !bookId || !pageId) {
      toast.error('Missing required information for audio upload');
      return null;
    }

    // Generate a consistent file path for audio
    const filePath = `${bookId}/${pageId}_narration.mp3`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('narrations')
      .upload(filePath, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload narration audio');
      return null;
    }
    
    // Get the public URL for the uploaded audio
    const { data: urlData } = supabase
      .storage
      .from('narrations')
      .getPublicUrl(data.path);
    
    console.log("Audio uploaded, public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload audio to storage', e);
    toast.error('Failed to save narration audio');
    return null;
  }
};

/**
 * Delete narration audio for a page
 * @param bookId The book ID
 * @param pageId The page ID
 */
export const deletePageNarration = async (bookId: string, pageId: string): Promise<void> => {
  try {
    // Just delete the consistent filename
    const filePath = `${bookId}/${pageId}_narration.mp3`;
    
    const { error: deleteError } = await supabase
      .storage
      .from('narrations')
      .remove([filePath]);
      
    if (deleteError) {
      console.error(`Error deleting page narration: ${filePath}`, deleteError);
    } else {
      console.log(`Successfully deleted narration for page ${pageId}`);
    }
  } catch (storageError) {
    console.error('Error deleting page narration:', storageError);
    // Continue even if deletion fails
  }
};
