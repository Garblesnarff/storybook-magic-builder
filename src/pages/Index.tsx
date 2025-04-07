
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [navigating, setNavigating] = useState(false);

  // Automatically redirect based on auth status once it's known
  useEffect(() => {
    if (!loading && user) {
      navigate('/books');
    }
  }, [user, loading, navigate]);

  const handleStartJourney = () => {
    // Show loading state immediately
    setNavigating(true);
    
    // Determine where to navigate based on auth status
    if (user) {
      navigate('/books');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: "url('/index-background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="text-center max-w-3xl px-6 py-12 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display drop-shadow-lg">
          Children's Book Generator
        </h1>
        <p className="text-xl mb-8 drop-shadow-md text-yellow-100 md:text-4xl">
          Bring Your Child's Next Favorite Story to Life.
        </p>
        
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg"
            onClick={handleStartJourney}
            disabled={navigating || loading}
          >
            {navigating || loading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {loading ? 'Checking account...' : 'Starting journey...'}
              </span>
            ) : (
              'Start Your Journey'
            )}
          </Button>
          
          <p className="mt-4 drop-shadow-sm text-xl font-extrabold">
            Storybook Creation Made Magical
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
