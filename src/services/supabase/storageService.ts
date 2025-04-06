
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Enhanced helper function to check authentication with retry mechanism
const checkAndRefreshAuthentication = async (): Promise<boolean> => {
  // First check for current session
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error checking session:', error);
    return false;
  }
  
  if (!data.session) {
    console.log('No session found. Attempting to refresh...');
    
    // Try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      console.error('Failed to refresh session:', refreshError);
      toast.error('Authentication expired. Please sign in again.');
      return false;
    }
    
    console.log('Session refreshed successfully');
    return true;
  }
  
  // Session exists but let's make sure token is fresh
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    console.error('Failed to refresh existing session:', refreshError);
    return false;
  }
  
  return true;
};

// Function to get current auth status (for debugging)
const logAuthStatus = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    console.log('Current auth status: Authenticated as', data.session.user.id);
    console.log('Token expires at:', new Date(data.session.expires_at! * 1000).toISOString());
  } else {
    console.log('Current auth status: Not authenticated');
  }
};

// We don't need to create buckets anymore as they're created via SQL
export const ensureStorageBuckets = async (): Promise<void> => {
  // This function now just exists for backward compatibility
  console.log('Storage buckets are pre-configured via SQL migration');
};

// Upload an image to Supabase Storage with comprehensive error handling and session management
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Check if image is already a URL (was previously uploaded)
    if (image.startsWith('https://') || image.startsWith('http://')) {
      console.log('Image is already a URL, skipping upload');
      return image;
    }
    
    // Log current auth status before attempting upload
    await logAuthStatus();
    
    // Verify and refresh authentication before attempting upload
    const isAuthenticated = await checkAndRefreshAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot upload image');
      toast.error('Please sign in to save images');
      return null;
    }
    
    // Ensure bookId and pageId exist
    if (!bookId || !pageId) {
      console.error('Missing bookId or pageId for image upload');
      toast.error('Invalid book or page information');
      return null;
    }
    
    // Extract the base64 data from the string
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      console.error('Invalid base64 image format');
      toast.error('Image format is invalid');
      return null;
    }
    
    const [, fileType, base64Data] = base64Match;
    
    // Convert base64 to a Blob
    const blob = await fetch(`data:image/${fileType};base64,${base64Data}`).then(res => res.blob());
    
    // Generate a unique file path with timestamp to avoid collisions
    const filePath = `${bookId}/${pageId}_${Date.now()}.${fileType}`;
    
    console.log(`Uploading image to storage bucket: book_images/${filePath}`);
    
    // Upload to Supabase Storage with enhanced error handling
    const { data, error } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: `image/${fileType}`,
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      
      // Try a second upload with a fresh session
      console.log('Attempting to refresh session and retry upload...');
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed before retry:', refreshError);
        toast.error('Authentication issue. Please sign in again');
        return null;
      }
      
      console.log('Session refreshed, retrying upload...');
      
      // Retry the upload with refreshed credentials
      const { data: retryData, error: retryError } = await supabase
        .storage
        .from('book_images')
        .upload(filePath, blob, {
          contentType: `image/${fileType}`,
          upsert: true,
          cacheControl: '3600'
        });
      
      if (retryError) {
        console.error('Retry upload failed:', retryError);
        toast.error('Failed to save image to storage');
        
        // Return the image as base64 for now, so the UI still shows it
        return image;
      }
      
      // Get URL for the retry-uploaded file
      const { data: retryUrlData } = supabase
        .storage
        .from('book_images')
        .getPublicUrl(retryData.path);
      
      console.log('Successfully uploaded image on retry, URL:', retryUrlData.publicUrl);
      return retryUrlData.publicUrl;
    }
    
    // Retrieve and return the public URL for the image
    const { data: urlData } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(data.path);
    
    console.log('Successfully uploaded image, URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Unexpected error in image upload:', e);
    toast.error('An unexpected error occurred while uploading the image');
    return null;
  }
};

// Upload audio to Supabase Storage with comprehensive error handling
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

// Delete images for a book from storage
export const deleteBookImages = async (bookId: string): Promise<void> => {
  try {
    // Verify authentication before attempting deletion
    const isAuthenticated = await checkAndRefreshAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot delete images');
      return;
    }
    
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('book_images')
      .list(bookId);
    
    if (!storageError && storageData && storageData.length > 0) {
      const filesToDelete = storageData.map(file => `${bookId}/${file.name}`);
      
      await supabase
        .storage
        .from('book_images')
        .remove(filesToDelete);
    }
  } catch (e) {
    console.error('Failed to delete book images from storage', e);
  }
};

// Delete page images from storage
export const deletePageImages = async (bookId: string, pageId: string): Promise<void> => {
  try {
    // Verify authentication before attempting deletion
    const isAuthenticated = await checkAndRefreshAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot delete page images');
      return;
    }
    
    const { data, error: listError } = await supabase
      .storage
      .from('book_images')
      .list(bookId, {
        search: pageId
      });
    
    if (!listError && data && data.length > 0) {
      const filesToDelete = data.map(file => `${bookId}/${file.name}`);
      
      await supabase
        .storage
        .from('book_images')
        .remove(filesToDelete);
    }
  } catch (storageError) {
    console.error('Error deleting page images:', storageError);
    // Continue even if image deletion fails
  }
};

// Delete narration audio for a page
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
