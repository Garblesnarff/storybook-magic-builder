
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
    
    console.log('Attempting to upload audio file:', {
      bucket: 'narrations',
      path: filePath,
      size: audioBlob.size,
      type: audioBlob.type
    });

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
      toast.error(`Failed to upload narration: ${error.message}`);
      
      // Additional logging for debugging RLS issues
      if (error.message?.includes('new row violates row-level security')) {
        console.error('Row Level Security violation. Make sure the narrations bucket has proper policies.');
        toast.error('Storage permission denied. Please contact support.');
      }
      
      return null;
    }
    
    if (!data) {
      console.error('No data returned from upload');
      toast.error('Failed to upload narration: No data returned');
      return null;
    }
    
    // Get the public URL for the uploaded audio
    const { data: urlData } = supabase
      .storage
      .from('narrations')
      .getPublicUrl(data.path);
    
    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL');
      toast.error('Failed to get access to the narration');
      return null;
    }
    
    console.log("Audio uploaded successfully, public URL:", urlData.publicUrl);
    toast.success('Narration saved successfully');
    return urlData.publicUrl;
  } catch (e) {
    const error = e as Error;
    console.error('Failed to upload audio to storage:', error);
    toast.error(`Failed to save narration audio: ${error.message || 'Unknown error'}`);
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
    const filePath = `${bookId}/${pageId}_narration.mp3`;
    console.log('Attempting to delete audio file:', filePath);
    
    const { error: deleteError } = await supabase
      .storage
      .from('narrations')
      .remove([filePath]);
      
    if (deleteError) {
      console.error(`Error deleting page narration: ${filePath}`, deleteError);
      toast.error('Failed to delete narration');
    } else {
      console.log(`Successfully deleted narration for page ${pageId}`);
      toast.success('Narration deleted successfully');
    }
  } catch (storageError) {
    console.error('Error deleting page narration:', storageError);
    toast.error('Failed to delete narration');
  }
};
