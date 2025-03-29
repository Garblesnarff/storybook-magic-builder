
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { GenerateButton } from './GenerateButton';

interface ImagePlaceholderProps {
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  isGenerating,
  onGenerate
}) => {
  return (
    <div className="text-center p-8">
      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No image generated yet</p>
      <GenerateButton isGenerating={isGenerating} onClick={onGenerate} />
    </div>
  );
};
