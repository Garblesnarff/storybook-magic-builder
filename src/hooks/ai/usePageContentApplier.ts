
import { useState, useCallback } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function usePageContentApplier(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<void>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!currentPageData) return;
    setIsGenerating(true);

    try {
      const style = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: currentPageData.text, 
          style 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Failed to generate image', {
          description: errorData.error || 'Unknown error'
        });
        return;
      }

      const data = await response.json();
      const updatedPage = { 
        ...currentPageData, 
        image: `data:image/png;base64,${data.image}` 
      };
      
      await updatePage(updatedPage);
      setCurrentPageData(updatedPage);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to wait for a specific duration
  const wait = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  // Helper function to get book ID from a page ID
  const getBookIdForPage = useCallback(async (pageId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('book_pages')
        .select('book_id')
        .eq('id', pageId)
        .single();
      
      if (error || !data) {
        console.error('Error getting book ID from page:', error);
        return null;
      }
      
      return data.book_id;
    } catch (err) {
      console.error('Error in getBookIdForPage function:', err);
      return null;
    }
  }, []);

  // Handle AI text application with improved reliability
  const handleApplyAIText = useCallback(async (text: string) => {
    if (!currentPageData) return;
    
    // Define the page break marker
    const pageBreakMarker = '---PAGE BREAK---';
    
    // Split the text by page break markers
    const segments = text.split(pageBreakMarker)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
    
    if (segments.length === 0) {
      toast.error('No valid content found in the generated text');
      return;
    }

    console.log('Processing AI text with segments:', segments.length);
    setProcessingStory(true);
    
    try {
      // Start progress toast with initial state that won't disappear
      const toastId = toast.loading(`Processing pages: 0/${segments.length}`, {
        duration: Infinity
      });
      
      // Get the book ID first - we'll need this for all operations
      const bookId = await getBookIdForPage(currentPageData.id);
      
      if (!bookId) {
        toast.error('Could not determine which book to update', { id: toastId });
        setProcessingStory(false);
        return;
      }
      
      // Step 1: Update the first page (current page) directly
      const firstSegment = segments[0];
      
      // Update first page in memory immediately for UI feedback
      const updatedFirstPage = { 
        ...currentPageData, 
        text: firstSegment 
      };
      setCurrentPageData(updatedFirstPage);
      
      // Update first page directly
      const { error: firstPageError } = await supabase
        .from('book_pages')
        .update({ 
          text: firstSegment,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPageData.id);
      
      if (firstPageError) {
        console.error('Error updating first page:', firstPageError);
        toast.error('Failed to update first page', { id: toastId });
        setProcessingStory(false);
        return;
      }
      
      // Call the update function to ensure local state is updated
      await updatePage(updatedFirstPage);
      
      // Wait to ensure database update has time to process
      await wait(500);
      
      // Update progress toast
      toast.loading(`Processing pages: 1/${segments.length}`, { id: toastId });
      
      // If there are more segments, handle them sequentially
      if (segments.length > 1 && onAddPage) {
        // Process remaining segments one by one
        for (let i = 1; i < segments.length; i++) {
          try {
            // Create a new page
            await onAddPage();
            
            // Get all pages, sorted by page number
            const { data: allPages } = await supabase
              .from('book_pages')
              .select('id, page_number')
              .eq('book_id', bookId)
              .order('page_number', { ascending: true });
              
            if (!allPages || allPages.length <= i) {
              console.error(`Not enough pages found for segment ${i+1}`);
              continue;
            }
            
            // Find the page with the highest page number
            const newPageId = allPages[allPages.length - 1].id;
            
            // Update the page with content
            const { error } = await supabase
              .from('book_pages')
              .update({ 
                text: segments[i],
                updated_at: new Date().toISOString()
              })
              .eq('id', newPageId);
              
            if (error) {
              console.error(`Error updating page ${newPageId}:`, error);
            }
            
            // Allow database time to process
            await wait(500);
            
            // Update progress toast
            toast.loading(`Processing pages: ${i+1}/${segments.length}`, { id: toastId });
          } catch (err) {
            console.error(`Error processing page ${i+1}:`, err);
          }
        }
        
        toast.success(`Created ${segments.length} pages with content`, { id: toastId });
      } else {
        toast.success('Story applied to the current page', { id: toastId });
      }
    } catch (error) {
      console.error('Error applying AI text:', error);
      toast.error('Failed to create all pages', {
        description: 'Some pages may not have been created correctly'
      });
    } finally {
      setProcessingStory(false);
    }
  }, [currentPageData, updatePage, setCurrentPageData, getBookIdForPage, wait, onAddPage]);

  // Handle AI image application
  const handleApplyAIImage = useCallback(async (imageData: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    await updatePage(updatedPage);
  }, [currentPageData, setCurrentPageData, updatePage]);

  return {
    isGenerating,
    processingStory,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
