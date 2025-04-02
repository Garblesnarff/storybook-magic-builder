
import React from 'react';
import { ZoomIn, ZoomOut, Move, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ZoomControlsProps {
  scale: number;
  fitMethod: 'contain' | 'cover';
  isInteractionReady: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFitMethod: () => void;
  onReset: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  canReset?: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  fitMethod,
  isInteractionReady,
  onZoomIn,
  onZoomOut,
  onToggleFitMethod,
  onReset,
  canZoomIn = true,
  canZoomOut = true,
  canReset = false
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        onClick={onZoomIn}
        disabled={!canZoomIn || !isInteractionReady}
      >
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom In</span>
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        onClick={onZoomOut}
        disabled={!canZoomOut || !isInteractionReady}
      >
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom Out</span>
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        onClick={onToggleFitMethod}
        title={fitMethod === 'contain' ? 'Switch to cover mode' : 'Switch to contain mode'}
        disabled={!isInteractionReady}
      >
        <Move className="h-4 w-4" />
        <span className="sr-only">
          {fitMethod === 'contain' ? 'Switch to cover mode' : 'Switch to contain mode'}
        </span>
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        onClick={onReset}
        disabled={!canReset || !isInteractionReady}
      >
        <RefreshCw className="h-4 w-4" />
        <span className="sr-only">Reset View</span>
      </Button>
    </div>
  );
};
