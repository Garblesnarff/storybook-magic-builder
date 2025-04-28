import React from 'react';
import { Button } from '@/components/ui/button';
// Remove toast import if unused
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
        <Label htmlFor="temperature">Temperature</Label>
        <Slider
          id="temperature"
          defaultValue={[temperature]}
          max={1}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
          disabled={isGenerating}
        />
        <p className="text-sm text-muted-foreground">
          Controls the randomness of the generated text. Higher values (e.g., 1)
          make the output more random, while lower values (e.g., 0) make it more
          deterministic.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Slider
          id="maxTokens"
          defaultValue={[maxTokens]}
          max={2000}
          step={100}
          onValueChange={(value) => setMaxTokens(value[0])}
          disabled={isGenerating}
        />
        <p className="text-sm text-muted-foreground">
          The maximum number of tokens to generate in the text completion.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="generatedText">Generated Text</Label>
        <Textarea 
          id="generatedText"
          value={generatedText}
          readOnly
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button"
          variant="secondary"
          onClick={onGenerate}
          disabled={isGenerating || !prompt}
        >
          {isGenerating ? 'Generating...' : 'Generate Text'}
        </Button>
        <Button 
          type="button"
          onClick={onApply}
          disabled={isGenerating || !generatedText}
        >
          Apply Text
        </Button>
      </div>
    </div>
  );
};
