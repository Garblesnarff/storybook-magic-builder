import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PageList } from '@/components/PageList';
import { useBook } from '@/contexts/BookContext';
import { useParams, Navigate } from 'react-router-dom';
import { PageLayout, BookPage, TextFormatting } from '@/types/book';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { PageEditor } from '@/components/editor/PageEditor';
import { PageSettings } from '@/components/editor/PageSettings';

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { books, loadBook, currentBook, addPage, updatePage, deletePage, duplicatePage } = useBook();
  
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  const [currentPageData, setCurrentPageData] = useState<BookPage | null>(null);
  
  useEffect(() => {
    if (id && books.length > 0) {
      const bookExists = books.some(book => book.id === id);
      if (bookExists) {
        loadBook(id);
      }
    }
  }, [id, books, loadBook]);
  
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook, selectedPageId]);
  
  useEffect(() => {
    if (currentBook && selectedPageId) {
      const page = currentBook.pages.find(page => page.id === selectedPageId);
      if (page) {
        setCurrentPageData({ ...page });
      }
    }
  }, [selectedPageId, currentBook]);
  
  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
  };
  
  const handleAddPage = () => {
    addPage();
    toast.success('New page added');
  };

  const handleDuplicatePage = (pageId: string) => {
    const newPageId = duplicatePage(pageId);
    if (newPageId) {
      setSelectedPageId(newPageId);
    }
  };

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    
    const updatedPage = { ...currentPageData, text: value };
    setCurrentPageData(updatedPage);
    
    const timeoutId = setTimeout(() => {
      updatePage(updatedPage);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLayoutChange = (value: PageLayout) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, layout: value };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleTextFormattingChange = (key: keyof TextFormatting, value: any) => {
    if (!currentPageData) return;
    const updatedFormatting = { 
      ...currentPageData.textFormatting,
      [key]: value 
    };
    const updatedPage = { 
      ...currentPageData, 
      textFormatting: updatedFormatting 
    };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  const handleGenerateImage = async () => {
    if (!currentPageData) return;

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
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleExportPDF = () => {
    toast.success('PDF export is not implemented in this demo');
  };

  const handleApplyAIText = (text: string) => {
    if (!currentPageData) return;
    handleTextChange(text);
  };

  const handleApplyAIImage = (imageData: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, image: imageData };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
  };

  if (!id || (books.length > 0 && !books.some(book => book.id === id))) {
    return <Navigate to="/books" />;
  }

  if (!currentBook) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p>Loading book...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <div className="min-h-screen flex flex-col">
        <EditorHeader 
          book={currentBook}
          onExportPDF={handleExportPDF}
          onApplyAIText={handleApplyAIText}
          onApplyAIImage={handleApplyAIImage}
          initialPrompt={currentPageData?.text}
        />
        
        <div className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <PageList
              pages={currentBook.pages}
              selectedPageId={selectedPageId}
              onPageSelect={handlePageSelect}
              onAddPage={handleAddPage}
              onDuplicatePage={handleDuplicatePage}
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-grow">
          <PageEditor
            currentPageData={currentPageData}
            handleTextChange={handleTextChange}
            handleLayoutChange={handleLayoutChange}
            handleTextFormattingChange={handleTextFormattingChange}
            handleGenerateImage={handleGenerateImage}
          />
          
          <PageSettings
            currentPageData={currentPageData}
            handleTextChange={handleTextChange}
            handleLayoutChange={handleLayoutChange}
            handleTextFormattingChange={handleTextFormattingChange}
            handleGenerateImage={handleGenerateImage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;
