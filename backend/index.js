import express from 'express';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import resultRoutes from './routes/result.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/results', resultRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Hegazy Exam API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          max-width: 500px;
          width: 90%;
        }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
        p { color: rgba(255,255,255,0.6); margin-bottom: 24px; font-size: 15px; }
        .badge {
          display: inline-block;
          background: #22c55e;
          color: white;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 999px;
        }
        .version {
          margin-top: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">🎓</div>
        <h1>Hegazy Exam Platform</h1>
        <p>منصة الاختبارات الإلكترونية - الخادم الخلفي</p>
        <span class="badge">✅ الخادم يعمل بنجاح</span>
        <div class="version">API Version: v1 &nbsp;|&nbsp; Status: Online</div>
      </div>
    </body>
    </html>
  `);
});

// Database connection
console.log('⏳ Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (process.env.MONGODB_URI.includes('localhost')) {
      console.warn('⚠️ Warning: Still trying to connect to localhost. Check .env file.');
    }
  });

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
