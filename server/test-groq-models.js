import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not found in .env');
        return;
    }

    console.log('🔑 Using API Key:', process.env.GROQ_API_KEY.substring(0, 10) + '...');

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    try {
        console.log('📡 Fetching models from Groq...');
        const models = await groq.models.list();

        const listPath = path.join(__dirname, '../groq_models_list.txt');
        const modelIds = models.data.map(m => m.id).join('\n');

        fs.writeFileSync(listPath, modelIds);
        console.log(`✅ Model list written to ${listPath}`);
        console.log('--- PREVIEW (First 5) ---');
        console.log(modelIds.split('\n').slice(0, 5).join('\n'));

    } catch (error) {
        console.error('❌ Error fetching models:', error.message);
    }
}

listModels();
