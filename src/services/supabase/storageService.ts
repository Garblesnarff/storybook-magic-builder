import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Upload an image to Supabase Storage
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Check if image is already a URL (was previously uploaded)
    if (image.startsWith('https://') || image.startsWith('http://')) {
      console.log('Image is already a URL, skipping upload');
      return image;
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
    
    // Check if the bucket exists, if not create it 
    const { data: buckets } = await supabase.storage.listBuckets();
    const bookImagesBucket = buckets?.find(bucket => bucket.name === 'book_images');
    
    if (!bookImagesBucket) {
      // Try to create the bucket
      console.log('Book images bucket not found, attempting to create it');
      const { error: createError } = await supabase.storage.createBucket('book_images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        toast.warning('Failed to create storage bucket, using fallback method');
        return image; // Return original image as fallback
      }
    }
    
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
      
      // IMPORTANT: Return the original image data so it's not lost
      // This allows image to still be displayed even if storage upload fails
      toast.warning('Failed to save image to cloud storage, but the image will still be visible in your book');
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
