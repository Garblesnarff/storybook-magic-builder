
import { BookPage } from '../../types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage, bookPageToDatabasePage } from './utils';
import { uploadImage, deletePageImages } from './storageService';

// Function to add a new page to a book in Supabase
export const addPageToSupabase = async (bookId: string, pageNumber: number): Promise<BookPage | null> => {
  try {
    const pageId = uuidv4();
    
    // Insert the new page
    const { data, error } = await supabase
      .from('book_pages')
      .insert({
        id: pageId,
        book_id: bookId,
        page_number: pageNumber,
        text: 'Once upon a time...',
        layout: 'text-left-image-right'
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
    // If page has a base64 image, upload it to storage
    if (page.image && page.image.startsWith('data:image')) {
      const imageUrl = await uploadImage(page.image, bookId, page.id);
      page.image = imageUrl || undefined;
    }
    
    // Update the page data
    const { error } = await supabase
      .from('book_pages')
      .update(bookPageToDatabasePage(page, bookId))
      .eq('id', page.id);
    
    if (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page.');
      return false;
    }
    
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
    
    // Delete any associated image
    await deletePageImages(bookId, pageId);
    
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
