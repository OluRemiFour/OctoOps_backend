import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://octo-ops.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Database Connection
const MONGODB_URL = process.env.MONGODB_URI || '';

// NOTE: Ensure you have a running MongoDB instance or valid URI in .env
mongoose.connect(MONGODB_URL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
import apiRoutes from './routes';
app.use('/api', apiRoutes);


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
