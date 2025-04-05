
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Helper function to check authentication
const checkAuthentication = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Upload an image to Supabase Storage with improved error handling and auth checks
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Check if image is already a URL (was previously uploaded)
    if (image.startsWith('https://') || image.startsWith('http://')) {
      console.log('Image is already a URL, skipping upload');
      return image;
    }
    
    // Verify authentication before attempting upload
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot upload image');
      toast.error('Please sign in to save images');
      return image; // Return original image as fallback
    }
    
    // Extract the base64 data from the string
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      console.log('Invalid base64 data in image');
      return image; // Return the original image to avoid breaking the UI
    }
    
    // Convert base64 to a Blob
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Generate a unique file path
    const filePath = `${bookId}/${pageId}_${Date.now()}.png`;
    
    console.log(`Uploading image to storage bucket: book_images/${filePath}`);
    
    // Upload to Supabase Storage with better error handling
    const { data, error } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      
      // Check for specific error types and provide appropriate messaging
      if (error.message?.includes('Permission denied') || error.message?.includes('Unauthorized')) {
        toast.error('Permission denied: Unable to save image to storage');
      } else if (error.message?.includes('Authentication required')) {
        toast.error('Authentication required to save images');
      } else {
        toast.warning('Failed to save image to cloud storage, but the image will still be visible in your book');
      }
      
      // IMPORTANT: Return the original image data so it's not lost
      return image;
    }
    
    // Return the public URL for the image
    const { data: urlData } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(data.path);
    
    console.log('Successfully uploaded image, URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image to storage', e);
    // Return the original image data as fallback
    toast.warning('Failed to save image to cloud storage, but the image will still be visible in your book');
    return image;
  }
};

// Upload audio to Supabase Storage with improved error handling and auth checks
export const uploadAudio = async (audioBlob: Blob, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Validate inputs
    if (!audioBlob || !bookId || !pageId) {
      toast.error('Missing required information for audio upload');
      return null;
    }

    // Verify authentication before attempting upload
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      console.error('User is not authenticated - cannot upload audio');
      toast.error('Please sign in to save narration audio');
      return null;
    }

    // Generate a unique file path
    const filePath = `${bookId}/${pageId}_narration.mp3`;
    
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
      
      // Check for specific error types and provide appropriate messaging
      if (error.message?.includes('Permission denied') || error.message?.includes('Unauthorized')) {
        toast.error('Permission denied: Unable to save narration to storage');
      } else if (error.message?.includes('Authentication required')) {
        toast.error('Authentication required to save narration');
      } else {
        toast.error('Failed to upload narration audio');
      }
      
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

// Delete images for a book from storage
export const deleteBookImages = async (bookId: string): Promise<void> => {
  try {
    // Verify authentication before attempting deletion
    const isAuthenticated = await checkAuthentication();
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
    const isAuthenticated = await checkAuthentication();
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
    const isAuthenticated = await checkAuthentication();
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
