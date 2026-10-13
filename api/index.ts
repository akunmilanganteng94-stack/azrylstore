import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../server/routes.ts';
import { getDb } from '../server/db.ts';

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Initialize database
getDb().catch((err) => {
  console.warn('DB initialization in serverless environment:', err);
});

// Mount API routes
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
