import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  try {
    // Try different model names
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello"');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works! Response: ${text}\n`);
        break; // Stop after first successful model
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();

