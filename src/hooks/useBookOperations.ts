
import { Book } from '../types/book';
import { 
  useBookData,
  useBookCreation,
  useBookModification,
  useBookFetching
} from './book';

export function useBookOperations() {
  const {
    books,
    setBooks,
    currentBook,
    setCurrentBook,
    loading,
    error
  } = useBookData();

  const {
    createBook,
    createBookFromTemplate
  } = useBookCreation(books, setBooks, setCurrentBook);

  const {
    updateBook,
    deleteBook
  } = useBookModification(books, currentBook, setBooks, setCurrentBook);

  const {
    loadBook
  } = useBookFetching(setCurrentBook);

  return {
    books,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook,
    deleteBook,
    loadBook,
    loading,
    error,
    setBooks,
    setCurrentBook
  };
}
