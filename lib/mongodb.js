import mongoose from 'mongoose';

// Fix MongoDB URI if it has double @ symbols and validate format
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetmogger-ai';

// Clean up common MongoDB URI issues
MONGODB_URI = MONGODB_URI
  .replace('@@', '@')  // Remove extra @ symbol
  .trim();             // Remove whitespace

console.log('MongoDB URI format check:', {
  hasDoubleAt: MONGODB_URI.includes('@@'),
  startsWithMongodb: MONGODB_URI.startsWith('mongodb'),
  length: MONGODB_URI.length,
  // Log URI without password for security
  sanitized: MONGODB_URI.replace(/:[^:@]+@/, ':****@')
});

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Validate MongoDB URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,          // 45 second socket timeout
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
      // Removed serverSelectionRetryDelayMS as it's not supported in current Mongoose version
    };

    console.log('🔄 Attempting MongoDB connection...');
    console.log('📍 Connection details:', {
      uri: MONGODB_URI.replace(/:[^:@]+@/, ':****@'),
      options: opts
    });

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      console.log('📊 Connection info:', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      });
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      // Provide specific error messages for common issues
      if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
        console.error('💡 Authentication Error - Possible causes:');
        console.error('   - Incorrect username or password in MongoDB URI');
        console.error('   - Database user does not exist in MongoDB Atlas');
        console.error('   - Database user lacks proper permissions');
        console.error('   - Check MongoDB Atlas > Database Access > Database Users');
      } else if (error.message.includes('Could not connect to any servers')) {
        console.error('💡 Connection Error - Possible causes:');
        console.error('   - MongoDB Atlas cluster is paused or deleted');
        console.error('   - Network connectivity issues');
        console.error('   - Incorrect connection string');
        console.error('   - IP whitelist restrictions (add 0.0.0.0/0 for all IPs)');
      } else if (error.message.includes('@@')) {
        console.error('💡 URI Format Error:');
        console.error('   - Double @ symbol detected in MongoDB URI');
        console.error('   - Correct format: mongodb+srv://username:password@cluster.mongodb.net/');
      }
      
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error in connectDB:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;