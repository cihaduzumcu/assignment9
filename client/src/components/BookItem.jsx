import { useState } from 'react';

export default function BookItem({ book, onEdit, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleToggleRead() {
    const changes = book.read ? { read: false, rating: null } : { read: true };
    run(() => onUpdate(book.id, changes));
  }

  function handleRatingChange(event) {
    const value = event.target.value;
    run(() => onUpdate(book.id, { rating: value === '' ? null : Number(value) }));
  }

  function handleDelete() {
    run(() => onDelete(book.id));
  }

  return (
    <li className="book">
      <div>
        <strong>{book.title}</strong> by {book.author} ({book.year}) · {book.genre}
      </div>

      <div className="book-actions">
        <label>
          <input type="checkbox" checked={book.read} onChange={handleToggleRead} disabled={busy} />
          Read
        </label>

        <select
          value={book.rating ?? ''}
          onChange={handleRatingChange}
          disabled={busy || !book.read}
          aria-label="Rating"
        >
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {'★'.repeat(n)}
            </option>
          ))}
        </select>

        <button type="button" onClick={() => onEdit(book)} disabled={busy}>
          Edit
        </button>
        <button type="button" onClick={handleDelete} disabled={busy}>
          Delete
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </li>
  );
}