export default function BookItem({ book }) {
  return (
    <li className="book">
      <div>
        <strong>{book.title}</strong> by {book.author} ({book.year}) · {book.genre}
      </div>
      <div>
        {book.read ? 'Read' : 'Unread'} · Rating: {book.rating ?? '—'}
      </div>
    </li>
  );
}