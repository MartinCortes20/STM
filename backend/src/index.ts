import express from 'express';
import cors from 'cors';
import workerRoutes from './presentation/routes/workerRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/workers', workerRoutes);

// Skip listen() on Vercel — exported app is used as serverless handler
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`STM Backend running on http://localhost:${PORT}`);
  });
}

export default app;
