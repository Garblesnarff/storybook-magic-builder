
import React from 'react';
import { TextFormatting } from '@/types/book';

interface BookTextRendererProps {
  text: string;
  textFormatting?: TextFormatting;
}

export const BookTextRenderer: React.FC<BookTextRendererProps> = ({ 
  text, 
  textFormatting 
}) => {
  // Convert newlines to <br> tags for proper display
  const renderText = () => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div 
      style={{ 
        fontFamily: textFormatting?.fontFamily || 'Inter',
        fontSize: `${textFormatting?.fontSize || 16}px`,
        color: textFormatting?.fontColor || '#000000',
        fontWeight: textFormatting?.isBold ? 'bold' : 'normal',
        fontStyle: textFormatting?.isItalic ? 'italic' : 'normal',
        whiteSpace: 'pre-wrap'
      }}
    >
      {renderText()}
    </div>
  );
};
