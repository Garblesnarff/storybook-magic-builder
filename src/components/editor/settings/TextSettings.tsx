
import React, { useState, useEffect, useCallback } from 'react';
import { BookPage, TextFormatting } from '@/types/book';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
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
  isNarrating?: boolean;
  handleGenerateNarration?: () => Promise<void>;
}

export const TextSettings: React.FC<TextSettingsProps> = ({
  currentPageData,
  handleTextChange,
  handleTextFormattingChange,
  isNarrating = false,
  handleGenerateNarration
}) => {
  const [localText, setLocalText] = useState(currentPageData.text || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when the currentPageData changes
  useEffect(() => {
    if (currentPageData.text !== localText) {
      setLocalText(currentPageData.text || "");
    }
  }, [currentPageData.id, currentPageData.text]);

  // Debounced save handler
  const saveChanges = useCallback(() => {
    if (localText !== currentPageData.text) {
      setIsSaving(true);
      handleTextChange(localText);
      setIsSaving(false);
    }
  }, [localText, currentPageData.text, handleTextChange]);

  // Handle text input
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };

  // Save on blur
  const onBlur = () => {
    saveChanges();
  };

  // Save changes before unmounting if needed
  useEffect(() => {
    return () => {
      if (localText !== currentPageData.text) {
        handleTextChange(localText);
      }
    };
  }, [localText, currentPageData.text, handleTextChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pageText">Page Text</Label>
        <Textarea
          id="pageText"
          placeholder="Enter your text here..."
          className="h-40"
          value={localText}
          onChange={onTextChange}
          onBlur={onBlur}
        />
        {isSaving && <p className="text-sm text-muted-foreground">Saving...</p>}
      </div>

      {/* Font Selection */}
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

      {/* Narration Section */}
      {handleGenerateNarration && (
        <div className="pt-4 border-t mt-4">
          <Label>Narration</Label>
          <Button
            onClick={handleGenerateNarration}
            disabled={isNarrating || !localText?.trim()}
            className="w-full mt-2"
          >
            {isNarrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Generate Narration
              </>
            )}
          </Button>
          {currentPageData.narrationUrl && (
            <div className="mt-3">
              <Label>Listen:</Label>
              <audio controls src={currentPageData.narrationUrl} className="w-full mt-1">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
