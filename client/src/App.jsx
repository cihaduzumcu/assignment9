import { useEffect, useState } from 'react';
import { getBooks } from './api/books.js';
import BookList from './components/BookList.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [filters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBooks(filters, controller.signal);
        setBooks(data);
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [filters]);

  return (
    <main className="app">
      <h1>Reading List</h1>
      <h2>Books</h2>
      <BookList books={books} loading={loading} error={error} />
    </main>
  );
}