import express from 'express';
import cors from 'cors';

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



app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});