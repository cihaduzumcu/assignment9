const BASE_URL = import.meta.env.VITE_API_URL;

export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!BASE_URL) {
    throw new Error('VITE_API_URL is not set. Copy client/.env.example to client/.env');
  }

  const options = { method, signal, headers: {} };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }

  return data;
}

export function getBooks(filters = {}, signal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return request(`/books${query ? `?${query}` : ''}`, { signal });
}

export function getBook(id, signal) {
  return request(`/books/${encodeURIComponent(id)}`, { signal });
}

export function createBook(book) {
  return request('/books', { method: 'POST', body: book });
}

export function replaceBook(id, book) {
  return request(`/books/${encodeURIComponent(id)}`, { method: 'PUT', body: book });
}

export function updateBook(id, changes) {
  return request(`/books/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });
}

export function deleteBook(id) {
  return request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getStats(signal) {
  return request('/stats', { signal });
}