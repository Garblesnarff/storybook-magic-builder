
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookPage, DEFAULT_BOOK, DEFAULT_PAGE } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  createBook: () => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  loadBook: (id: string) => void;
  addPage: () => void;
  updatePage: (page: BookPage) => void;
  deletePage: (id: string) => void;
  reorderPage: (id: string, newPosition: number) => void;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};

// Function to save books to localStorage with error handling
const saveBooks = (books: Book[]) => {
  try {
    // Store basic book metadata separately from page content
    const bookMetadata = books.map(book => ({
      ...book,
      pages: book.pages.map(page => ({
        id: page.id,
        pageNumber: page.pageNumber,
        // Don't store images in localStorage to reduce size
        image: page.image ? 'image-exists' : undefined,
        layout: page.layout,
        backgroundColor: page.backgroundColor,
        textFormatting: page.textFormatting
      }))
    }));
    
    localStorage.setItem('books-metadata', JSON.stringify(bookMetadata));
    
    // Store each book's content separately to avoid hitting storage limits
    books.forEach(book => {
      try {
        book.pages.forEach(page => {
          if (page.text) {
            localStorage.setItem(`book-${book.id}-page-${page.id}-text`, page.text);
          }
          
          // Store images separately (might still fail due to size)
          if (page.image) {
            try {
              localStorage.setItem(`book-${book.id}-page-${page.id}-image`, page.image);
            } catch (e) {
              console.warn(`Failed to store image for book ${book.id}, page ${page.id}`, e);
              // Don't throw error here, just continue without storing the image
            }
          }
        });
      } catch (e) {
        console.error(`Error storing book ${book.id} data`, e);
      }
    });
  } catch (e) {
    console.error('Failed to save books to localStorage', e);
    toast.error('Failed to save your books locally. Some data may be lost when you reload.');
  }
};

// Function to load books from localStorage with error handling
const loadBooks = (): Book[] => {
  try {
    // Load book metadata
    const savedMetadata = localStorage.getItem('books-metadata');
    if (!savedMetadata) return [];
    
    const bookMetadata = JSON.parse(savedMetadata) as Book[];
    
    // Reconstruct full books with page content
    return bookMetadata.map(book => {
      const fullPages = book.pages.map(page => {
        // Load text content
        let text = '';
        try {
          const savedText = localStorage.getItem(`book-${book.id}-page-${page.id}-text`);
          if (savedText) text = savedText;
        } catch (e) {
          console.warn(`Failed to load text for book ${book.id}, page ${page.id}`, e);
        }
        
        // Load image
        let image = undefined;
        if (page.image === 'image-exists') {
          try {
            image = localStorage.getItem(`book-${book.id}-page-${page.id}-image`) || undefined;
          } catch (e) {
            console.warn(`Failed to load image for book ${book.id}, page ${page.id}`, e);
          }
        }
        
        return {
          ...page,
          text: text || 'Once upon a time...',
          image
        } as BookPage;
      });
      
      return {
        ...book,
        pages: fullPages
      };
    });
  } catch (e) {
    console.error('Failed to load books from localStorage', e);
    toast.error('Failed to load your saved books. Starting with a new book.');
    return [];
  }
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Load books from storage on initial mount
  useEffect(() => {
    try {
      const savedBooks = loadBooks();
      if (savedBooks.length) {
        setBooks(savedBooks);
      } else {
        // Create a sample book if no books exist
        const sampleBook = createNewBook();
        setBooks([sampleBook]);
        saveBooks([sampleBook]);
      }
    } catch (e) {
      console.error('Error initializing books', e);
      // Fallback to a new book
      const sampleBook = createNewBook();
      setBooks([sampleBook]);
    }
  }, []);

  // Save books whenever they change, but not more often than every 2 seconds
  useEffect(() => {
    if (books.length) {
      const timeoutId = setTimeout(() => {
        saveBooks(books);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [books]);

  const createNewBook = (): Book => {
    const newBook: Book = {
      ...DEFAULT_BOOK,
      id: uuidv4(),
      pages: [createNewPage(0)]
    };
    return newBook;
  };

  const createNewPage = (pageNumber: number): BookPage => {
    return {
      ...DEFAULT_PAGE,
      id: uuidv4(),
      pageNumber
    };
  };

  const createBook = () => {
    const newBook = createNewBook();
    setBooks([...books, newBook]);
    setCurrentBook(newBook);
  };

  const updateBook = (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? 
        { ...updatedBook, updatedAt: new Date().toISOString() } : 
        book
    );
    setBooks(updatedBooks);
    
    if (currentBook?.id === updatedBook.id) {
      setCurrentBook({ ...updatedBook, updatedAt: new Date().toISOString() });
    }
  };

  const deleteBook = (id: string) => {
    const filteredBooks = books.filter(book => book.id !== id);
    setBooks(filteredBooks);
    
    if (currentBook?.id === id) {
      setCurrentBook(filteredBooks.length ? filteredBooks[0] : null);
    }
  };

  const loadBook = (id: string) => {
    const book = books.find(book => book.id === id);
    if (book) {
      setCurrentBook(book);
    }
  };

  const addPage = () => {
    if (!currentBook) return;

    const newPage = createNewPage(currentBook.pages.length);
    const updatedBook = {
      ...currentBook,
      pages: [...currentBook.pages, newPage],
      updatedAt: new Date().toISOString()
    };

    updateBook(updatedBook);
  };

  const updatePage = (updatedPage: BookPage) => {
    if (!currentBook) return;

    const updatedPages = currentBook.pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    );

    const updatedBook = {
      ...currentBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };

    updateBook(updatedBook);
  };

  const deletePage = (id: string) => {
    if (!currentBook) return;

    const filteredPages = currentBook.pages.filter(page => page.id !== id);
    
    // Reorder page numbers
    const reorderedPages = filteredPages.map((page, index) => ({
      ...page,
      pageNumber: index
    }));

    const updatedBook = {
      ...currentBook,
      pages: reorderedPages,
      updatedAt: new Date().toISOString()
    };

    updateBook(updatedBook);
  };

  const reorderPage = (id: string, newPosition: number) => {
    if (!currentBook) return;
    
    const pageIndex = currentBook.pages.findIndex(page => page.id === id);
    if (pageIndex === -1) return;
    
    const reorderedPages = [...currentBook.pages];
    const [movedPage] = reorderedPages.splice(pageIndex, 1);
    reorderedPages.splice(newPosition, 0, movedPage);
    
    // Update page numbers
    const updatedPages = reorderedPages.map((page, index) => ({
      ...page,
      pageNumber: index
    }));
    
    const updatedBook = {
      ...currentBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };
    
    updateBook(updatedBook);
  };

  return (
    <BookContext.Provider
      value={{
        books,
        currentBook,
        createBook,
        updateBook,
        deleteBook,
        loadBook,
        addPage,
        updatePage,
        deletePage,
        reorderPage
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
