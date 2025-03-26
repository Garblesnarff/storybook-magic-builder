
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { IMAGE_STYLES } from '@/types/book';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AIAssistantProps {
  onApplyText?: (text: string) => void;
  onApplyImage?: (imageBase64: string) => void;
  initialPrompt?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onApplyText, 
  onApplyImage,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageStyle, setImageStyle] = useState('REALISTIC');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsGeneratingText(true);
    setGeneratedText('');

    try {
      const response = await supabase.functions.invoke('generate-text', {
        body: JSON.stringify({ 
          prompt, 
          temperature,
          maxTokens
        })
      });

      if (response.error) {
        toast.error('Text generation failed', {
          description: response.error.message
        });
        console.error('Text generation error:', response.error);
        return;
      }

      setGeneratedText(response.data.text);
      toast.success('Text generated successfully!');
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('Text generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: JSON.stringify({ 
          prompt, 
          style: imageStyle
        })
      });

      if (response.error) {
        toast.error('Image generation failed', {
          description: response.error.message
        });
        console.error('Image generation error:', response.error);
        return;
      }

      const imageData = `data:image/png;base64,${response.data.image}`;
      setGeneratedImage(imageData);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Image generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleApplyText = () => {
    if (onApplyText && generatedText) {
      onApplyText(generatedText);
      toast.success('Text applied to page');
    }
  };

  const handleApplyImage = () => {
    if (onApplyImage && generatedImage) {
      onApplyImage(generatedImage);
      toast.success('Image applied to page');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>AI Book Assistant</SheetTitle>
          <SheetDescription>
            Generate text and images for your children's book using AI.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">What would you like to create?</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the text or image you want to generate..."
              className="h-24"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="text">
                <Wand2 className="mr-2 h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image">
                <Sparkles className="mr-2 h-4 w-4" />
                Image
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
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
                  onClick={handleGenerateText} 
                  className="w-full"
                  disabled={isGeneratingText || !prompt.trim()}
                >
                  {isGeneratingText ? (
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
                      onClick={handleApplyText} 
                      disabled={!generatedText}
                      className="w-full"
                    >
                      Apply to Page
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageStyle">Image Style</Label>
                  <Select
                    value={imageStyle}
                    onValueChange={(value) => setImageStyle(value)}
                  >
                    <SelectTrigger id="imageStyle">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_STYLES.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleGenerateImage} 
                  className="w-full"
                  disabled={isGeneratingImage || !prompt.trim()}
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
                
                {generatedImage && (
                  <div className="space-y-4 mt-4">
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={generatedImage} 
                        alt="AI generated" 
                        className="w-full h-auto"
                      />
                    </div>
                    <Button 
                      onClick={handleApplyImage} 
                      disabled={!generatedImage}
                      className="w-full"
                    >
                      Apply to Page
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
