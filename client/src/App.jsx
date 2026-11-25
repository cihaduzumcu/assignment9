import { useEffect, useState } from 'react';
import { getBooks, getStats, createBook, replaceBook } from './api/books.js';
import BookList from './components/BookList.jsx';
import BookControls from './components/BookControls.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import BookForm from './components/BookForm.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [statsKey, setStatsKey] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingBook, setEditingBook] = useState(null);

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
  }, [filters, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getStats(controller.signal);
        setStats(data);
        setStatsError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStatsError(err.message);
      }
    }

    load();
    return () => controller.abort();
  }, [statsKey]);

  function refreshStats() {
    setStatsKey((key) => key + 1);
  }
  
  async function handleCreate(book) {
    await createBook(book);
    setReloadKey((key) => key + 1);
    refreshStats();
  }

  async function handleReplace(book) {
    const updated = await replaceBook(editingBook.id, book);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditingBook(null);
    refreshStats();
  }

  return (
    <main className="app">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} error={statsError} />
      {editingBook ? (
        <BookForm
          key={editingBook.id}
          initialBook={editingBook}
          onSubmit={handleReplace}
          onCancel={() => setEditingBook(null)}
        />
      ) : (
        <BookForm onSubmit={handleCreate} />
      )}
      <h2>Books</h2>
      <BookControls filters={filters} onChange={setFilters} />
      <BookList
        books={books}
        loading={loading}
        error={error}
        onEdit={setEditingBook}
      />
    </main>
  );
}