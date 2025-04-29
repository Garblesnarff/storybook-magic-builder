
import { BookPage, DEFAULT_PAGE_TEXT } from '../../types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage, bookPageToDatabasePage } from './utils';
import { uploadImage, deletePageImages } from './storage/imageStorage';
import { deletePageNarration } from './storage/audioStorage';

// Function to add a new page to a book in Supabase
export const addPageToSupabase = async (bookId: string, pageNumber: number): Promise<BookPage | null> => {
  try {
    // Validate bookId
    if (!bookId) {
      console.error('Cannot add page: bookId is undefined or empty');
      toast.error('Failed to add page: Missing book ID');
      return null;
    }
    
    const pageId = uuidv4();
    
    // Initial imageSettings with default values
    const defaultImageSettings = {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    };
    
    // Insert the new page (use empty text by default)
    const { data, error } = await supabase
      .from('book_pages')
      .insert({
        id: pageId,
        book_id: bookId,
        page_number: pageNumber,
        text: DEFAULT_PAGE_TEXT, // Use empty text by default
        layout: 'text-left-image-right',
        image_settings: JSON.stringify(defaultImageSettings) // Store default image settings
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error adding page:', error);
      toast.error('Failed to add new page.');
      return null;
    }
    
    return databasePageToBookPage(data);
  } catch (e) {
    console.error('Failed to add page to Supabase', e);
    toast.error('Failed to add new page.');
    return null;
  }
};

// Function to update a page in a book in Supabase
export const updatePageInSupabase = async (bookId: string, page: BookPage): Promise<boolean> => {
  try {
    // Validate bookId
    if (!bookId) {
      console.error('Cannot update page: bookId is undefined or empty');
      toast.error('Failed to update page: Missing book ID');
      return false;
    }
    
    // Ensure page.bookId matches the provided bookId
    if (page.bookId !== bookId) {
      console.warn('Page bookId mismatch, using the provided bookId as source of truth');
      page.bookId = bookId;
    }
    
    console.log('Updating page in Supabase. Page data:', {
      id: page.id,
      bookId: page.bookId, // Log bookId to ensure it's correct
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

// Function to delete a page from a book in Supabase
export const deletePageFromSupabase = async (bookId: string, pageId: string): Promise<boolean> => {
  try {
    // Delete the page
    const { error } = await supabase
      .from('book_pages')
      .delete()
      .eq('id', pageId);
    
    if (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page.');
      return false;
    }
    
    // Delete any associated assets (image and narration)
    await deletePageImages(bookId, pageId);
    await deletePageNarration(bookId, pageId);
    
    return true;
  } catch (e) {
    console.error('Failed to delete page from Supabase', e);
    toast.error('Failed to delete page.');
    return false;
  }
};

// Function to reorder pages in a book in Supabase
export const reorderPagesInSupabase = async (bookId: string, pageOrdering: {id: string, pageNumber: number}[]): Promise<boolean> => {
  try {
    // Create an array of updates to perform
    const updates = pageOrdering.map(({id, pageNumber}) => ({
      id,
      book_id: bookId,
      page_number: pageNumber
    }));
    
    // Update all pages in a batch
    const { error } = await supabase
      .from('book_pages')
      .upsert(updates);
    
    if (error) {
      console.error('Error reordering pages:', error);
      toast.error('Failed to reorder pages.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to reorder pages in Supabase', e);
    toast.error('Failed to reorder pages.');
    return false;
  }
};
