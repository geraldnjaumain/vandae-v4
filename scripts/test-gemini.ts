
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini API...');
    console.log('API Key present:', !!apiKey);

    if (!apiKey || apiKey === 'your-gemini-key' || apiKey.includes('INSERT_KEY_HERE')) {
        console.error('ERROR: GEMINI_API_KEY is using the default placeholder value!');
        console.error('Please update .env.local with your actual Google Gemini API key.');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = ['models/gemini-1.5-flash', 'models/gemini-pro'];

    for (const modelName of modelsToTry) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}!`);
            console.log('Response:', response.text());
            return; // Exit on first success
        } catch (error: any) {
            console.error(`FAILED with ${modelName}`);
            // Force string conversion and take a chunk
            const msg = String(error.message || error).substring(0, 2000);
            console.error('Error start:', msg);
        }
    }
}

testGemini();
