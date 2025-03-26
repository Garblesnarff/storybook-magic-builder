
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

// Helper function to convert a layout id to a human-readable name
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
  
  // Load book when component mounts or id changes
  useEffect(() => {
    if (id && books.length > 0) {
      const bookExists = books.some(book => book.id === id);
      if (bookExists) {
        loadBook(id);
      }
    }
  }, [id, books, loadBook]);
  
  // Set selected page to first page when book changes
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0) {
      const firstPageId = currentBook.pages[0].id;
      setSelectedPageId(firstPageId);
    }
  }, [currentBook]);
  
  // Update currentPageData when selectedPageId changes
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

  const handleGenerateImage = () => {
    // This would actually call an API in a real implementation
    toast.success('Image generation is not implemented in this demo');
  };

  const handleExportPDF = () => {
    // This would actually generate a PDF in a real implementation
    toast.success('PDF export is not implemented in this demo');
  };

  // Redirect if book doesn't exist
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
        {/* Header */}
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
        
        {/* Page List */}
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
        
        {/* Main Editor Area */}
        <div className="flex flex-col md:flex-row flex-grow">
          {/* Page Preview */}
          <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
            {currentPageData && (
              <div 
                className="aspect-[3/4] bg-white rounded-xl shadow-lg border overflow-hidden max-h-[80vh]" 
                style={{ width: 'auto', height: '80vh' }}
              >
                {/* Render based on layout */}
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
          
          {/* Right Sidebar / Editor Controls */}
          {currentPageData && (
            <div className="w-full md:w-80 lg:w-96 border-l bg-white p-4 overflow-y-auto">
              <Tabs defaultValue="text">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="text">
                    <TextCursor className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <LayoutIcon className="h-4 w-4 mr-2" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="style">
                    <Palette className="h-4 w-4 mr-2" />
                    Style
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-text">Page Text</Label>
                    <Textarea
                      id="page-text"
                      value={currentPageData.text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="min-h-[200px]"
                      placeholder="Enter the story text for this page..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="layout">Page Layout</Label>
                    <Select 
                      value={currentPageData.layout} 
                      onValueChange={(value) => handleLayoutChange(value as PageLayout)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a layout" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(layoutNames).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateImage}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Image
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Generates an image based on the text content of this page.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select 
                      value={currentPageData.textFormatting?.fontFamily || 'Inter'} 
                      onValueChange={(value) => handleTextFormattingChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
                        <SelectItem value="Courier New">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size ({currentPageData.textFormatting?.fontSize || 16}px)</Label>
                    <Input
                      id="font-size"
                      type="range"
                      min="12"
                      max="36"
                      value={currentPageData.textFormatting?.fontSize || 16}
                      onChange={(e) => handleTextFormattingChange('fontSize', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="bold"
                        checked={currentPageData.textFormatting?.isBold || false}
                        onChange={(e) => handleTextFormattingChange('isBold', e.target.checked)}
                      />
                      <Label htmlFor="bold">Bold</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="italic"
                        checked={currentPageData.textFormatting?.isItalic || false}
                        onChange={(e) => handleTextFormattingChange('isItalic', e.target.checked)}
                      />
                      <Label htmlFor="italic">Italic</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-color">Text Color</Label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        id="font-color"
                        value={currentPageData.textFormatting?.fontColor || '#000000'}
                        onChange={(e) => handleTextFormattingChange('fontColor', e.target.value)}
                        className="w-10 h-10 rounded-md"
                      />
                      <Input
                        value={currentPageData.textFormatting?.fontColor || '#000000'}
                        onChange={(e) => handleTextFormattingChange('fontColor', e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;
