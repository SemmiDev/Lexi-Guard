import mongoose from 'mongoose';

// Define the type for the cache object
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Update the global declaration to use the new type
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Explicitly type the cached variable
let cached: MongooseCache;

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

cached = global.mongoose;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  checksPerformed: { type: Number, default: 0 }
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
