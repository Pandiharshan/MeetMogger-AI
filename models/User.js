import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,  // Removed unique: true as names don't need to be unique
  },
}, {
  timestamps: true,
});

// No need for additional indexes since unique: true already creates indexes

export default mongoose.models.User || mongoose.model('User', UserSchema);