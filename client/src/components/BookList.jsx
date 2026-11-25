import BookItem from './BookItem.jsx';

export default function BookList({ books, loading, error }) {
  if (loading) return <p>Loading books...</p>;
  if (error) return <p className="error">Could not load books: {error}</p>;
  if (books.length === 0) return <p>No books found.</p>;

  return (
    <ul className="book-list">
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
    </ul>
  );
}