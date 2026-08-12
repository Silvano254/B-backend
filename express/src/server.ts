import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB if MONGO_URI is provided
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('[MongoDB] Connected to MongoDB database successfully'))
    .catch((err) => console.error('[MongoDB] Database connection error:', err.message));
} else {
  console.log('[MongoDB] MONGO_URI environment variable not specified, running in stateless mode');
}

// CORS setup to allow separate frontend hosting
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive default for hosting versatility
      }
    },
    credentials: true,
  })
);

// JSON Body Parser
app.use(express.json());

// Mount API routes under /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Binance Signal Pro API Backend',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Binance Signal Pro Backend] Express server running on port ${PORT}`);
});
