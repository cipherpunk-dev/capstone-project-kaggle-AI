import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import vivaRoutes from './routes/viva.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

// ESM doesn't have __dirname, so we derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// In production, frontend is served from the same origin — no CORS needed.
// In dev, allow localhost origins for the Vite dev server.
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  app.use(cors());
} else {
  // Same-origin requests don't need CORS headers.
  // Only enable if you have a separate frontend domain.
  app.use(cors({ origin: false }));
}

app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/viva', vivaRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Static File Serving (Production) ---
// Serve the built React frontend from frontend/dist
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Catch-all: any request that doesn't match an API route
// serves index.html so React Router can handle client-side routing.
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  } else {
    next();
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!isProduction) {
      console.log(`Frontend dev server proxy expected at http://localhost:5173`);
    } else {
      console.log(`Serving frontend from ${frontendDistPath}`);
    }
  });
}

export default app;
