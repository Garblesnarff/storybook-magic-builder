
import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display text-9xl font-bold text-gray-200">404</h1>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mt-4 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
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
