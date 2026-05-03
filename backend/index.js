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
