
import React from 'react';
import { BookPage } from '@/types/book';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Trash2,
  Plus 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PagePreview } from './PagePreview';

interface PageListProps {
  pages: BookPage[];
  selectedPageId: string | undefined;
  onPageSelect: (id: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage?: (id: string) => void;
  onReorderPage: (sourceIndex: number, destinationIndex: number) => void;
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  selectedPageId,
  onPageSelect,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onReorderPage,
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    onReorderPage(sourceIndex, destinationIndex);
  };

  const handleDeletePage = (id: string) => {
    // Check if we have at least two pages before allowing deletion
    if (pages.length <= 1) {
      toast.error("Cannot delete the only page. Books must have at least one page.");
      return;
    }
    
    // If we have a delete handler, call it
    if (onDeletePage) {
      onDeletePage(id);
    }
  };

  return (
    <div className="w-full overflow-auto py-3">
      <div className="flex items-center space-x-2 px-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pages" direction="horizontal">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-center space-x-2 overflow-x-auto scrollbar-hide"
              >
                {pages.map((page, index) => (
                  <Draggable key={page.id} draggableId={page.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "flex-shrink-0 group relative",
                          snapshot.isDragging && "z-10"
                        )}
                      >
                        <div
                          onClick={() => onPageSelect(page.id)}
                          className={cn(
                            "h-16 w-12 flex flex-col items-center justify-center rounded border text-sm font-medium transition-colors cursor-pointer overflow-hidden",
                            selectedPageId === page.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:text-foreground"
                          )}
                        >
                          <span className="mb-1">{index + 1}</span>
                          <div className="w-full h-8 overflow-hidden">
                            <PagePreview 
                              page={page} 
                              selected={selectedPageId === page.id}
                            />
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-5 w-5 bg-background shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicatePage(page.id);
                            }}
                            title="Duplicate page"
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Duplicate page</span>
                          </Button>
                          {onDeletePage && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                              }}
                              title="Delete page"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Delete page</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddPage}
          className="flex-shrink-0 h-16 w-12 border border-dashed border-muted-foreground/50 hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add page</span>
        </Button>
      </div>
    </div>
  );
};
