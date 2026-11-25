export default function BookItem({ book, onEdit }) {
  return (
    <li className="book">
      <div>
        <strong>{book.title}</strong> by {book.author} ({book.year}) · {book.genre}
      </div>
      <div className="book-actions">
        {book.read ? 'Read' : 'Unread'} · Rating: {book.rating ?? '—'}
        <button type="button" onClick={() => onEdit(book)}>
          Edit
        </button>
      </div>
    </li>
  );
}