
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
    
    try {
      // Update the first page immediately
      const firstSegment = segments[0];
      console.log(`Updating original page (${currentPageData.id}) with first segment`);
      
      const updatedFirstPage = { ...currentPageData, text: firstSegment };
      updatePage(updatedFirstPage);
      setCurrentPageData(updatedFirstPage);
      
      // If there are more segments and we have an onAddPage function
      if (segments.length > 1 && onAddPage) {
        console.log(`Starting to create ${segments.length - 1} additional pages...`);
        toast.info(`Creating ${segments.length - 1} additional pages...`);
        
        // Store segments that need to be applied to new pages
        setPendingTextSegments(segments.slice(1));
        
        // Create each page one at a time and apply the text
        for (let i = 1; i < segments.length; i++) {
          console.log(`Creating page ${i} of ${segments.length - 1}`);
          
          // Add a new page
          await onAddPage();
          
          // Short delay to ensure the page is fully created and available
          await new Promise(resolve => setTimeout(resolve, 250));
        }
        
        toast.success(`Created ${segments.length} pages in total`);
      }
    } catch (error) {
      console.error('Error applying AI text:', error);
      toast.error('Failed to create all pages', {
        description: 'Some pages may not have been created correctly'
      });
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
    pendingTextSegments,
    getPendingTextSegments,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage
  };
}
