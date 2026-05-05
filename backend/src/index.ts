import express from 'express';
import cors from 'cors';
import workerRoutes from './presentation/routes/workerRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/workers', workerRoutes);

app.listen(PORT, () => {
  console.log(`STM Backend running on http://localhost:${PORT}`);
});
