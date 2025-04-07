
import { useState, useEffect } from 'react';
import { useBook } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BookTemplate } from '@/data/bookTemplates';

export function useBookPageState() {
  const { 
    books, 
    createBook, 
    createBookFromTemplate, 
    updateBook,
    deleteBook, 
    loading: booksLoading,
    error: booksError,
    retryLoading
  } = useBook();
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  
  // Report any errors that occur during book loading
  useEffect(() => {
    if (booksError) {
      console.error('Error loading books:', booksError);
      toast.error('Failed to load books. Please try again.');
    }
  }, [booksError]);
  
  // Track when initial loading is complete to avoid getting stuck in loading state
  useEffect(() => {
    // If user exists and loading has been going on for a while, consider it complete
    if (!authLoading && user) {
      const timer = setTimeout(() => {
        console.log("Setting initial load complete due to timeout");
        setInitialLoadComplete(true);
        
        // If still loading after 8 seconds, consider it stuck
        if (booksLoading) {
          const stuckTimer = setTimeout(() => {
            console.log("Books loading is taking too long, considering stuck");
            setIsStuck(true);
          }, 5000); // 5 more seconds after initial load timeout
          
          return () => clearTimeout(stuckTimer);
        }
      }, 3000); // 3 seconds max to load books
      
      return () => clearTimeout(timer);
    }
    
    // If not authenticated, mark load as complete immediately
    if (!authLoading && !user) {
      setInitialLoadComplete(true);
    }
    
    // If books loading completes naturally, mark as complete
    if (!booksLoading && user) {
      setInitialLoadComplete(true);
      setIsStuck(false); // Reset stuck state if loading completes
    }
  }, [authLoading, user, booksLoading]);

  // Auto-retry logic
  useEffect(() => {
    if (booksLoading && initialLoadComplete && retryAttempt < 2) {
      const timer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryAttempt + 1}`);
        retryLoading();
        setRetryAttempt(prev => prev + 1);
      }, 3000); // Wait 3 seconds before auto-retrying
      
      return () => clearTimeout(timer);
    }
  }, [booksLoading, initialLoadComplete, retryAttempt, retryLoading]);
  
  const handleCreateBook = async () => {
    try {
      const newBookId = await createBook();
      if (newBookId) {
        navigate(`/editor/${newBookId}`);
        toast.success('Book created successfully');
      }
    } catch (error) {
      console.error('Error creating book', error);
      toast.error('Failed to create book');
    }
  };
  
  const handleCreateBookFromTemplate = async (template: BookTemplate) => {
    try {
      const newBookId = await createBookFromTemplate(template);
      if (newBookId) {
        navigate(`/editor/${newBookId}`);
        toast.success('Book created from template');
      }
    } catch (error) {
      console.error('Error creating book from template', error);
      toast.error('Failed to create book from template');
    }
  };
  
  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
      toast.success('Book deleted');
    } catch (error) {
      console.error('Error deleting book', error);
      toast.error('Failed to delete book');
    }
  };

  const handleRetry = () => {
    console.log('Manually retrying book loading');
    retryLoading();
    setInitialLoadComplete(false);
    setIsStuck(false);
    setRetryAttempt(0);
    
    // Set a new timer to detect if still stuck
    setTimeout(() => {
      setInitialLoadComplete(true);
    }, 5000);
  };

  const handleHardRefresh = () => {
    // Force a hard reload of the page
    window.location.reload();
  };
  
  // Computer loading state
  const isInitialLoading = (authLoading || (booksLoading && !initialLoadComplete)) && user;
  const isLoadingStuck = (initialLoadComplete && booksLoading) || isStuck;
  
  return {
    books,
    user,
    updateBook,
    isInitialLoading,
    isLoadingStuck,
    isAuthenticated: !!user,
    handleCreateBook,
    handleCreateBookFromTemplate,
    handleDeleteBook,
    handleRetry,
    handleHardRefresh
  };
}
