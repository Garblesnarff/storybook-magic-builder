
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
   * More reliable page creation and text application process:
   * 1. First update the current page directly using Supabase
   * 2. Create additional pages one by one, ensuring each is created before proceeding
   * 3. Update each page directly in the database with careful error handling
   * 4. Verify updates were successful before continuing
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
      
      // Step 1: Update the first page (current page) directly
      console.log(`Updating first page (${currentPageData.id}) directly in database`);
      const firstSegment = segments[0];
      
      // CRITICAL: Do not allow empty text to prevent default text being applied
      const textToUse = firstSegment && firstSegment.trim() !== '' ? firstSegment : ' ';
      
      // Update first page in memory immediately for UI feedback
      const updatedFirstPage = { 
        ...currentPageData, 
        text: textToUse 
      };
      setCurrentPageData(updatedFirstPage);
      
      // Update first page directly in database with explicit UPDATE query
      const { error: firstPageError } = await supabase
        .from('book_pages')
        .update({ 
          text: textToUse,
          updated_at: new Date().toISOString() // Force update timestamp
        })
        .eq('id', currentPageData.id);
      
      if (firstPageError) {
        console.error('Error updating first page:', firstPageError);
        toast.error('Failed to update first page');
        setProcessingStory(false);
        return;
      }
      
      console.log('First page updated successfully with text:', textToUse);
      
      // Call the update function to ensure local state is updated
      updatePage(updatedFirstPage);
      
      // Wait to ensure database update has time to process
      await wait(2000);
      
      // Verify the update was successful by fetching the page data directly
      const { data: verifyData, error: verifyError } = await supabase
        .from('book_pages')
        .select('text')
        .eq('id', currentPageData.id)
        .single();
      
      if (verifyError || !verifyData) {
        console.error('Failed to verify first page update:', verifyError);
        toast.error('Failed to verify first page update');
      } else {
        console.log('First page text verified:', verifyData.text);
        
        // If text doesn't match what we set, update it again
        if (verifyData.text !== textToUse) {
          console.log('First page text mismatch, updating again');
          await supabase
            .from('book_pages')
            .update({ 
              text: textToUse,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentPageData.id);
          
          // Wait for second update
          await wait(1000);
        }
      }
      
      toast.loading(`Processing pages: 1/${segments.length}`, { id: toastId });
      
      // If there are more segments, handle additional pages
      if (segments.length > 1 && onAddPage) {
        // Track all created pages to avoid duplicates
        const processedPages = new Map<number, string>();
        processedPages.set(0, currentPageData.id); // First page is already processed
        
        // Process remaining segments sequentially
        for (let i = 1; i < segments.length; i++) {
          console.log(`Creating/updating page for segment ${i+1}`);
          
          // Create a new page
          await onAddPage();
          
          // Wait for page creation
          await wait(2500);
          
          // Get all pages for this book after adding the new page
          const { data: allPages } = await supabase
            .from('book_pages')
            .select('id, page_number, text')
            .eq('book_id', bookId)
            .order('page_number', { ascending: true });
            
          if (!allPages || allPages.length <= i) {
            console.error('Could not find enough pages');
            continue;
          }
          
          // Find the page with the correct page number (i)
          const targetPage = allPages.find(page => page.page_number === i);
          
          if (!targetPage) {
            console.error(`Could not find page with number ${i}`);
            continue;
          }
          
          const pageId = targetPage.id;
          
          // Skip if we've already processed this page
          if (processedPages.has(i)) {
            console.log(`Page with number ${i} already processed, skipping`);
            continue;
          }
          
          // Mark this page as processed
          processedPages.set(i, pageId);
          
          // Get the text for this segment
          const textToApply = segments[i] && segments[i].trim() !== '' ? segments[i] : ' ';
          
          console.log(`Applying text segment ${i+1} to page ${pageId} (page number: ${i})`);
          
          // Update the page directly in the database
          const { error } = await supabase
            .from('book_pages')
            .update({ 
              text: textToApply,
              updated_at: new Date().toISOString()
            })
            .eq('id', pageId);
            
          if (error) {
            console.error(`Error updating page ${pageId}:`, error);
          } else {
            console.log(`Successfully updated page ${pageId} with text:`, textToApply.substring(0, 50));
          }
          
          // Allow database time to process
          await wait(1500);
          
          // Update progress toast
          toast.loading(`Processing pages: ${i+1}/${segments.length}`, { id: toastId });
        }
        
        // Success message after completing all pages
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
