import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-700">
      </h1>
        <p className="text-xl text-gray-700 mb-8">Create magical, personalized books for children with AI-generated images and stories.</p>
        
        <div className="space-y-4">
          <Button size="lg" className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/books')}>
            Get Started
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
        </p>
        </div>
      </div>
    </div>;
};
export default Index;