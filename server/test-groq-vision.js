import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// User provided image
const imagePath = "C:/Users/kumar/.gemini/antigravity/brain/29afa74c-c9a2-459f-83af-ebb35718dca9/uploaded_image_1764737431340.png";

let imageUrl;
try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    imageUrl = `data:image/png;base64,${base64Image}`;
    console.log(`✅ Loaded image from ${imagePath}`);
} catch (err) {
    console.error(`❌ Failed to load image: ${err.message}`);
    process.exit(1);
}

const modelsToTest = [
    'meta-llama/llama-4-scout-17b-16e-instruct'
];

async function testModel(modelId) {
    console.log(`\n🧪 Testing ${modelId}...`);
    try {
        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe this image in detail."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": imageUrl
                            }
                        }
                    ]
                }
            ],
            "model": modelId,
            "temperature": 0.7,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": false,
            "stop": null
        });

        console.log(`✅ SUCCESS: ${modelId}`);
        console.log(`   Response: ${chatCompletion.choices[0].message.content.substring(0, 200)}...`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelId}`);
        console.log(`   Error: ${error.error?.message || error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('👁️ Testing Groq Vision Capabilities...');

    for (const model of modelsToTest) {
        await testModel(model);
    }
}

runTests();
