import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEMO_MODE, DEMO_USERS } from '../demo-config.js';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        // In demo mode, restore from localStorage
        if (DEMO_MODE) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
          setIsLoading(false);
          return;
        }
        
        // In production, always validate token and fetch fresh user data
        try {
          const API_BASE_URL = process.env.NODE_ENV === 'production' 
            ? 'https://meetmogger-ai-backend.onrender.com'
            : 'http://localhost:3001';
            
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.user);
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    
    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Demo mode - use mock authentication ONLY on GitHub Pages
      if (DEMO_MODE) {
        const demoUser = DEMO_USERS.find(user => 
          user.email.trim().toLowerCase() === email.trim().toLowerCase() && 
          user.password === password
        );
        if (demoUser) {
          const userData = {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name
          };
          setUser(userData);
          setToken('demo-token');
          localStorage.setItem('authToken', 'demo-token');
          localStorage.setItem('user', JSON.stringify(userData));
          return { success: true, message: 'Demo login successful!' };
        } else {
          return { success: false, message: 'Invalid demo credentials. Use demo@meetmogger.ai / demo123' };
        }
      }

      // Production mode - use real API
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://meetmogger-ai-backend.onrender.com'
        : 'http://localhost:3001';
        
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Login failed' };
      }

      const data = await response.json();

      if (data.success) {
        // Store token first
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        
        // Fetch fresh user data from server to ensure consistency
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
          } else {
            // Fallback to login response user data
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (error) {
          // Fallback to login response user data
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Demo mode - simulate registration ONLY on GitHub Pages
      if (DEMO_MODE) {
        const userData = {
          id: `demo-user-${Date.now()}`,
          email: email,
          name: name
        };
        setUser(userData);
        setToken('demo-token');
        localStorage.setItem('authToken', 'demo-token');
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: 'Demo registration successful!' };
      }

      // Production mode - use real API with CORS proxy fallback
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Demo mode:', DEMO_MODE);
      
      const BACKEND_URL = 'https://meetmogger-ai-backend.onrender.com';
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? BACKEND_URL
        : 'http://localhost:3001';
        
      console.log('Using API URL:', API_BASE_URL);
        
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response URL:', `${API_BASE_URL}/api/auth/register`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
        console.error('Registration error response:', errorData);
        return { success: false, message: errorData.message || 'Registration failed' };
      }

      const data = await response.json();

      if (data.success) {
        // Store token first
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        
        // Fetch fresh user data from server to ensure consistency
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
          } else {
            // Fallback to registration response user data
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (error) {
          // Fallback to registration response user data
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please check if the backend is running and try again.' 
        };
      }
      
      if (error.message.includes('CORS')) {
        return { 
          success: false, 
          message: 'Server configuration issue. Please try again in a few minutes.' 
        };
      }
      
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
