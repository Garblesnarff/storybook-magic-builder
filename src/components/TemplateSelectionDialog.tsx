
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookTemplate, bookTemplates } from '@/data/bookTemplates';
import { Book } from 'lucide-react';

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: BookTemplate) => void;
}

export const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectTemplate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Book Template</DialogTitle>
          <DialogDescription>
            Select a template to start with a pre-designed book structure
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {bookTemplates.map((template) => (
            <div 
              key={template.id}
              className="flex flex-col border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => {
                onSelectTemplate(template);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                  <Book size={20} />
                </div>
                <h3 className="font-medium">{template.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground flex-grow mb-2">{template.description}</p>
              <div className="text-xs text-muted-foreground">
                Approximately {template.pages.length} page{template.pages.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
