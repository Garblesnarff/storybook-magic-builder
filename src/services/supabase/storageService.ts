import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Helper function to check authentication
const checkAuthentication = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Upload an image to Supabase Storage with comprehensive error handling
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
    
    // Generate a unique file path
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
      
      // Specific error handling with detailed messages
      if (error.message?.includes('Permission denied')) {
        toast.error('Permission denied: Unable to save image');
      } else if (error.message?.includes('Unauthorized')) {
        toast.error('Authentication required to save images');
      } else {
        toast.error('Failed to save image to cloud storage');
      }
      
      return null;
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
      
      // Specific error handling for audio uploads
      if (error.message?.includes('Permission denied')) {
        toast.error('Permission denied: Unable to save narration');
      } else if (error.message?.includes('Unauthorized')) {
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
    console.error('Unexpected error in audio upload:', e);
    toast.error('An unexpected error occurred while uploading audio');
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
