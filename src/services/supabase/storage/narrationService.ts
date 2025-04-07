
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkAndRefreshAuthentication } from './auth';

/**
 * Upload audio to Supabase Storage with comprehensive error handling
 * @param audioBlob - The audio blob to upload
 * @param bookId - The book ID for organizing storage
 * @param pageId - The page ID for naming the file
 * @returns The public URL of the uploaded audio, or null if upload failed
 */
export const uploadAudio = async (audioBlob: Blob, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Validate inputs
    if (!audioBlob || !bookId || !pageId) {
      toast.error('Missing required information for audio upload');
      return null;
    }

    // Verify and refresh authentication before attempting upload
    const isAuthenticated = await checkAndRefreshAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot upload audio');
      toast.error('Please sign in to save narration audio');
      return null;
    }

    // Generate a unique file path with timestamp
    const filePath = `${bookId}/${pageId}_narration_${Date.now()}.mp3`;
    
    // Upload with improved error handling
    const { data, error } = await supabase
      .storage
      .from('narrations')
      .upload(filePath, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading audio:', error);
      
      // Try a second upload with a fresh session
      console.log('Attempting to refresh session and retry audio upload...');
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed before audio retry:', refreshError);
        toast.error('Authentication issue. Please sign in again');
        return null;
      }
      
      // Retry the upload with refreshed credentials
      const { data: retryData, error: retryError } = await supabase
        .storage
        .from('narrations')
        .upload(filePath, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: true,
          cacheControl: '3600'
        });
      
      if (retryError) {
        console.error('Retry audio upload failed:', retryError);
        toast.error('Failed to upload narration audio');
        return null;
      }
      
      // Get URL for the retry-uploaded file
      const { data: retryUrlData } = supabase
        .storage
        .from('narrations')
        .getPublicUrl(retryData.path);
      
      console.log('Successfully uploaded audio on retry, URL:', retryUrlData.publicUrl);
      return retryUrlData.publicUrl;
    }
    
    // Get the public URL for the uploaded audio
    const { data: urlData } = supabase
      .storage
      .from('narrations')
      .getPublicUrl(data.path);
    
    console.log("Audio uploaded, public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Unexpected error in audio upload:', e);
    toast.error('An unexpected error occurred while uploading audio');
    return null;
  }
};

/**
 * Delete narration audio for a page
 * @param bookId - The book ID
 * @param pageId - The page ID to delete narration for
 */
export const deletePageNarration = async (bookId: string, pageId: string): Promise<void> => {
  try {
    // Verify authentication before attempting deletion
    const isAuthenticated = await checkAndRefreshAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot delete narration');
      return;
    }
    
    const { data, error: listError } = await supabase
      .storage
      .from('narrations')
      .list(bookId, {
        search: pageId
      });
    
    if (!listError && data && data.length > 0) {
      const filesToDelete = data.map(file => `${bookId}/${file.name}`);
      
      await supabase
        .storage
        .from('narrations')
        .remove(filesToDelete);
    }
  } catch (storageError) {
    console.error('Error deleting page narration:', storageError);
    // Continue even if deletion fails
  }
};
