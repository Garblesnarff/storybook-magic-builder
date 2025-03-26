
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
  const { text, image, layout, pageNumber } = page;
  
  const placeholderImage = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1546&q=80';
  
  // Get first 30 characters of text
  const previewText = text.length > 30 ? `${text.substring(0, 30)}...` : text;
  
  return (
    <div 
      className={cn(
        "relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]",
        selected 
          ? "border-primary shadow-md" 
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <div className="absolute left-2 top-2 w-6 h-6 bg-white/80 backdrop-blur-sm text-xs font-medium rounded-full flex items-center justify-center">
        {pageNumber + 1}
      </div>
      
      {/* Layout preview based on the layout type */}
      {layout === 'text-left-image-right' && (
        <div className="flex h-full">
          <div className="w-1/2 p-2 flex items-center">
            <p className="text-[8px] line-clamp-5">{previewText}</p>
          </div>
          <div className="w-1/2 h-full bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt={`Preview for page ${pageNumber + 1}`}
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
              alt={`Preview for page ${pageNumber + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 p-2 flex items-center">
            <p className="text-[8px] line-clamp-5">{previewText}</p>
          </div>
        </div>
      )}
      
      {layout === 'text-top-image-bottom' && (
        <div className="flex flex-col h-full">
          <div className="h-1/2 p-2 flex items-center">
            <p className="text-[8px] line-clamp-5">{previewText}</p>
          </div>
          <div className="h-1/2 bg-gray-100">
            <img 
              src={image || placeholderImage} 
              alt={`Preview for page ${pageNumber + 1}`}
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
              alt={`Preview for page ${pageNumber + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-1/2 p-2 flex items-center">
            <p className="text-[8px] line-clamp-5">{previewText}</p>
          </div>
        </div>
      )}
      
      {layout === 'full-page-image' && (
        <div className="h-full">
          <img 
            src={image || placeholderImage} 
            alt={`Preview for page ${pageNumber + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-2">
            <p className="text-[8px] text-white">{previewText}</p>
          </div>
        </div>
      )}
      
      {layout === 'full-page-text' && (
        <div className="h-full p-3 flex items-center justify-center">
          <p className="text-[10px] line-clamp-8">{text}</p>
        </div>
      )}
    </div>
  );
};
