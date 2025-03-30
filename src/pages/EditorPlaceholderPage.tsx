import React from 'react';
import { Layout } from '../components/Layout'; // Corrected relative path
import { Button } from '../components/ui/button'; // Corrected relative path
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Use the confirmed background image path from the public directory
const backgroundImageUrl = '/editor-background.png'; // Using the confirmed filename

const EditorPlaceholderPage: React.FC = () => {
  return (
    // Use Layout with fullWidth to fill horizontally (respecting sidebar padding)
    <Layout fullWidth={true}>
      {/* This div fills the <main> element (which has min-h-screen) */}
      <div
        className="min-h-screen flex flex-col items-center justify-end bg-cover bg-center p-4 pb-4" // Changed pb-8 to pb-4 to move box very low
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        {/* Content box pushed towards bottom */}
        <div className="bg-white/80 dark:bg-black/70 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-xl max-w-lg text-center">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Advanced Editor Coming Soon!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This section is reserved for more detailed editing features planned for after the competition.
          </p>
          <Link to="/books">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Books
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default EditorPlaceholderPage;
