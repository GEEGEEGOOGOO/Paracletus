import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from server/)
const envPath = path.resolve(__dirname, '..', '.env');
console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath, override: true });

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Environment Configuration Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

console.log('✅ .env file path:', envPath);
console.log('✅ API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 15)}...)` : '❌ NO');
console.log('✅ Model configured:', model || 'gemini-2.5-flash (default)');
console.log('');

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found!');
    process.exit(1);
}

console.log('🧪 Testing Gemini API connection...\n');

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    try {
        const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash-exp' });
        const result = await geminiModel.generateContent('Reply with "Configuration successful!" in exactly 2 words');
        const response = result.response.text();

        console.log('✅ API Connection: SUCCESS');
        console.log('✅ Response:', response);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ALL CHECKS PASSED - Server ready to start!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ API Connection: FAILED');
        console.error('Error:', error.message);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ Configuration has issues - check above');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(1);
    }
}

test();
