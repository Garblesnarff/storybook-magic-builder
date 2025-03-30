
import React, { useEffect, useState } from 'react';
import { TextFormatting } from '@/types/book';

interface BookTextRendererProps {
  text: string;
  textFormatting?: TextFormatting;
  previewText?: string; // For displaying text in real-time
}

export const BookTextRenderer: React.FC<BookTextRendererProps> = ({ 
  text, 
  textFormatting,
  previewText
}) => {
  // Use a local state to prevent flashing of old content
  const [displayText, setDisplayText] = useState(previewText !== undefined ? previewText : text);
  
  // Update the display text when props change, but use transitions to prevent flashing
  useEffect(() => {
    const nextText = previewText !== undefined ? previewText : text;
    setDisplayText(nextText);
  }, [previewText, text]);
  
  // Convert newlines to <br> tags for proper display
  const renderText = () => {
    if (!displayText) return null;
    
    return displayText.split('\n').map((line, i) => (
      // *** Changed React.Fragment to span ***
      <span key={i}>
        {line}
        {i < displayText.split('\n').length - 1 && <br />}
      </span>
      // ************************************
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
