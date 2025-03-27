
import React from 'react';
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
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pageText">Page Text</Label>
        <Textarea
          id="pageText"
          placeholder="Once upon a time..."
          className="h-40"
          value={currentPageData.text || ""}
          onChange={(e) => {
            // Use stopPropagation to prevent any bubbling of the event
            e.stopPropagation();
            handleTextChange(e.target.value);
          }}
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
