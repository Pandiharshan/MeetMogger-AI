import fetch from 'node-fetch';

// Test script to diagnose the analysis API issue
const API_BASE_URL = 'https://meetmogger-ai-backend.onrender.com';

async function testAnalysisAPI() {
  console.log('🧪 Testing Analysis API...');
  console.log('🌐 API Base URL:', API_BASE_URL);
  
  try {
    // Step 1: Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Step 2: Test environment check
    console.log('\n2️⃣ Testing environment check...');
    const envResponse = await fetch(`${API_BASE_URL}/api/env-check`);
    const envData = await envResponse.json();
    console.log('🔧 Environment data:', envData);
    
    // Step 3: Test with dummy token (will fail auth but show if endpoint is reachable)
    console.log('\n3️⃣ Testing analysis endpoint (without auth - should get 401)...');
    const noAuthResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: 'Test transcript for API testing'
      })
    });
    
    console.log('📡 No-auth response status:', noAuthResponse.status);
    console.log('📡 No-auth response statusText:', noAuthResponse.statusText);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Analysis endpoint is reachable (401 = auth required, which is correct)');
    } else {
      const noAuthData = await noAuthResponse.json().catch(() => null);
      console.log('📦 No-auth response data:', noAuthData);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Check if hasGeminiKey is true in environment data');
    console.log('2. Check if geminiKeyLength is > 0');
    console.log('3. Check if geminiKeyFormat is true (starts with AIza)');
    console.log('4. Try the analysis with a real auth token');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

testAnalysisAPI();