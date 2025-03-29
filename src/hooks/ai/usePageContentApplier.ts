
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
  
  // New function to create a page and apply text
  const createPageWithText = async (text: string, pageIndex: number): Promise<boolean> => {
    console.log(`Creating page ${pageIndex+1} with text (${text.length} chars)`);
    
    try {
      // Add new page
      await onAddPage?.();
      
      // Give more time for the page to be created and the book state to be updated
      await wait(1000);
      
      // Retrieve the latest book state from the parent component
      await wait(500);
      
      // Get current book state
      const bookData = document.querySelector('[data-book-state]')?.getAttribute('data-book-state');
      if (bookData) {
        try {
          const parsedData = JSON.parse(bookData);
          const latestPages = parsedData.pages || [];
          
          // Find the latest added page (should be the last one)
          if (latestPages.length > 0) {
            const newPage = latestPages[latestPages.length - 1];
            console.log(`Applying text to new page ID: ${newPage.id}, pageNumber: ${newPage.pageNumber}`);
            
            // Update the page text
            const updatedPage = { ...newPage, text };
            updatePage(updatedPage);
            
            // Optionally show specific toast for additional pages
            if (pageIndex > 0) {
              toast.success(`Created page ${pageIndex+1} with the next part of the story`);
            }
            
            return true;
          } else {
            console.error('No pages found in the book data');
            return false;
          }
        } catch (e) {
          console.error('Error parsing book data:', e);
          return false;
        }
      } else {
        console.error('No book data attribute found');
        return false;
      }
    } catch (err) {
      console.error(`Error creating page ${pageIndex+1}:`, err);
      return false;
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
      console.log(`Updating original page (${currentPageData.id}) with first segment`);
      
      const updatedFirstPage = { ...currentPageData, text: firstSegment };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      toast.loading(`Creating pages: 1/${segments.length} completed...`, { id: toastId });
      
      // If there are more segments and we have an onAddPage function
      if (segments.length > 1 && onAddPage) {
        console.log(`Starting to create ${segments.length - 1} additional pages...`);
        
        // Create each page sequentially and apply text immediately
        for (let i = 1; i < segments.length; i++) {
          const success = await createPageWithText(segments[i], i);
          if (!success) {
            toast.error(`Failed to create page ${i+1}`);
            break;
          }
          
          // Update progress toast
          toast.loading(`Creating pages: ${i+1}/${segments.length} completed...`, { id: toastId });
          
          // Wait a bit between page creations to ensure database consistency
          await wait(1500);
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
