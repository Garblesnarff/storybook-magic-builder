
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Download, Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Book, BookPage } from '@/types/book';
import { AIAssistant } from '@/components/AIAssistant';

interface EditorHeaderProps {
  book: Book;
  onExportPDF: () => void;
  onApplyAIText: (prompt: string) => void;
  onApplyAIImage: (prompt: string) => void;
  initialPrompt?: string;
  isExporting: boolean;
  isSaving?: boolean;
  currentBook?: Book | null;
  updatePage?: (page: BookPage) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  book,
  onExportPDF,
  onApplyAIText,
  onApplyAIImage,
  initialPrompt = '',
  isExporting,
  isSaving = false,
  currentBook,
  updatePage
}) => {
  return (
    <header className="sticky top-0 bg-white border-b z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/books" className="flex items-center text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to Books</span>
          </Link>
          <h1 className="text-xl font-medium">{book?.title || 'Untitled Book'}</h1>
          
          {/* Saving indicator */}
          {isSaving && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {!isSaving && (
            <div className="flex items-center text-sm text-green-600 opacity-0 transition-opacity duration-300">
              <Save className="h-3 w-3 mr-1" />
              <span>Saved</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
          
          <AIAssistant 
            onApplyText={onApplyAIText}
            onApplyImage={onApplyAIImage}
            initialPrompt={initialPrompt}
            currentBook={currentBook}
            updatePage={updatePage}
          />
        </div>
      </div>
    </header>
  );
};
