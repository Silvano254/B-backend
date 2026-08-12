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

// HTTP Request Logging Middleware for Render Logs
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const color = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `[HTTP LOG] ${timestamp} | IP: ${clientIp} | ${req.method} ${req.originalUrl} | Status: ${color}${statusCode}\x1b[0m | Duration: ${duration}ms`
    );
  });

  next();
});

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

const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

app.listen(portNum, '0.0.0.0', () => {
  console.log(`[Binance Signal Pro Backend] Express server bound to 0.0.0.0:${portNum}`);
});
