
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Wand2, Loader2 } from 'lucide-react';

interface TextGenerationTabProps {
  prompt: string;
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  isGenerating: boolean;
  generatedText: string;
  onGenerate: () => Promise<void>;
  onApply: () => void;
}

export const TextGenerationTab: React.FC<TextGenerationTabProps> = ({
  prompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  isGenerating,
  generatedText,
  onGenerate,
  onApply
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
        </div>
        <Slider
          id="temperature"
          min={0.1}
          max={1.0}
          step={0.1}
          defaultValue={[temperature]}
          onValueChange={(value) => setTemperature(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          Lower values create more focused text, higher values create more creative text.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="max-tokens">Max Length: {maxTokens}</Label>
        <Slider
          id="max-tokens"
          min={100}
          max={2000}
          step={100}
          defaultValue={[maxTokens]}
          onValueChange={(value) => setMaxTokens(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          Controls the maximum length of the generated text.
        </p>
      </div>
      
      <Button 
        onClick={onGenerate} 
        className="w-full"
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Text
          </>
        )}
      </Button>
      
      {generatedText && (
        <div className="space-y-4 mt-4">
          <div className="border rounded-md p-4 bg-muted/50">
            <p className="whitespace-pre-wrap">{generatedText}</p>
          </div>
          <Button 
            onClick={onApply} 
            disabled={!generatedText}
            className="w-full"
          >
            Apply to Page
          </Button>
        </div>
      )}
    </div>
  );
};
