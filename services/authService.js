import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../lib/mongodb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Register a new user
export const registerUser = async (credentials) => {
  try {
    console.log('🔄 Starting user registration process...');
    await connectDB();
    console.log('✅ MongoDB connection established');

    // Check if user already exists by email or name
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [
        { email: credentials.email },
        { name: credentials.name }
      ]
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      if (existingUser.email === credentials.email) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }
      if (existingUser.name === credentials.name) {
        return {
          success: false,
          message: 'Username is already taken',
        };
      }
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(credentials.password, saltRounds);

    console.log('👤 Creating new user...');
    // Create new user
    const user = new User({
      email: credentials.email,
      password: hashedPassword,
      name: credentials.name,
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully');

    console.log('🎫 Generating JWT token...');
    // Generate JWT token with complete user data
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Registration completed successfully');
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    };
  } catch (error) {
    console.error('❌ Registration error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' 
        ? 'User with this email already exists'
        : 'Username is already taken';
      return {
        success: false,
        message,
      };
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoParseError' || error.name === 'MongoNetworkError') {
      console.error('❌ MongoDB connection issue:', error.message);
      return {
        success: false,
        message: 'Database connection error. Please try again.',
      };
    }
    
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
    };
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Generate JWT token with complete user data
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed. Please try again.',
    };
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    await connectDB();
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// JWT Middleware for protected routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};