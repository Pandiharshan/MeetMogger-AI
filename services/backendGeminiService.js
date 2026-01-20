import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gemini API client with backend API key
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

// Define the exact JSON structure we expect from the Gemini API
const analysisSchema = {
  type: 'object',
  properties: {
    theme: {
      type: 'object',
      description: 'Classification of the call\'s main topic and reasoning.',
      properties: {
        classification: {
          type: 'string',
          description: 'A short, descriptive category for the call (e.g., "Internet Connection Issue", "Billing Inquiry").',
        },
        reasoning: {
          type: 'string',
          description: 'A brief explanation for why this classification was chosen.',
        },
      },
      required: ['classification', 'reasoning'],
    },
    sentiment: {
      type: 'object',
      description: 'Analysis of the overall sentiment and emotional tones in the conversation.',
      properties: {
        polarity: {
          type: 'string',
          description: 'The dominant sentiment of the call.',
          enum: ['Positive', 'Negative', 'Neutral'],
        },
        tones: {
          type: 'array',
          description: 'A list of emotional tones detected (e.g., "Frustrated", "Relieved", "Helpful").',
          items: { type: 'string' },
        },
      },
      required: ['polarity', 'tones'],
    },
    problems: {
      type: 'array',
      description: 'A list of specific problems or issues mentioned by the customer.',
      items: { type: 'string' },
    },
    solutions: {
      type: 'array',
      description: 'A list of solutions or fixes proposed by the agent.',
      items: { type: 'string' },
    },
    actionItems: {
      type: 'array',
      description: 'A list of concrete next steps or follow-ups for either the agent or customer.',
      items: { type: 'string' },
    },
    summary: {
      type: 'string',
      description: 'A concise, one-paragraph summary of the entire conversation from start to finish.',
    },
  },
  required: ['theme', 'sentiment', 'problems', 'solutions', 'actionItems', 'summary'],
};

export const analyzeTranscript = async (transcript) => {
  if (!ai) {
    throw new Error('Gemini API key not configured on backend');
  }

  console.log('🚀 Calling Google Gemini API for real analysis...');

  try {
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `
      Analyze the following transcribed call conversation.
      Based on the content, provide a detailed analysis covering the call's theme, sentiment,
      identified problems, proposed solutions, any action items, and a final summary.
      
      Return your response as a JSON object with this exact structure:
      {
        "theme": {
          "classification": "string - category of the call",
          "reasoning": "string - why this classification was chosen"
        },
        "sentiment": {
          "polarity": "Positive|Negative|Neutral",
          "tones": ["array", "of", "emotional", "tones"]
        },
        "problems": ["array", "of", "identified", "problems"],
        "solutions": ["array", "of", "proposed", "solutions"],
        "actionItems": ["array", "of", "next", "steps"],
        "summary": "string - concise paragraph summary"
      }

      Transcript to analyze:
      ---
      ${transcript}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    if (!jsonText) {
      throw new Error("Received an empty response from the Gemini API.");
    }

    console.log('✅ Gemini API returned response, parsing JSON...');
    
    // Parse the JSON response
    const analysis = JSON.parse(jsonText);
    
    console.log('✅ Real Gemini analysis completed successfully');
    
    return analysis;

  } catch (error) {
    console.error("❌ Error analyzing transcript with Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to get analysis from Gemini API: ${errorMessage}`);
  }
};