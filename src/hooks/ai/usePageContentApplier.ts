
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { toast } from 'sonner';

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
  
  // Helper function to get the current book state from the DOM
  const getCurrentBookState = () => {
    try {
      const bookDataElement = document.querySelector('[data-book-state]') as HTMLElement;
      if (bookDataElement) {
        const bookData = bookDataElement.getAttribute('data-book-state');
        if (bookData) {
          return JSON.parse(bookData);
        }
      }
      return null;
    } catch (e) {
      console.error('Error getting book state:', e);
      return null;
    }
  };

  // Function to directly update a page
  const directUpdatePage = async (pageId: string, text: string): Promise<boolean> => {
    try {
      const bookState = getCurrentBookState();
      if (!bookState) return false;
      
      const page = bookState.pages.find((p: BookPage) => p.id === pageId);
      if (!page) return false;
      
      const updatedPage = { ...page, text };
      updatePage(updatedPage);
      console.log(`Directly updated page ${pageId} with text (${text.length} chars)`);
      return true;
    } catch (err) {
      console.error(`Error directly updating page ${pageId}:`, err);
      return false;
    }
  };
  
  // Enhanced function to create a page and apply text
  const createPageWithText = async (text: string, pageIndex: number): Promise<string | null> => {
    console.log(`Creating page ${pageIndex+1} with text (${text.length} chars)`);
    
    try {
      // Add new page
      await onAddPage?.();
      
      // Wait longer for the page to be created and the book state to be updated
      await wait(2000);
      
      // Verify the book state after waiting
      let bookState = getCurrentBookState();
      let retries = 0;
      const maxRetries = 3;
      
      // Retry getting book state if not found
      while (!bookState && retries < maxRetries) {
        await wait(1000);
        bookState = getCurrentBookState();
        retries++;
        console.log(`Retry ${retries}: Getting book state after page creation`);
      }
      
      if (!bookState) {
        console.error('Failed to get book state after multiple attempts');
        return null;
      }
      
      // Find the latest added page (should be the last one)
      const latestPages = bookState.pages || [];
      if (latestPages.length === 0) {
        console.error('No pages found in the book data');
        return null;
      }
      
      const newPage = latestPages[latestPages.length - 1];
      console.log(`Applying text to new page ID: ${newPage.id}, pageNumber: ${newPage.pageNumber}`);
      
      // Update the page text with a direct update
      const updatedPage = { ...newPage, text };
      updatePage(updatedPage);
      
      // Wait to ensure the update has been processed
      await wait(1000);
      
      // Verify the update
      const verificationRetries = 0;
      const maxVerificationRetries = 2;
      let verified = false;
      
      while (!verified && verificationRetries < maxVerificationRetries) {
        const currentState = getCurrentBookState();
        if (currentState) {
          const updatedPageInState = currentState.pages.find((p: BookPage) => p.id === newPage.id);
          if (updatedPageInState && updatedPageInState.text === text) {
            verified = true;
            console.log(`Page ${newPage.id} text update verified`);
          } else {
            // Try updating again
            console.log(`Retry updating page ${newPage.id} text`);
            updatePage(updatedPage);
            await wait(1000);
          }
        }
      }
      
      return newPage.id;
    } catch (err) {
      console.error(`Error creating page ${pageIndex+1}:`, err);
      return null;
    }
  };

  // Enhanced function to handle multi-page stories
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
      const toastId = toast.loading(`Creating pages: 0/${segments.length} completed...`);
      
      // Update the first page immediately
      const firstSegment = segments[0];
      console.log(`Updating original page (${currentPageData.id}) with first segment (${firstSegment.length} chars)`);
      
      const updatedFirstPage = { ...currentPageData, text: firstSegment };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      // Wait to ensure first page update is complete
      await wait(1500);
      
      toast.loading(`Creating pages: 1/${segments.length} completed...`, { id: toastId });
      
      // If there are more segments and we have an onAddPage function
      if (segments.length > 1 && onAddPage) {
        console.log(`Starting to create ${segments.length - 1} additional pages...`);
        
        // Track created page IDs to ensure we can update them later if needed
        const createdPageIds: Array<string | null> = [];
        
        // Create each page sequentially and apply text immediately
        for (let i = 1; i < segments.length; i++) {
          // Create the new page and get its ID
          const newPageId = await createPageWithText(segments[i], i);
          createdPageIds.push(newPageId);
          
          // Update progress toast
          toast.loading(`Creating pages: ${i+1}/${segments.length} completed...`, { id: toastId });
          
          // Wait between page creations to ensure database consistency
          // Increase the wait time for each subsequent page to reduce race conditions
          await wait(2000 + i * 500); 
        }
        
        // Verify and retry for pages that might have failed
        console.log('Verifying all pages have their text...');
        const bookState = getCurrentBookState();
        
        if (bookState) {
          // Check that each page has its text
          for (let i = 1; i < segments.length; i++) {
            const pageId = createdPageIds[i - 1];
            if (pageId) {
              const page = bookState.pages.find((p: BookPage) => p.id === pageId);
              if (page && (!page.text || page.text.length < 10)) {
                console.log(`Page ${pageId} missing text, retrying update...`);
                await directUpdatePage(pageId, segments[i]);
                await wait(1000);
              }
            }
          }
        }
        
        toast.success(`Created ${segments.length} pages in total`, { id: toastId });
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
