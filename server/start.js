// Separate entrypoint to load environment variables BEFORE any imports
import dotenv from 'dotenv';

// Clear any cached environment variables and force .env file to override
delete process.env.GROQ_API_KEY;
delete process.env.GROQ_MODEL;
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;

// Load from .env file with override, but respect existing env vars if passed from parent
// In packaged app, .env might not exist or we might want to use parent's env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ override: true });
} else {
    // In production (packaged), we might still want to load .env if it exists in resources
    // But usually we rely on what's passed or set in the system
    dotenv.config();
}

// Now import and start the server
import './server.js';
