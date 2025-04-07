
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AuthRequiredState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
      <p className="text-gray-600 mb-8 text-center">
        Please sign in to view and create books.
      </p>
      <Button 
        onClick={() => navigate('/auth')}
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        size="lg"
      >
        Go to Sign In
      </Button>
    </div>
  );
};
