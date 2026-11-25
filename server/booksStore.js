const seedBooks = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy', read: true, rating: 5 },
  { id: 2, title: '1984', author: 'George Orwell', year: 1949, genre: 'fiction', read: true, rating: 4 },
  { id: 3, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: false, rating: null },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: null },
  { id: 5, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'fiction', read: false, rating: null },
  { id: 6, title: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, genre: 'fantasy', read: true, rating: 3 },
];

let books = seedBooks;
let nextId = Math.max(...books.map((book) => book.id)) + 1;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DELAY_MS = 100;

export async function getAllBooks() {
  await delay(DELAY_MS);
  return books;
}

export async function getBookById(id) {
  await delay(DELAY_MS);
  return books.find((book) => book.id === id) ?? null;
}

export async function isDuplicate(title, author, excludeId = null) {
  await delay(DELAY_MS);
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  return books.some(
    (book) =>
      book.id !== excludeId &&
      book.title.toLowerCase() === t &&
      book.author.toLowerCase() === a
  );
}

export async function createBook(data) {
  await delay(DELAY_MS);
  const newBook = { ...data, id: nextId };
  nextId += 1;
  books = [...books, newBook];
  return newBook;
}

export async function replaceBook(id, data) {
  await delay(DELAY_MS);
  const updated = { ...data, id };
  books = books.map((book) => (book.id === id ? updated : book));
  return updated;
}

export async function deleteBook(id) {
  await delay(DELAY_MS);
  const exists = books.some((book) => book.id === id);
  if (!exists) return false;
  books = books.filter((book) => book.id !== id);
  return true;
}