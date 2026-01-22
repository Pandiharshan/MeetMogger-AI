import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisResult } from '../types';
import { DEMO_MODE, DEMO_ANALYSIS } from '../demo-config.js';

// Initialize the Google Gemini API client only if not in demo mode
// In production, this will be null on frontend (API key is backend-only)
const ai = null; // Frontend should not have direct access to Gemini API

// Define the exact JSON structure we expect from the Gemini API.
// This ensures the AI's response is always in a predictable, parseable format.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    theme: {
      type: Type.OBJECT,
      description: 'Classification of the call\'s main topic and reasoning.',
      properties: {
        classification: {
          type: Type.STRING,
          description: 'A short, descriptive category for the call (e.g., "Internet Connection Issue", "Billing Inquiry").',
        },
        reasoning: {
          type: Type.STRING,
          description: 'A brief explanation for why this classification was chosen.',
        },
      },
      required: ['classification', 'reasoning'],
    },
    sentiment: {
      type: Type.OBJECT,
      description: 'Analysis of the overall sentiment and emotional tones in the conversation.',
      properties: {
        polarity: {
          type: Type.STRING,
          description: 'The dominant sentiment of the call.',
          enum: ['Positive', 'Negative', 'Neutral'],
        },
        tones: {
          type: Type.ARRAY,
          description: 'A list of emotional tones detected (e.g., "Frustrated", "Relieved", "Helpful").',
          items: { type: Type.STRING },
        },
      },
      required: ['polarity', 'tones'],
    },
    problems: {
      type: Type.ARRAY,
      description: 'A list of specific problems or issues mentioned by the customer.',
      items: { type: Type.STRING },
    },
    solutions: {
      type: Type.ARRAY,
      description: 'A list of solutions or fixes proposed by the agent.',
      items: { type: Type.STRING },
    },
    actionItems: {
      type: Type.ARRAY,
      description: 'A list of concrete next steps or follow-ups for either the agent or customer.',
      items: { type: Type.STRING },
    },
    summary: {
      type: Type.STRING,
      description: 'A concise, one-paragraph summary of the entire conversation from start to finish.',
    },
  },
  required: ['theme', 'sentiment', 'problems', 'solutions', 'actionItems', 'summary'],
};

export const analyzeCallTranscript = async (transcript: string): Promise<AnalysisResult> => {
  // Check if we're in demo mode (GitHub Pages only)
  if (DEMO_MODE) {
    console.log('📱 Demo mode: Using mock analysis data');
    // Simulate API delay for realistic demo experience
    await new Promise(resolve => setTimeout(resolve, 1500));
    return DEMO_ANALYSIS;
  }

  // Production mode: Call backend API for real Gemini analysis
  console.log('🚀 Production mode: Calling backend for real Gemini analysis...');
  
  try {
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://meetmogger-ai-backend.onrender.com'
      : 'http://localhost:3001';

    console.log('🌐 API Base URL:', API_BASE_URL);
    console.log('🔍 Environment:', process.env.NODE_ENV);

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    console.log('🔑 Token found:', !!token);
    console.log('📝 Transcript length:', transcript.length);

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transcript }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = { 
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        };
      }
      
      console.error('❌ API Error Response:', errorData);
      console.error('❌ Response Headers:', Object.fromEntries(response.headers.entries()));
      
      // Log debug info if available
      if (errorData.debug) {
        console.error('🔍 Debug Info:', errorData.debug);
      }
      
      throw new Error(errorData.message || `Analysis request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Analysis failed');
    }

    console.log('✅ Real Gemini analysis received from backend');
    return data.analysis;

  } catch (error) {
    console.error("❌ Error calling backend analysis API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to analyze transcript: ${errorMessage}`);
  }
};
