// Separate entrypoint to load environment variables BEFORE any imports
import dotenv from 'dotenv';

// Clear any cached environment variables and force .env file to override
// COMMENTED OUT: We need GROQ_API_KEY for Whisper STT!
// delete process.env.GROQ_API_KEY;
// delete process.env.GROQ_MODEL;
// delete process.env.GEMINI_API_KEY;
// delete process.env.GEMINI_MODEL;

// Load from .env file with override, but respect existing env vars if passed from parent
// In packaged app, .env might not exist or we might want to use parent's env
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

console.log('🚀 Starting Server via start.js');
console.log('   Loading .env from:', envPath);

if (process.env.NODE_ENV !== 'production') {
    // Force clear GEMINI_API_KEY to ensure fresh load from .env
    if (process.env.GEMINI_API_KEY) delete process.env.GEMINI_API_KEY;
    dotenv.config({ path: envPath, override: true });
} else {
    // In production (packaged), we might still want to load .env if it exists in resources
    // But usually we rely on what's passed or set in the system
    dotenv.config({ path: envPath });
}


// Now import and start the server
import './server.js';
