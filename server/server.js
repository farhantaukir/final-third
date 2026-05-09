import './env.bootstrap.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './models/club.model.js';
import './models/user.model.js';
import './models/match.model.js';
import './models/playerStat.model.js';
import './models/announcement.model.js';
import './models/feedback.model.js';
import './models/league.model.js';
import userRoutes from './routes/user.routes.js';
import clubRoutes from './routes/club.routes.js';
import matchRoutes from './routes/match.routes.js';
import statsRoutes from './routes/stats.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import { connectDB } from './config/db.config.js';

const port = Number(process.env.PORT || 5000);

const allowedOrigins = [
  ...(process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', communicationRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

await connectDB();

app.listen(port, () => console.log(`Server listening on port ${port}`));
