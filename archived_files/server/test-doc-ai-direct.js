import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyze } from './services/documentAI.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath, override: true });

console.log('Testing Document AI directly...');

const mockFile = {
    type: 'text',
    text: 'This is a test document content. It is a simple text file for testing the API connection.'
};

async function test() {
    try {
        console.log('Calling analyze()...');
        const result = await analyze(mockFile);
        console.log('✅ Analysis success!');
        console.log(result);
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

test();
