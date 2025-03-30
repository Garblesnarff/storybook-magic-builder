
import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface NotFoundProps {
  variant?: 'default' | 'coming-soon';
  title?: string;
  message?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ 
  variant = 'default', 
  title = 'Page Not Found', 
  message = 'The page you are looking for doesn\'t exist or has been moved.' 
}) => {
  const backgroundStyle = variant === 'coming-soon' 
    ? { 
        backgroundImage: "url('/lovable-uploads/f6b4b5dc-5c99-4d58-9dd3-2333fd132303.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } 
    : {};

  return (
    <Layout>
      <div 
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-opacity-70" 
        style={backgroundStyle}
      >
        {variant === 'default' && (
          <h1 className="font-display text-9xl font-bold text-gray-200">404</h1>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mt-4 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 max-w-md mb-8">
          {message}
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
