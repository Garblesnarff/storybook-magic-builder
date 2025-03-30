
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/lovable-uploads/ecc0676a-5fea-4107-8ce4-e0c8f8d32d9d.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="text-center max-w-3xl px-6 py-12 rounded-xl backdrop-blur-sm bg-black/30">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-display">
          Imagine Ink
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8">
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
          
          <p className="text-sm text-white/80 mt-4">
            Bring your stories to life with beautiful illustrations and unlimited imagination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
