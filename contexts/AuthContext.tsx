import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEMO_MODE, DEMO_USERS } from '../demo-config.js';
import { authAPI } from '../lib/api';

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
  logout: () => Promise<void>;
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

  // Check for existing token on mount and validate it
  useEffect(() => {
    const validateStoredToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        // If it's a demo token, just restore the state
        if (storedToken === 'demo-token') {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Validate real token with backend
          try {
            const response = await authAPI.getProfile();
            if (response.success) {
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      }
      setIsLoading(false);
    };

    validateStoredToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Demo mode - use mock authentication
      if (DEMO_MODE) {
        const demoUser = DEMO_USERS.find(user => user.email === email && user.password === password);
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
      const data = await authAPI.login(email, password);

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
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
      // Demo mode - simulate registration
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

      // Production mode - use real API
      const data = await authAPI.register(name, email, password);

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Only call logout API if not in demo mode and has real token
      if (!DEMO_MODE && token && token !== 'demo-token') {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
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
