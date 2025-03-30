
import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ 
        backgroundImage: `url('/lovable-uploads/40fa0d1a-99fb-4379-8645-27d32329b2bc.png')`,
        backgroundAttachment: "fixed" 
      }}
    >
      <div className="glass-panel rounded-xl p-8 max-w-md text-center">
        <h1 className="font-display text-5xl font-bold text-primary mb-6">Coming Soon</h1>
        <p className="text-gray-800 text-lg mb-8">
          The editor feature is under construction and will be available soon. 
          We're working hard to bring you an amazing book creation experience.
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
