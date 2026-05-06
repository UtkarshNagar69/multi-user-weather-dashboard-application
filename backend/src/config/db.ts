import mongoose from 'mongoose';

// Cache the connection for serverless environments (Vercel)
let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/weatherdash';
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

export default connectDB;
