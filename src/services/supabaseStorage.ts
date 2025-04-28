import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * This file contains utility functions for Supabase storage operations.
 * It provides a centralized way to handle file uploads, downloads, and deletions.
 */

// Upload a file to Supabase Storage
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File | Blob,
  contentType?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: contentType || file.type,
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload file to storage:', e);
    toast.error('Failed to upload file');
    return null;
  }
};

// Delete a file from Supabase Storage
export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([filePath]);
      
    if (error) {
      console.error(`Error deleting file: ${filePath}`, error);
      toast.error('Failed to delete file');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error deleting file:', e);
    toast.error('Failed to delete file');
    return false;
  }
};

// Get a public URL for a file in Supabase Storage
export const getPublicUrl = (
  bucket: string,
  filePath: string
): string => {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Check if a file exists in Supabase Storage
export const fileExists = async (
  bucket: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });
    
    if (error) {
      console.error('Error checking if file exists:', error);
      return false;
    }
    
    return data.length > 0;
  } catch (e) {
    console.error('Error checking if file exists:', e);
    return false;
  }
};
