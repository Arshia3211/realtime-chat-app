import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { UPLOADS_DIR, useLocalStorage } from './services/storage.service.js';

const app = express();

// Needed for correct client IPs (rate limiting) behind a reverse proxy in production.
if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Realtime Chat API is running',
    health: '/api/health',
  });
});

// Development-only local uploads (see services/storage.service.js). The client runs
// on another origin, so these files must be allowed to load cross-origin.
if (useLocalStorage) {
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(UPLOADS_DIR, { index: false, dotfiles: 'deny', maxAge: '7d', immutable: true }),
  );
}

app.use('/api', apiLimiter, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
