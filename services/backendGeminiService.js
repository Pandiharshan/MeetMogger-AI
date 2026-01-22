import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Gemini API client with backend API key
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
  
  // GenAI client validation
  console.log('🤖 GenAI client validation:');
  console.log('  - GenAI client initialized:', !!genAI);
  console.log('  - GenAI client type:', typeof genAI);
  
  if (!genAI) {
    console.error('❌ CRITICAL: Gemini API key not configured on backend');
    console.error('❌ process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
    throw new Error('Gemini API key not configured on backend');
  }

  console.log('✅ GenAI client validation passed');
  console.log('🚀 Calling Google Gemini API for real analysis...');

  try {
    // First, discover available models
    console.log('🔍 Discovering available models...');
    let availableModels = [];
    
    try {
      const { models } = await genAI.listModels();
      console.log('📋 Found', models.length, 'total models');
      
      // Filter models that support generateContent
      availableModels = models
        .filter(model => model.supportedGenerationMethods.includes('generateContent'))
        .map(model => model.name.replace('models/', '')); // Remove models/ prefix for usage
      
      console.log('✅ Available models that support generateContent:', availableModels);
      
    } catch (listError) {
      console.log('⚠️ Could not list models:', listError.message);
      console.log('⚠️ Will try common model names as fallback');
      
      // Fallback to common model names
      availableModels = [
        'gemini-pro',
        'gemini-1.0-pro',
        'text-bison-001',
        'chat-bison-001'
      ];
    }
    
    if (availableModels.length === 0) {
      throw new Error('No available models found that support generateContent');
    }

    // Prepare the prompt
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
    console.log('📤 Trying available models...');
    
    // Try each available model until one works
    let result;
    let lastError;
    
    for (const modelName of availableModels) {
      try {
        console.log('🤖 Attempting to use model:', modelName);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });
        
        result = await model.generateContent(prompt);
        console.log('✅ Successfully used model:', modelName);
        break; // Success, exit the loop
        
      } catch (modelError) {
        console.log('❌ Model', modelName, 'failed:', modelError.message);
        lastError = modelError;
        continue; // Try next model
      }
    }
    
    if (!result) {
      console.error('❌ All models failed, last error:', lastError);
      throw lastError || new Error('All available models failed');
    }
    
    const response = await result.response;
    const jsonText = response.text();
    
    console.log('📥 Received result from Gemini API');
    console.log('📄 Response text length:', jsonText?.length || 0);
    console.log('📄 Response text preview:', jsonText?.substring(0, 300) + '...');

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