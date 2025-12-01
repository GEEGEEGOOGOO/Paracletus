import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load .env from project root
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Diagnostics:');
console.log('API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'NO ❌');
console.log('API Key length:', apiKey?.length);
console.log('Model from env:', process.env.GEMINI_MODEL);
console.log('');

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Test models in order of preference
const modelsToTest = [
    'gemini-2.0-flash-exp',        // Latest experimental
    'gemini-1.5-flash-latest',     // Latest stable flash
    'gemini-1.5-flash',            // Stable flash
    'gemini-1.5-pro-latest',       // Latest pro
    'gemini-1.5-pro',              // Stable pro
    'gemini-pro'                   // Fallback
];

async function testModel(modelName) {
    try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test successful" in 3 words');
        const response = result.response.text();
        console.log(`✅ ${modelName} WORKS!`);
        console.log(`   Response: ${response.substring(0, 80)}`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} FAILED`);
        console.log(`   Error: ${error.message}`);
        if (error.message.includes('models/')) {
            console.log(`   → Model not available`);
        } else if (error.message.includes('fetch failed')) {
            console.log(`   → Network/API connectivity issue`);
        } else if (error.message.includes('API key')) {
            console.log(`   → API key issue`);
        }
        return false;
    }
}

async function main() {
    console.log('🧪 Testing Gemini Models...\n');

    let workingModel = null;

    for (const model of modelsToTest) {
        const success = await testModel(model);
        console.log('');

        if (success && !workingModel) {
            workingModel = model;
            console.log(`🎯 First working model found: ${model}\n`);
            break; // Stop after finding first working model
        }
    }

    if (workingModel) {
        console.log('━'.repeat(50));
        console.log('📋 RECOMMENDATION:');
        console.log(`Update .env file:`);
        console.log(`GEMINI_MODEL=${workingModel}`);
        console.log('━'.repeat(50));
    } else {
        console.log('━'.repeat(50));
        console.log('❌ NO WORKING MODELS FOUND!');
        console.log('Possible issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. Network/firewall blocking Google APIs');
        console.log('3. API key lacks required permissions');
        console.log('━'.repeat(50));
    }
}

main();
