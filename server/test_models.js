import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyAOuUxhdPejckfbwr5wkJ_xpNhuatyi2c8';
const genAI = new GoogleGenerativeAI(key);

console.log('Testing available models...\n');

const modelsToTest = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
];

async function testModel(modelName) {
    try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = result.response.text();
        console.log(`✅ ${modelName} works!`);
        console.log(`   Response: ${response.substring(0, 50)}...\n`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`);
        return false;
    }
}

async function main() {
    for (const model of modelsToTest) {
        await testModel(model);
    }
}

main();
