import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import appRouter from './routes.js';

const app = express();

// อยู่หลัง nginx/Tailscale เสมอในโปรดักชัน ต้องเชื่อ header X-Forwarded-For
// ไม่งั้น express-rate-limit จะเห็น IP ของ nginx เป็น IP เดียวกันหมดทุกคน
app.set('trust proxy', 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
// ไม่ตั้ง CORS_ORIGIN (เช่นตอน dev) -> เปิดกว้างเหมือนเดิม, ตั้งแล้ว -> จำกัดเฉพาะ origin นั้น
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(globalLimiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok' });
});

app.use('/api', appRouter);

// TODO: ผูก route ของ module อื่นๆ ตรงนี้ เช่น
// import vehiclesRoutes from './modules/vehicles/vehicles.routes.js';
// app.use('/api/vehicles', authenticate, vehiclesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;