
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { bookPageToDatabasePage } from '../utils';
import { uploadImage } from '../storage/imageStorage';

/**
 * Function to update a page in a book in Supabase
 */
export const updatePageInSupabase = async (bookId: string, page: BookPage): Promise<boolean> => {
  try {
    console.log('Updating page in Supabase. Page data:', {
      id: page.id,
      text: page.text?.substring(0, 30) + '...',
      layout: page.layout,
      hasImage: !!page.image,
      imageUrl: page.image ? page.image.substring(0, 30) + '...' : 'none' 
    });
    
    // Track if we need to upload image
    let finalImageUrl = page.image;
    
    // If page has a base64 image, upload it to storage
    if (page.image && page.image.startsWith('data:image')) {
      console.log('Base64 image detected, uploading to storage...');
      const imageUrl = await uploadImage(page.image, bookId, page.id);
      
      if (!imageUrl) {
        console.error('Failed to upload image to storage');
        toast.error('Failed to save image. Please try again.');
        return false;
      }
      
      console.log('Image upload successful:', imageUrl?.substring(0, 40) + '...');
      finalImageUrl = imageUrl;
    }
    
    // Create a copy of the page with the updated image URL
    const pageToUpdate = {
      ...page,
      image: finalImageUrl
    };
    
    // Convert page to database format
    const dbPage = bookPageToDatabasePage(pageToUpdate, bookId);
    
    console.log('Converted page for database. Ready to save to Supabase.');
    
    // Update the page data
    const { error } = await supabase
      .from('book_pages')
      .update(dbPage)
      .eq('id', page.id);
    
    if (error) {
      console.error('Error updating page in database:', error);
      toast.error('Failed to update page in database.');
      return false;
    }
    
    console.log('Page successfully updated in database');
    return true;
  } catch (e) {
    console.error('Failed to update page in Supabase', e);
    toast.error('Failed to update page.');
    return false;
  }
};
