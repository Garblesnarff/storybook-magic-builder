
import React from 'react';
import { TextFormatting } from '@/types/book';

interface BookTextRendererProps {
  text: string;
  textFormatting?: TextFormatting;
  previewText?: string; // New prop for displaying text in real-time
}

export const BookTextRenderer: React.FC<BookTextRendererProps> = ({ 
  text, 
  textFormatting,
  previewText
}) => {
  // Use previewText if provided, otherwise use the saved text
  const displayText = previewText !== undefined ? previewText : text;
  
  // Convert newlines to <br> tags for proper display
  const renderText = () => {
    if (!displayText) return null;
    
    return displayText.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < displayText.split('\n').length - 1 && <br />}
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
