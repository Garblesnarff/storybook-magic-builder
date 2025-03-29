
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
   * A completely new approach to multi-page story application:
   * 1. Update the first page immediately (synchronously)
   * 2. Create and process each additional page one at a time
   * 3. Use direct API calls to Supabase for saving pages
   * 4. Apply consistent wait times between operations
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
      
      // Update the first page immediately with the first segment
      const firstSegment = segments[0];
      console.log(`Updating current page (${currentPageData.id}) with first segment`);
      
      const updatedFirstPage = { ...currentPageData, text: firstSegment };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      // Direct database update for the first page to ensure it's saved
      await savePage(currentPageData.id, firstSegment);
      
      // Wait to ensure first page update is complete
      await wait(1500);
      
      toast.loading(`Processing pages: 1/${segments.length}`, { id: toastId });
      
      // If there are more segments and we have an onAddPage function
      if (segments.length > 1 && onAddPage) {
        // Array to track all new pages we create
        const createdPages: string[] = [];
        
        // Process each additional page sequentially
        for (let i = 1; i < segments.length; i++) {
          console.log(`Creating new page for segment ${i+1}`);
          await onAddPage();
          
          // Wait for the page to be created
          await wait(2000);
          
          // Get the book ID from the current page data
          const bookId = await getBookIdFromPage(currentPageData.id);
          
          if (!bookId) {
            console.error('Could not retrieve book ID');
            continue;
          }
          
          // Get all pages for this book in order
          const { data: allPages } = await supabase
            .from('book_pages')
            .select('id, page_number')
            .eq('book_id', bookId)
            .order('page_number', { ascending: true });
            
          if (!allPages || allPages.length === 0) {
            console.error('Could not retrieve pages');
            continue;
          }
          
          // Find the most recently created page (should be the last one)
          const newPageId = allPages[allPages.length - 1].id;
          
          if (newPageId && !createdPages.includes(newPageId)) {
            createdPages.push(newPageId);
            console.log(`Applying text to page ID: ${newPageId} (segment ${i+1})`);
            
            // Apply text directly to the database
            await savePage(newPageId, segments[i]);
            
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
        await wait(1000);
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
   * Function to save page text directly to the database
   */
  const savePage = async (pageId: string, text: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('book_pages')
        .update({ text })
        .eq('id', pageId);
      
      if (error) {
        console.error('Error saving page text:', error);
        return false;
      }
      
      console.log(`Successfully saved text for page ID: ${pageId}`);
      return true;
    } catch (err) {
      console.error('Error in savePage function:', err);
      return false;
    }
  };
  
  /**
   * Helper function to get book ID from a page ID
   */
  const getBookIdFromPage = async (pageId: string): Promise<string | null> => {
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
      console.error('Error in getBookIdFromPage function:', err);
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
