
import React, { useState, useEffect, useCallback } from 'react';
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
  handleTextFormattingChange,
}) => {
  // Local state for the text being edited
  const [localText, setLocalText] = useState<string>(currentPageData.text || "");

  // Update local state when the page data changes externally (e.g., switching pages)
  useEffect(() => {
    setLocalText(currentPageData.text || "");
  }, [currentPageData.id, currentPageData.text]);

  // Handle changes to the local text state
  const onLocalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };

  // Handle saving when the textarea loses focus (blur)
  const handleBlur = useCallback(() => {
    // Only save if the text has actually changed from the last saved version
    if (localText !== (currentPageData.text || "")) {
      console.log('Text changed, saving on blur:', localText.substring(0, 30) + "...");
      handleTextChange(localText);
    } else {
      console.log('Text unchanged, skipping save on blur.');
    }
  }, [localText, currentPageData.text, handleTextChange]);

  // Save any pending changes on unmount (e.g., when switching pages)
  useEffect(() => {
    // Store refs to ensure cleanup uses the latest values
    const localTextRef = { current: localText };
    const savedTextRef = { current: currentPageData.text || "" };
    const handleTextChangeRef = { current: handleTextChange };

    return () => {
      if (localTextRef.current !== savedTextRef.current) {
        console.log('Saving text on unmount:', localTextRef.current.substring(0, 30) + "...");
        handleTextChangeRef.current(localTextRef.current);
      }
    };
    // Run this effect only when the component mounts and unmounts
    // Re-running on prop changes would trigger saves incorrectly
  }, []); // Empty dependency array ensures it runs only on mount/unmount

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pageText">Page Text</Label>
        <Textarea
          id="pageText"
          placeholder="Enter your text here..."
          className="h-40"
          value={localText} // Use local state for value
          onChange={onLocalTextChange} // Update local state on change
          onBlur={handleBlur} // Save changes on blur
        />
        {/* Removed saving indicator as save is now less frequent */}
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
