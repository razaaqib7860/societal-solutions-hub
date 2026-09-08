import mongoose from 'mongoose';
import { env } from './env.js';

/** Connects to MongoDB using Mongoose and logs the outcome. */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
}

export default connectDB;
