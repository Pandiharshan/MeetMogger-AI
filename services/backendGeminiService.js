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
  console.log('🚀 === GEMINI SERVICE CALLED ===');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📝 Transcript length:', transcript?.length || 0);
  console.log('📄 Transcript preview:', transcript?.substring(0, 200) + '...');
  
  // Environment validation
  console.log('🔧 Environment validation:');
  console.log('  - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('  - GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
  console.log('  - GEMINI_API_KEY format check:', process.env.GEMINI_API_KEY?.startsWith('AIza') || false);
  
  // AI client validation
  console.log('🤖 AI client validation:');
  console.log('  - AI client initialized:', !!ai);
  console.log('  - AI client type:', typeof ai);
  
  if (!ai) {
    console.error('❌ CRITICAL: Gemini API key not configured on backend');
    console.error('❌ process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
    throw new Error('Gemini API key not configured on backend');
  }

  console.log('✅ AI client validation passed');
  console.log('🚀 Calling Google Gemini API for real analysis...');

  try {
    // Model initialization
    console.log('🔧 Initializing Gemini model...');
    let model;
    try {
      model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });
      console.log('✅ Model initialized successfully');
      console.log('🤖 Model type:', typeof model);
    } catch (modelError) {
      console.error('❌ Model initialization failed:', modelError);
      throw new Error(`Model initialization failed: ${modelError.message}`);
    }

    // Prompt preparation
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

    console.log('📝 Prompt prepared, length:', prompt.length);
    console.log('📤 Sending request to Gemini API...');
    
    // API call with detailed error handling
    let result;
    try {
      result = await model.generateContent(prompt);
      console.log('📥 Received result from Gemini API');
      console.log('📊 Result type:', typeof result);
      console.log('📊 Result keys:', Object.keys(result || {}));
    } catch (apiError) {
      console.error('❌ Gemini API call failed:', apiError);
      console.error('❌ API Error name:', apiError.name);
      console.error('❌ API Error message:', apiError.message);
      console.error('❌ API Error stack:', apiError.stack);
      throw new Error(`Gemini API call failed: ${apiError.message}`);
    }
    
    // Response processing
    console.log('🔄 Processing API response...');
    let response;
    try {
      response = await result.response;
      console.log('✅ Response object obtained');
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', Object.keys(response || {}));
    } catch (responseError) {
      console.error('❌ Response processing failed:', responseError);
      throw new Error(`Response processing failed: ${responseError.message}`);
    }
    
    // Text extraction
    console.log('📄 Extracting text from response...');
    let jsonText;
    try {
      jsonText = response.text();
      console.log('✅ Text extracted successfully');
      console.log('📏 Response text length:', jsonText?.length || 0);
      console.log('📄 Response text preview:', jsonText?.substring(0, 300) + '...');
    } catch (textError) {
      console.error('❌ Text extraction failed:', textError);
      throw new Error(`Text extraction failed: ${textError.message}`);
    }

    if (!jsonText) {
      console.error('❌ CRITICAL: Empty response from Gemini API');
      throw new Error("Received an empty response from the Gemini API.");
    }

    // JSON parsing
    console.log('🔄 Parsing JSON response...');
    let analysis;
    try {
      analysis = JSON.parse(jsonText);
      console.log('✅ JSON parsed successfully');
      console.log('📊 Analysis type:', typeof analysis);
      console.log('📊 Analysis keys:', Object.keys(analysis || {}));
      
      // Validate required fields
      const requiredFields = ['theme', 'sentiment', 'problems', 'solutions', 'actionItems', 'summary'];
      const missingFields = requiredFields.filter(field => !analysis[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Analysis missing required fields: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ Analysis validation passed');
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.error('❌ Raw response text:', jsonText);
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    console.log('✅ === GEMINI SERVICE COMPLETED SUCCESSFULLY ===');
    return analysis;

  } catch (error) {
    console.error('🚨 === GEMINI SERVICE ERROR ===');
    console.error('⏰ Error timestamp:', new Date().toISOString());
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific error types
    if (error.message.includes('API key')) {
      console.error('🔑 API KEY ISSUE DETECTED');
      console.error('🔑 Current API key exists:', !!process.env.GEMINI_API_KEY);
      console.error('🔑 Current API key length:', process.env.GEMINI_API_KEY?.length || 0);
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      console.error('📊 QUOTA/LIMIT ISSUE DETECTED');
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      console.error('🌐 NETWORK ISSUE DETECTED');
    }
    
    console.error('🚨 === END GEMINI SERVICE ERROR ===');
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to get analysis from Gemini API: ${errorMessage}`);
  }
};