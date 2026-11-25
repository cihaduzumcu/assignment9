import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById, isDuplicate, createBook, replaceBook, deleteBook } from './booksStore.js';
import { parseId, isPlainObject, validateBook, pickBookFields } from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

//routes
app.get('/api/books', async (req, res) => {
  const books = await getAllBooks();
  res.json(books);
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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});