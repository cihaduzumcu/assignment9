Requirements
Node.js (current LTS) and npm
Git Bash (or any Unix-like shell) for the commands below
Installation and running
Server
```bash
cd server
npm install
npm run dev # development, restarts on changes (node --watch)
npm start # normal start
```

The server runs on http://localhost:3000 by default.

Variable	Default	Meaning
PORT	3000	Port of the API
CLIENT_ORIGIN	http://localhost:5173	The only origin allowed by CORS
Example with other values (Git Bash): PORT=4000 CLIENT_ORIGIN=http://localhost:5173 npm run dev

Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client runs on http://localhost:5173.
Variable: VITE_API_URL
Example: http://localhost:3000/api
Meaning: Base URL of the API, read with import.meta.env

If the server port changes, update VITE_API_URL in client/.env and restart Vite. No Vite proxy is used: the server sends the CORS headers itself with the cors package.

File organization:
/server
- server.js Express app: middleware, routes, 404 fallback, error handler
- booksStore.js In-memory data, async functions, immutable updates
- validate.js Hand-written validation for ids, books and query options
- package.json
- package-lock.json
/client
- books.js All fetch calls and the shared request helper
- BookControls.jsx Search, genre, read, sort and order controls
- BookList.jsx Loading, error and empty states
- BookItem.jsx One book: read toggle, rating, edit, delete
- BookForm.jsx Add form and edit form (PUT)
- StatsPanel.jsx Statistics from GET /api/stats
- App.jsx State, effects with AbortController, handlers
- main.jsx
- index.css
- .env.example
- index.html
- package.json
- .gitignore
- README.md

API overview:
Method and path - Success - Errors
GET /api/books	200	400
GET /api/books/:id	200	400, 404
POST /api/books	201 + Location	400, 409
PUT /api/books/:id	200	400, 404, 409
PATCH /api/books/:id	200	400, 404, 409
DELETE /api/books/:id	204	400, 404
GET /api/stats	200	—
GET /api/crash	—	500 (test route)

Query options for GET /api/books: genre, read, q, sort (title, author, year, rating), order (asc, desc), limit (1–50), page.
GET /api/crash is a test route that throws inside an async handler on purpose. It proves that Express 5 passes the error to the error-handling middleware, which logs it and answers 500 with { "error": "Something went wrong" }.