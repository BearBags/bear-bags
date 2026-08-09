import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Serverless functions cold-start often but reuse the module scope while warm.
// Cache the connection promise on globalThis so concurrent invocations share one
// connection instead of each opening its own and exhausting the Atlas pool.
const globalForMongoose = globalThis as unknown as {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const cached = globalForMongoose.mongoose ?? { conn: null, promise: null };
globalForMongoose.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env — see db.md.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Fail fast instead of hanging the request until the platform timeout.
      serverSelectionTimeoutMS: 10_000,
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the rejected promise so the next request retries the connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
