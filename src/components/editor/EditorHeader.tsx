
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft } from 'lucide-react';
import { Book } from '@/types/book';
import { AIAssistant } from '@/components/AIAssistant';

interface EditorHeaderProps {
  book: Book | null;
  onExportPDF: () => void;
  onApplyAIText: (text: string) => void;
  onApplyAIImage: (imageData: string) => void;
  initialPrompt?: string;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  book,
  onExportPDF,
  onApplyAIText,
  onApplyAIImage,
  initialPrompt
}) => {
  if (!book) return null;

  return (
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
            <h1 className="font-display text-xl font-semibold text-gray-900">{book.title}</h1>
            <p className="text-sm text-gray-500">by {book.author}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <AIAssistant 
            onApplyText={onApplyAIText}
            onApplyImage={onApplyAIImage}
            initialPrompt={initialPrompt}
          />
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
};
