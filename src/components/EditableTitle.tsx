
import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  maxLength?: number;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onSave,
  className = '',
  maxLength = 100
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (text.trim() !== value) {
      onSave(text.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`px-2 py-1 border rounded-md outline-none focus:ring-1 focus:ring-primary ${className}`}
          maxLength={maxLength}
          aria-label="Edit title"
        />
        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8">
          <Check className="h-4 w-4" />
          <span className="sr-only">Save</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <span className={className}>{value}</span>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Edit</span>
      </Button>
    </div>
  );
};
