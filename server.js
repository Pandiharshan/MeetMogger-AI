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

// Simple test endpoint to verify CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
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
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transcript is required and must be a non-empty string' 
      });
    }

    console.log(`🧠 Analyzing transcript for user ${req.user.email}...`);
    
    const analysis = await analyzeTranscript(transcript);
    
    console.log('✅ Gemini API analysis completed successfully');
    
    res.json({ 
      success: true, 
      analysis 
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Analysis failed. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
