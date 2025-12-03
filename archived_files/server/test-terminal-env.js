import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('🧪 Testing API Key from Terminal Environment Variable\n');

const apiKey = process.env.GEMINI_API_KEY;

console.log('API Key Source: Terminal Environment Variable');
console.log('API Key Loaded:', apiKey ? `Yes (${apiKey.substring(0, 15)}...)` : '❌ NO');
console.log('API Key Length:', apiKey?.length || 0);
console.log('API Key Full:', apiKey);
console.log('');

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
    const modelsToTest = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ];

    console.log('Testing models...\n');

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in 3 words');
            const response = result.response.text();

            console.log(`✅ ${modelName} WORKS!`);
            console.log(`   Response: ${response}`);
            console.log('');
            console.log('━'.repeat(60));
            console.log('🎉 SUCCESS! API KEY IS VALID!');
            console.log(`Working Model: ${modelName}`);
            console.log('━'.repeat(60));
            return; // Stop after first success

        } catch (error) {
            console.log(`❌ ${modelName} failed`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }

    console.log('━'.repeat(60));
    console.log('❌ ALL MODELS FAILED');
    console.log('This confirms the API key has issues.');
    console.log('━'.repeat(60));
}

testModels().catch(err => {
    console.error('Fatal error:', err);
});
