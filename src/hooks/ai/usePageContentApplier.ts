
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
    
    try {
      // Store the original page to update
      const originalPage = { ...currentPageData };
      
      // Update the original page with the first segment
      const updatedFirstPage = { ...originalPage, text: segments[0] };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      // If there are more segments and we have an onAddPage function, create additional pages
      if (segments.length > 1 && onAddPage) {
        toast.info(`Creating ${segments.length - 1} additional pages...`);
        
        // Create an array to store the promises for page creation
        const pageCreationPromises = [];
        
        // Create new pages for each additional segment
        for (let i = 1; i < segments.length; i++) {
          // Add a page creation promise to our array
          pageCreationPromises.push(
            new Promise<void>(async (resolve) => {
              // Wait for the page to be created
              await onAddPage();
              
              // After short delay to ensure the page is created and available in the book
              setTimeout(resolve, 100);
            })
          );
        }
        
        // Wait for all pages to be created
        await Promise.all(pageCreationPromises);
        
        // After all pages are created, update the book context to get the latest book data
        // The actual page updates will be handled in the AIAssistant component
        // which has access to the currentBook and updatePage function
        
        toast.success(`Created ${segments.length} pages in total`);
      }
    } catch (error) {
      console.error('Error applying AI text:', error);
      toast.error('Failed to create all pages', {
        description: 'Some pages may not have been created correctly'
      });
    }
  };

  const handleApplyAIImage = (imageData: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  return {
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
