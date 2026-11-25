import { GENRES } from '../api/books.js';

export default function BookControls({ filters, onChange }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  }

  return (
    <div className="controls">
      <input
        type="search"
        name="q"
        placeholder="Search title or author"
        value={filters.q}
        onChange={handleChange}
      />

      <select name="genre" value={filters.genre} onChange={handleChange}>
        <option value="">All genres</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <select name="read" value={filters.read} onChange={handleChange}>
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>

      <select name="sort" value={filters.sort} onChange={handleChange}>
        <option value="">Sort by id</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="rating">Rating</option>
      </select>

      <select name="order" value={filters.order} onChange={handleChange}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}