
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: "url('/lovable-uploads/2b1920b1-e04b-45df-b249-70805bce4a6f.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="text-center max-w-3xl px-6 py-12 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display drop-shadow-lg">Imagine Ink</h1>
        <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
          Create magical, personalized books for children with AI-generated images and stories.
        </p>
        
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg" 
            onClick={() => navigate('/books')}
          >
            Start Your Journey
          </Button>
          
          <p className="text-sm mt-4 drop-shadow-sm">
            Bring your stories to life with beautiful illustrations and unlimited imagination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
