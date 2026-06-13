import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import skillsRouter from './routes/skills';
import projectsRouter from './routes/projects';
import lessonsRouter from './routes/lessons';
import goalsRouter from './routes/goals';
import techStackRouter from './routes/techStack';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/tech-stack-options', techStackRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`BE running on http://localhost:${PORT}`);
});
