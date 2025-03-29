
import React from 'react';
import { BookPage } from '@/types/book';
import { cn } from '@/lib/utils';

interface PagePreviewProps {
  page: BookPage;
  selected?: boolean;
  onClick?: () => void;
}

export const PagePreview: React.FC<PagePreviewProps> = ({ 
  page, 
  selected = false, 
  onClick 
}) => {
  const { text, image, layout } = page;
  
  const placeholderImage = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1546&q=80';
  
  return (
    <div 
      className={cn(
        "relative h-full w-full overflow-hidden",
        selected ? "ring-2 ring-primary" : ""
      )}
      onClick={onClick}
    >
      {/* Layout preview based on the layout type */}
      {layout === 'text-left-image-right' && (
        <div className="flex h-full">
          <div className="w-1/2 p-1 flex items-center">
            <p className="text-[6px] line-clamp-6 overflow-hidden">{text}</p>
          </div>
          <div className="w-1/2 h-full bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt="Page preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      {layout === 'image-left-text-right' && (
        <div className="flex h-full">
          <div className="w-1/2 h-full bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt="Page preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 p-1 flex items-center">
            <p className="text-[6px] line-clamp-6 overflow-hidden">{text}</p>
          </div>
        </div>
      )}
      
      {layout === 'text-top-image-bottom' && (
        <div className="flex flex-col h-full">
          <div className="h-1/2 p-1 flex items-center">
            <p className="text-[6px] line-clamp-3 overflow-hidden">{text}</p>
          </div>
          <div className="h-1/2 bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt="Page preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      {layout === 'image-top-text-bottom' && (
        <div className="flex flex-col h-full">
          <div className="h-1/2 bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt="Page preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-1/2 p-1 flex items-center">
            <p className="text-[6px] line-clamp-3 overflow-hidden">{text}</p>
          </div>
        </div>
      )}
      
      {layout === 'full-page-image' && (
        <div className="h-full">
          <img 
            src={image || placeholderImage} 
            alt="Page preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-1">
            <p className="text-[6px] text-white line-clamp-2">{text}</p>
          </div>
        </div>
      )}
      
      {layout === 'full-page-text' && (
        <div className="h-full p-2 flex items-center justify-center">
          <p className="text-[7px] line-clamp-10">{text}</p>
        </div>
      )}
    </div>
  );
};
