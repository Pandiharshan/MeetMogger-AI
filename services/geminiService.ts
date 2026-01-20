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

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis request failed');
    }

    const data = await response.json();
    
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

  try {
    const prompt = `
      Analyze the following transcribed call conversation.
      Based on the content, provide a detailed analysis covering the call's theme, sentiment,
      identified problems, proposed solutions, any action items, and a final summary.
      Adhere strictly to the provided JSON schema for your response.

      Transcript to analyze:
      ---
      ${transcript}
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Received an empty response from the Gemini API.");
    }

    // The response is already guaranteed to be a JSON string due to the config.
    const result = JSON.parse(jsonText);
    
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing transcript with Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Check the console for details.";
    throw new Error(`Failed to get analysis from Gemini API. ${errorMessage}`);
  }
};
