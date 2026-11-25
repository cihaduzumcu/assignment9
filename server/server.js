import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById, isDuplicate, createBook, replaceBook, deleteBook } from './booksStore.js';
import { parseId, isPlainObject, validateBook, pickBookFields, validateListQuery } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

//Helpers for the list

function compareBooks(a, b, sort) {
  if (sort === 'title' || sort === 'author') {
    return a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' });
  }
  return a[sort] - b[sort];
}

function applyListOptions(books, options) {
  const { genre, read, q, sort, order, limit, page } = options;

  let result = books.filter((book) => {
    if (genre !== null && book.genre !== genre) return false;
    if (read !== null && book.read !== read) return false;
    if (
      q !== '' &&
      !book.title.toLowerCase().includes(q) &&
      !book.author.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const direction = order === 'desc' ? -1 : 1;
  result = [...result].sort((a, b) => {
    if (sort === 'rating') {
      // Books without a rating always go last, in both directions.
      if (a.rating === null && b.rating === null) return a.id - b.id;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
    }
    const diff = compareBooks(a, b, sort);
    return diff !== 0 ? diff * direction : a.id - b.id;
  });

  const start = (page - 1) * limit;
  return result.slice(start, start + limit);
}

//routes
app.get('/api/books', async (req, res) => {
  const { error, value } = validateListQuery(req.query);
  if (error) return sendError(res, 400, error);

  const books = await getAllBooks();
  res.json(applyListOptions(books, value));
});

app.get('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return sendError(res, 400, '"id" must be a positive integer');

  const book = await getBookById(id);
  if (!book) return sendError(res, 404, `Book with id ${id} not found`);

  res.json(book);
});

app.post('/api/books', async (req, res) => {
  const { error, value } = validateBook(req.body);
  if (error) return sendError(res, 400, error);

  if (await isDuplicate(value.title, value.author)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }

  const book = await createBook(value);
  res.status(201).location(`/api/books/${book.id}`).json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return sendError(res, 400, '"id" must be a positive integer');

  const { error, value } = validateBook(req.body);
  if (error) return sendError(res, 400, error);

  const existing = await getBookById(id);
  if (!existing) return sendError(res, 404, `Book with id ${id} not found`);

  if (await isDuplicate(value.title, value.author, id)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }

  const book = await replaceBook(id, value);
  res.json(book);
});

app.patch('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return sendError(res, 400, '"id" must be a positive integer');

  if (!isPlainObject(req.body)) {
    return sendError(res, 400, 'Request body must be a JSON object');
  }

  const existing = await getBookById(id);
  if (!existing) return sendError(res, 404, `Book with id ${id} not found`);

  const merged = { ...existing, ...pickBookFields(req.body) };
  const { error, value } = validateBook(merged);
  if (error) return sendError(res, 400, error);

  if (await isDuplicate(value.title, value.author, id)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }

  const book = await replaceBook(id, value);
  res.json(book);
});

app.delete('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return sendError(res, 400, '"id" must be a positive integer');

  const deleted = await deleteBook(id);
  if (!deleted) return sendError(res, 404, `Book with id ${id} not found`);

  res.status(204).end();
});

app.get('/api/stats', async (req, res) => {
  const books = await getAllBooks();

  const read = books.filter((book) => book.read).length;
  const rated = books.filter((book) => book.rating !== null);
  const averageRating =
    rated.length === 0
      ? null
      : Math.round((rated.reduce((sum, book) => sum + book.rating, 0) / rated.length) * 10) / 10;

  const byGenre = books.reduce(
    (counts, book) => ({ ...counts, [book.genre]: (counts[book.genre] ?? 0) + 1 }),
    {}
  );

  res.json({
    total: books.length,
    read,
    unread: books.length - read,
    averageRating,
    byGenre,
  });
});

app.get('/api/crash', async () => {
  throw new Error('Deliberate crash for testing');
});

app.use('/api', (req, res) => {
  sendError(res, 404, 'Not found');
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Malformed JSON in request body');
  }

  console.error(err);
  sendError(res, 500, 'Something went wrong');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});