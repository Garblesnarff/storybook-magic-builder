
import { useState, useCallback } from 'react';
// Import missing types and DEFAULT_PAGE
import { BookPage, PageLayout, TextFormatting, ImageSettings, DEFAULT_PAGE } from '@/types/book'; 
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function usePageContentApplier(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined> // Update expected return type
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!currentPageData) return;
    setIsGenerating(true);

    try {
      const style = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      // Use the direct Supabase function invocation to avoid CSP issues
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: currentPageData.text, 
          style 
        },
      });

      if (error) {
        toast.error('Failed to generate image', {
          description: error.message || 'Unknown error'
        });
        return;
      }

      if (!data || !data.image) {
        toast.error('No image data returned');
        return;
      }

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
      
      // --- REMOVED Special handling for the first page ---
      
      // Update progress toast (start from 0)
      toast.loading(`Processing pages: 0/${segments.length}`, { id: toastId });
      
      // Create new pages for ALL segments
      if (segments.length > 0 && onAddPage) {
        // Process ALL segments one by one, starting from index 0
        for (let i = 0; i < segments.length; i++) { 
          try {
            // Create a new page and get its ID
            const newPageId = await onAddPage(); 
            
            if (!newPageId) {
              console.error(`Failed to create page for segment ${i+1}`);
              toast.error(`Failed to create page ${i+1}`, { id: toastId });
              // Optionally break or continue depending on desired behavior
              continue; 
            }

            // No longer need to fetch all pages or guess the ID
            
            // Update the newly created page directly using its ID
            const { error } = await supabase
              .from('book_pages')
              .update({ 
                text: segments[i],
                updated_at: new Date().toISOString()
              })
              .eq('id', newPageId);
              
            if (error) {
              console.error(`Error updating page ${newPageId} text:`, error);
              // Optionally notify user
            } 
            
            // Construct the page object to update state *before* calling updatePage
            // Calculate the expected page number (relative to the original page + loop index + 1)
            const expectedPageNumber = currentPageData.pageNumber + i + 1; 
            
            const pageToUpdate: BookPage = {
              ...DEFAULT_PAGE, // Start with defaults
              id: newPageId,
              pageNumber: expectedPageNumber,
              text: segments[i], // Use the correct text segment
              // Inherit layout/formatting from the first page? Or use defaults? Using defaults for now.
              // layout: currentPageData.layout, 
              // textFormatting: currentPageData.textFormatting,
              // imageSettings: currentPageData.imageSettings,
              // backgroundColor: currentPageData.backgroundColor
            };

            // Call updatePage prop to sync application state AND update DB
            // updatePage service function handles the Supabase update internally
            await updatePage(pageToUpdate); 

            // Wait after state/DB update attempt before next iteration
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
