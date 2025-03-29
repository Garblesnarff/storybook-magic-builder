
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function usePageContentApplier(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => void,
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<void>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStory, setProcessingStory] = useState(false);
  const [pendingTextSegments, setPendingTextSegments] = useState<string[]>([]);

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
      
      updatePage(updatedPage);
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
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Completely revised multi-page story application:
   * 1. Update first page with direct Supabase call to ensure it sticks
   * 2. Create and populate subsequent pages with more reliable tracking
   * 3. Use page number ordering to ensure pages are created in proper sequence
   */
  const handleApplyAIText = async (text: string) => {
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
      // Start progress toast
      const toastId = toast.loading(`Processing pages: 0/${segments.length}`);
      
      // Get the book ID first - we'll need this for all operations
      const bookId = await getBookIdForPage(currentPageData.id);
      
      if (!bookId) {
        toast.error('Could not determine which book to update');
        setProcessingStory(false);
        return;
      }
      
      // CRITICAL FIX: Update the first page directly with Supabase
      // This ensures page 1 always gets updated correctly
      const firstSegment = segments[0];
      console.log(`Updating first page (${currentPageData.id}) with text directly`);
      
      const { error: updateError } = await supabase
        .from('book_pages')
        .update({ text: firstSegment })
        .eq('id', currentPageData.id);
        
      if (updateError) {
        console.error('Error updating first page:', updateError);
        toast.error('Failed to update first page');
        setProcessingStory(false);
        return;
      }
        
      // Also update the local state for immediate UI feedback
      const updatedFirstPage = { ...currentPageData, text: firstSegment };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      // Wait to ensure first page update is complete
      await wait(1000);
      
      toast.loading(`Processing pages: 1/${segments.length}`, { id: toastId });
      
      // If there are more segments and we have an onAddPage function
      if (segments.length > 1 && onAddPage) {
        // Track which pages we've already processed to avoid duplicates
        const processedPages = new Set([currentPageData.id]);
        
        // Process each additional page sequentially
        for (let i = 1; i < segments.length; i++) {
          console.log(`Creating new page for segment ${i+1}`);
          await onAddPage();
          
          // Wait for the page to be created
          await wait(1500);
          
          // Get all pages for this book in sequence order
          const { data: allPages } = await supabase
            .from('book_pages')
            .select('id, page_number')
            .eq('book_id', bookId)
            .order('page_number', { ascending: true });
            
          if (!allPages || allPages.length === 0) {
            console.error('Could not retrieve pages');
            continue;
          }
          
          // Find the newly created page - it should be the one with highest page number
          // that we haven't processed yet
          const unprocessedPages = allPages.filter(page => !processedPages.has(page.id));
          
          if (unprocessedPages.length === 0) {
            console.error('No unprocessed pages found to apply text to');
            continue;
          }
          
          // Take the page with highest page number from unprocessed
          const pageToUpdate = unprocessedPages.reduce((highest, current) => 
            current.page_number > highest.page_number ? current : highest, 
            unprocessedPages[0]
          );
          
          const pageId = pageToUpdate.id;
          
          if (pageId) {
            // Mark this page as processed
            processedPages.add(pageId);
            
            console.log(`Applying text to page ID: ${pageId} (segment ${i+1})`);
            
            // Apply text directly to the database
            const { error } = await supabase
              .from('book_pages')
              .update({ text: segments[i] })
              .eq('id', pageId);
              
            if (error) {
              console.error(`Error updating page ${pageId}:`, error);
            } else {
              console.log(`Successfully updated page ${pageId} with text`);
            }
            
            // Wait after update to ensure consistency
            await wait(1000);
            
            // Update progress toast
            toast.loading(`Processing pages: ${i+1}/${segments.length}`, { id: toastId });
          } else {
            console.error(`Could not find or already processed page for segment ${i+1}`);
          }
        }
        
        // Success message after completing all pages
        toast.success(`Created ${segments.length} pages with content`, { id: toastId });
        
        // Refresh the UI by reloading the page after all updates
        await wait(1500);
        window.location.reload();
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
  };

  /**
   * Helper function to get book ID from a page ID
   */
  const getBookIdForPage = async (pageId: string): Promise<string | null> => {
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
  };

  const getPendingTextSegments = () => {
    const segments = [...pendingTextSegments];
    setPendingTextSegments([]);
    return segments;
  };

  const handleApplyAIImage = (imageData: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  return {
    isGenerating,
    processingStory,
    pendingTextSegments,
    getPendingTextSegments,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
