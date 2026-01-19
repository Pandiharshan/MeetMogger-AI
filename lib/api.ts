// API Configuration
const getApiBaseUrl = (): string => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }
  
  // In production, use environment variable or default
  return import.meta.env.VITE_API_BASE_URL || 'https://meetmogger-ai-backend.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// API Helper function with automatic token handling
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists and it's not a demo token
  if (token && token !== 'demo-token') {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw new Error('Network error. Please check your connection.');
  }
};

// Specific auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await apiRequest('/api/auth/me');
    return response.json();
  },
};