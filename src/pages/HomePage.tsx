import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Download, Image } from 'lucide-react';

const HomePage = () => {
  return (
    <Layout>
      <div className="min-h-screen py-10 flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Create magical children's books with ease
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Design personalized storybooks with beautiful illustrations and bring your stories to life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/books">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <BookOpen className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </Link>
            <Link to="/books">
              <Button variant="outline" className="w-full sm:w-auto">
                View My Books
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="glass-panel rounded-xl p-6">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">AI-Generated Illustrations</h3>
            <p className="text-gray-600">Transform your words into beautiful, unique illustrations with our AI image generator.</p>
          </div>
          
          <div className="glass-panel rounded-xl p-6">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Image className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Customizable Templates</h3>
            <p className="text-gray-600">Choose from multiple page layouts and design elements to create the perfect book.</p>
          </div>
          
          <div className="glass-panel rounded-xl p-6">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Easy PDF Export</h3>
            <p className="text-gray-600">Export your creation as a high-quality PDF ready for printing or digital sharing.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
