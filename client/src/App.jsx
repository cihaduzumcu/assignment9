import { useEffect, useState } from 'react';
import { getBooks, getStats } from './api/books.js';
import BookList from './components/BookList.jsx';
import BookControls from './components/BookControls.jsx';
import StatsPanel from './components/StatsPanel.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [statsKey, setStatsKey] = useState(0);

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

  return (
    <main className="app">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} error={statsError} />
      <h2>Books</h2>
      <BookControls filters={filters} onChange={setFilters} />
      <BookList books={books} loading={loading} error={error} />
    </main>
  );
}