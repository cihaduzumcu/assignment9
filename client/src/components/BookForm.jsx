import { useState } from 'react';
import { GENRES } from '../api/books.js';

const EMPTY_FORM = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: '' };

function toFormValues(book) {
  if (!book) return EMPTY_FORM;
  return {
    title: book.title,
    author: book.author,
    year: String(book.year),
    genre: book.genre,
    read: book.read,
    rating: book.rating === null ? '' : String(book.rating),
  };
}

export default function BookForm({ initialBook, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initialBook));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = Boolean(initialBook);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const book = {
      title: values.title,
      author: values.author,
      year: Number(values.year),
      genre: values.genre,
      read: values.read,
      rating: values.read && values.rating !== '' ? Number(values.rating) : null,
    };

    try {
      await onSubmit(book);
      if (!isEdit) setValues(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? `Edit "${initialBook.title}"` : 'Add a book'}</h2>

      <label>
        Title
        <input name="title" value={values.title} onChange={handleChange} required />
      </label>

      <label>
        Author
        <input name="author" value={values.author} onChange={handleChange} required />
      </label>

      <label>
        Year
        <input name="year" type="number" value={values.year} onChange={handleChange} required />
      </label>

      <label>
        Genre
        <select name="genre" value={values.genre} onChange={handleChange}>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label>
        <input name="read" type="checkbox" checked={values.read} onChange={handleChange} />
        Read
      </label>

      <label>
        Rating
        <select name="rating" value={values.rating} onChange={handleChange} disabled={!values.read}>
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add book'}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}