import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PageList } from '@/components/PageList';
import { useBook } from '@/contexts/BookContext';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  TextCursor, 
  Layout as LayoutIcon, 
  Image, 
  Sparkles, 
  Download, 
  ChevronLeft, 
  Palette 
} from 'lucide-react';
import { PageLayout, BookPage, TextFormatting } from '@/types/book';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { IMAGE_STYLES } from '@/types/book';

const layoutNames: Record<PageLayout, string> = {
  'text-left-image-right': 'Text Left, Image Right',
  'image-left-text-right': 'Image Left, Text Right',
  'text-top-image-bottom': 'Text Top, Image Bottom',
  'image-top-text-bottom': 'Image Top, Text Bottom',
  'full-page-image': 'Full Page Image',
  'full-page-text': 'Full Page Text'
};

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { books, loadBook, currentBook, addPage, updatePage, deletePage } = useBook();
  
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
    if (currentBook && currentBook.pages.length > 0) {
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook]);
  
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

  const handleTextChange = (value: string) => {
    if (!currentPageData) return;
    const updatedPage = { ...currentPageData, text: value };
    setCurrentPageData(updatedPage);
    updatePage(updatedPage);
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
        <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-40 py-3 px-4 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/books">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </a>
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold text-gray-900">{currentBook.title}</h1>
                <p className="text-sm text-gray-500">by {currentBook.author}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </header>
        
        <div className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <PageList
              pages={currentBook.pages}
              selectedPageId={selectedPageId}
              onPageSelect={handlePageSelect}
              onAddPage={handleAddPage}
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-grow">
          <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
            {currentPageData && (
              <div 
                className="aspect-[3/4] bg-white rounded-xl shadow-lg border overflow-hidden max-h-[80vh]" 
                style={{ width: 'auto', height: '80vh' }}
              >
                {currentPageData.layout === 'text-left-image-right' && (
                  <div className="flex h-full">
                    <div className="w-1/2 p-8 overflow-auto">
                      <div 
                        style={{ 
                          fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                          fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                          color: currentPageData.textFormatting?.fontColor || '#000000',
                          fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                          fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {currentPageData.text}
                      </div>
                    </div>
                    <div className="w-1/2 bg-gray-100 flex items-center justify-center">
                      {currentPageData.image ? (
                        <img 
                          src={currentPageData.image} 
                          alt="Page illustration"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No image generated yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={handleGenerateImage}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentPageData.layout === 'image-left-text-right' && (
                  <div className="flex h-full">
                    <div className="w-1/2 bg-gray-100 flex items-center justify-center">
                      {currentPageData.image ? (
                        <img 
                          src={currentPageData.image} 
                          alt="Page illustration"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No image generated yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={handleGenerateImage}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 p-8 overflow-auto">
                      <div 
                        style={{ 
                          fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                          fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                          color: currentPageData.textFormatting?.fontColor || '#000000',
                          fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                          fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {currentPageData.text}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentPageData.layout === 'text-top-image-bottom' && (
                  <div className="flex flex-col h-full">
                    <div className="h-1/2 p-8 overflow-auto">
                      <div 
                        style={{ 
                          fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                          fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                          color: currentPageData.textFormatting?.fontColor || '#000000',
                          fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                          fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {currentPageData.text}
                      </div>
                    </div>
                    <div className="h-1/2 bg-gray-100 flex items-center justify-center">
                      {currentPageData.image ? (
                        <img 
                          src={currentPageData.image} 
                          alt="Page illustration"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No image generated yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={handleGenerateImage}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentPageData.layout === 'image-top-text-bottom' && (
                  <div className="flex flex-col h-full">
                    <div className="h-1/2 bg-gray-100 flex items-center justify-center">
                      {currentPageData.image ? (
                        <img 
                          src={currentPageData.image} 
                          alt="Page illustration"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No image generated yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={handleGenerateImage}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="h-1/2 p-8 overflow-auto">
                      <div 
                        style={{ 
                          fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                          fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                          color: currentPageData.textFormatting?.fontColor || '#000000',
                          fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                          fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {currentPageData.text}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentPageData.layout === 'full-page-image' && (
                  <div className="relative h-full">
                    {currentPageData.image ? (
                      <img 
                        src={currentPageData.image} 
                        alt="Page illustration"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center p-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No image generated yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={handleGenerateImage}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
                      <div 
                        style={{ 
                          fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                          fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                          color: '#FFFFFF',
                          fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                          fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {currentPageData.text}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentPageData.layout === 'full-page-text' && (
                  <div className="h-full p-12 flex items-center justify-center overflow-auto">
                    <div 
                      style={{ 
                        fontFamily: currentPageData.textFormatting?.fontFamily || 'Inter',
                        fontSize: `${currentPageData.textFormatting?.fontSize || 16}px`,
                        color: currentPageData.textFormatting?.fontColor || '#000000',
                        fontWeight: currentPageData.textFormatting?.isBold ? 'bold' : 'normal',
                        fontStyle: currentPageData.textFormatting?.isItalic ? 'italic' : 'normal',
                      }}
                    >
                      {currentPageData.text}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-80 lg:w-96 border-l bg-white p-4 overflow-y-auto">
            <Tabs defaultValue="text">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text">
                 
