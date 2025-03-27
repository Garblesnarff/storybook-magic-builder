
import React from 'react';
import { BookPage } from '@/types/book';
import { PagePreview } from './PagePreview';
import { Plus, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface PageListProps {
  pages: BookPage[];
  selectedPageId?: string;
  onPageSelect: (id: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (id: string) => void;
}

export const PageList: React.FC<PageListProps> = ({ 
  pages, 
  selectedPageId, 
  onPageSelect,
  onAddPage,
  onDuplicatePage
}) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 });
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setVisibleRange(prev => ({
        start: Math.max(0, prev.start - 5),
        end: Math.max(5, prev.end - 5)
      }));
    } else {
      setVisibleRange(prev => ({
        start: Math.min(pages.length, prev.start + 5),
        end: Math.min(pages.length + 5, prev.end + 5)
      }));
    }
  };

  const handleDuplicatePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering page selection
    onDuplicatePage(id);
    toast.success('Page duplicated');
  };
  
  const visiblePages = pages.slice(visibleRange.start, visibleRange.end);
  const showLeftArrow = visibleRange.start > 0;
  const showRightArrow = visibleRange.end < pages.length;
  
  return (
    <div className="relative w-full">
      <div className="flex items-center">
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 z-10 bg-white/80 backdrop-blur-sm border"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
        )}
        
        <ScrollArea className="w-full px-8">
          <div className="flex space-x-4 py-4 w-max">
            {visiblePages.map((page) => (
              <div key={page.id} className="w-24 md:w-32 shrink-0 relative group">
                <PagePreview
                  page={page}
                  selected={page.id === selectedPageId}
                  onClick={() => onPageSelect(page.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border h-6 w-6"
                  onClick={(e) => handleDuplicatePage(page.id, e)}
                  title="Duplicate page"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Duplicate page</span>
                </Button>
              </div>
            ))}
            <div className="w-24 md:w-32 shrink-0 aspect-[3/4] rounded-md border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center">
              <Button
                variant="ghost"
                onClick={onAddPage}
                className="h-auto py-6 flex flex-col"
              >
                <Plus className="h-6 w-6 mb-2 text-gray-400" />
                <span className="text-xs text-gray-600">Add Page</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
        
        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 z-10 bg-white/80 backdrop-blur-sm border"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        )}
      </div>
    </div>
  );
};
