
import React, { useState, useEffect, useRef } from 'react';
import { BookPage, TextFormatting } from '@/types/book';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TextSettingsProps {
  currentPageData: BookPage;
  handleTextChange: (value: string) => void;
  handleTextFormattingChange: (key: keyof TextFormatting, value: any) => void;
}

export const TextSettings: React.FC<TextSettingsProps> = ({
  currentPageData,
  handleTextChange,
  handleTextFormattingChange
}) => {
  // Local state for the textarea
  const [localText, setLocalText] = useState(currentPageData.text || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update local text when page changes
  useEffect(() => {
    setLocalText(currentPageData.text || "");
  }, [currentPageData.id, currentPageData.text]);
  
  // Efficient text change handler
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update local state immediately for responsive typing
    const newValue = e.target.value;
    setLocalText(newValue);
    
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a delay before sending the update to the parent
    debounceTimerRef.current = setTimeout(() => {
      handleTextChange(newValue);
    }, 800); // Wait for typing to pause before saving
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pageText">Page Text</Label>
        <Textarea
          id="pageText"
          placeholder="Once upon a time..."
          className="h-40"
          value={localText}
          onChange={onTextChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fontFamily">Font</Label>
          <Select
            value={currentPageData.textFormatting?.fontFamily || "Inter"}
            onValueChange={(value) => handleTextFormattingChange('fontFamily', value)}
          >
            <SelectTrigger id="fontFamily">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="fontSize">Size</Label>
          <Select 
            value={String(currentPageData.textFormatting?.fontSize || "16")} 
            onValueChange={(value) => handleTextFormattingChange('fontSize', parseInt(value))}
          >
            <SelectTrigger id="fontSize">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="24">24px</SelectItem>
              <SelectItem value="28">28px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
