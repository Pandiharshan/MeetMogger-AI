import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loginUser, registerUser, authenticateToken, getUserById } from './services/authService.js';
import { analyzeTranscript } from './services/backendGeminiService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - More permissive CORS for debugging
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://meet-mogger-ai.vercel.app',
          'https://meetmogger-ai.vercel.app',
          'https://pandiharshan.github.io'
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // Log the origin for debugging
    console.log('Request from origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Add logging middleware to debug CORS issues
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});
app.use(express.json());

// API Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const result = await loginUser({ email, password });
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const result = await registerUser({ name, email, password });
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      // Return 409 for duplicate user errors
      const isDuplicateError = result.message.includes('already exists') || 
                              result.message.includes('already taken');
      const statusCode = isDuplicateError ? 409 : 400;
      return res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Environment check endpoint for debugging
app.get('/api/env-check', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    geminiKeyFormat: process.env.GEMINI_API_KEY?.startsWith('AIza') || false,
    timestamp: new Date().toISOString()
  });
});

// Gemini API test endpoint (protected)
app.get('/api/test-gemini', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    // Import the analyzeTranscript function
    const { analyzeTranscript } = await import('./services/backendGeminiService.js');
    
    const testTranscript = "Customer: Hi, I'm having trouble with my account. Agent: I'd be happy to help you with that. What specific issue are you experiencing?";
    
    console.log('🧪 Calling analyzeTranscript with test data...');
    const result = await analyzeTranscript(testTranscript);
    
    res.json({
      success: true,
      message: 'Gemini API test successful',
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🧪 Gemini API test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Gemini API test failed',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint to verify CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectDB = require('./lib/mongodb.js').default;
    
    // Test the connection
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      mongodb: {
        status: states[connectionState] || 'unknown',
        readyState: connectionState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@') : 'not set'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString()
    });
  }
});

// Protected route to verify token and get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Protected route for transcript analysis using Gemini API
app.post('/api/analyze', authenticateToken, async (req, res) => {
  console.log('🚀 === ANALYSIS API CALLED ===');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('👤 Authenticated User:', req.user?.email, req.user?.userId);
  console.log('📋 Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { transcript } = req.body;

    // Validate transcript
    console.log('🔍 Validating transcript...');
    console.log('📝 Transcript type:', typeof transcript);
    console.log('📏 Transcript length:', transcript?.length || 0);
    console.log('📄 Transcript preview:', transcript?.substring(0, 100) + '...');

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      console.log('❌ Transcript validation failed');
      return res.status(400).json({ 
        success: false, 
        message: 'Transcript is required and must be a non-empty string' 
      });
    }

    console.log('✅ Transcript validation passed');

    // Check environment variables
    console.log('🔧 Environment Check:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - PORT:', process.env.PORT);
    console.log('  - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('  - GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
    console.log('  - GEMINI_API_KEY preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'NOT SET');

    console.log(`🧠 Starting analysis for user ${req.user.email}...`);
    console.log('📊 About to call analyzeTranscript function...');
    
    // Call the analysis function with detailed error handling
    let analysis;
    try {
      analysis = await analyzeTranscript(transcript);
      console.log('✅ analyzeTranscript completed successfully');
      console.log('📊 Analysis result type:', typeof analysis);
      console.log('📊 Analysis result keys:', Object.keys(analysis || {}));
    } catch (analysisError) {
      console.error('❌ analyzeTranscript threw an error:');
      console.error('  - Error name:', analysisError.name);
      console.error('  - Error message:', analysisError.message);
      console.error('  - Error stack:', analysisError.stack);
      console.error('  - Error constructor:', analysisError.constructor.name);
      
      // Re-throw to be caught by outer catch
      throw analysisError;
    }
    
    console.log('✅ Gemini API analysis completed successfully');
    console.log('📤 Sending success response...');
    
    const response = { 
      success: true, 
      analysis 
    };
    
    console.log('📦 Response object:', JSON.stringify(response, null, 2));
    
    res.json(response);
    
    console.log('✅ Response sent successfully');
    
  } catch (error) {
    console.error('🚨 === ANALYSIS API ERROR ===');
    console.error('⏰ Error timestamp:', new Date().toISOString());
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error toString:', error.toString());
    
    // Check if error has additional properties
    console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
    
    // Log the full error object
    try {
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (jsonError) {
      console.error('❌ Could not stringify error object:', jsonError.message);
    }
    
    // Send detailed error response for debugging
    const errorResponse = {
      success: false,
      message: 'Analysis failed. Please try again.',
      debug: {
        errorType: error.constructor.name,
        errorName: error.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    console.error('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    res.status(500).json(errorResponse);
    
    console.error('🚨 === END ANALYSIS API ERROR ===');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
