import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById } from './booksStore.js';
import { parseId } from './validate.js'

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});