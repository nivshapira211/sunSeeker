import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB connection failed: ${(error as Error).message}. Server will run but DB-dependent routes will fail until MongoDB is available.`);
  }
};

export default connectDB;
