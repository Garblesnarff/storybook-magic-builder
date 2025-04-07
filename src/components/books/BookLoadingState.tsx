
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EditorLoading } from '@/components/editor/EditorLoading';

interface BookLoadingStateProps {
  isStuck?: boolean;
  onRetry?: () => void;
  onHardRefresh?: () => void;
}

export const BookLoadingState: React.FC<BookLoadingStateProps> = ({ 
  isStuck = false, 
  onRetry, 
  onHardRefresh 
}) => {
  const navigate = useNavigate();
  
  // If no handlers are provided, show a simple loading state
  if (!onRetry && !onHardRefresh) {
    return <EditorLoading />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600 mb-4">
        {isStuck ? 'Loading is taking longer than expected...' : 'Loading your books...'}
      </p>
      
      <div className="flex flex-col gap-2">
        <Button 
          onClick={onRetry}
          variant="outline"
          className="mt-2"
        >
          Retry loading books
        </Button>
        
        <Button 
          onClick={onHardRefresh}
          variant="secondary"
          className="mt-2"
        >
          Refresh page
        </Button>
        
        <Button 
          onClick={() => navigate('/')}
          variant="ghost"
          className="mt-2"
        >
          Return to home
        </Button>
      </div>
    </div>
  );
};
