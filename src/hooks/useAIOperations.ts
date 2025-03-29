
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAIOperations(
  currentPageData: BookPage | null, 
  updatePage: (page: BookPage) => void, 
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<void>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!currentPageData) return;
    setIsGenerating(true);

    try {
      const style = currentPageData.textFormatting?.imageStyle || 'REALISTIC';
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt: currentPageData.text, 
          style 
        })
      });

      if (response.error) {
        toast.error('Failed to generate image', {
          description: response.error.message
        });
        return;
      }

      const updatedPage = { 
        ...currentPageData, 
        image: `data:image/png;base64,${response.data.image}` 
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

  const generateText = async (prompt: string, temperature: number = 0.7, maxTokens: number = 800) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingText(true);
    setGeneratedText('');

    try {
      // Enhance the prompt with instructions for page breaks
      const enhancedPrompt = `
Create a children's story based on the following prompt: "${prompt}"

IMPORTANT FORMATTING INSTRUCTIONS:
1. When you want to indicate a new page in the book, insert the marker "---PAGE BREAK---" on a separate line.
2. Place these markers at natural transition points in the story.
3. Each page should contain approximately 1-3 paragraphs of text.
4. The story should have 3-7 pages total, depending on its complexity.
5. Do not include any numbering, titles, or "Page X" markers - just the story text and page break markers.
`;

      const response = await supabase.functions.invoke('generate-text', {
        body: JSON.stringify({ 
          prompt: enhancedPrompt, 
          temperature,
          maxTokens: Math.max(maxTokens, 1500) // Ensure we have enough tokens for multi-page stories
        })
      });

      if (response.error) {
        toast.error('Text generation failed', {
          description: response.error.message
        });
        console.error('Text generation error:', response.error);
        return null;
      }

      setGeneratedText(response.data.text);
      toast.success('Text generated successfully!');
      return response.data.text;
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('Text generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsGeneratingText(false);
    }
  };

  const generateImage = async (prompt: string, imageStyle: string = 'REALISTIC') => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt, 
          style: imageStyle
        })
      });

      if (response.error) {
        toast.error('Image generation failed', {
          description: response.error.message
        });
        console.error('Image generation error:', response.error);
        return null;
      }

      const imageData = `data:image/png;base64,${response.data.image}`;
      setGeneratedImage(imageData);
      toast.success('Image generated successfully!');
      return imageData;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Image generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    // Original functions for direct page updates
    isGenerating,
    handleGenerateImage,
    handleApplyAIText,
    handleApplyAIImage,
    
    // New general-purpose AI functions
    isGeneratingText,
    isGeneratingImage,
    generatedText,
    generatedImage,
    setGeneratedText,
    setGeneratedImage,
    generateText,
    generateImage
  };
}
