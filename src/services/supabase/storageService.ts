import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Upload an image to Supabase Storage
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Extract the base64 data from the string
    const base64Data = image.split(',')[1];
    if (!base64Data) return null;
    
    // Convert base64 to a Blob
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Generate a unique file path
    const filePath = `${bookId}/${pageId}_${Date.now()}.png`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Return the public URL for the image
    const { data: urlData } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image to storage', e);
    return null;
  }
};

// Delete images for a book from storage
export const deleteBookImages = async (bookId: string): Promise<void> => {
  try {
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

// Upload audio to Supabase Storage
export const uploadAudio = async (audioBlob: Blob, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Validate inputs
    if (!audioBlob || !bookId || !pageId) {
      toast.error('Missing required information for audio upload');
      return null;
    }

    // Generate a unique file path
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

// Delete narration audio for a page
export const deletePageNarration = async (bookId: string, pageId: string): Promise<void> => {
  try {
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
