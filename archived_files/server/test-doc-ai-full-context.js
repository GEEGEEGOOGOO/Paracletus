import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env exactly like server.js
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath, override: true });

// Import documentAI
import { analyze } from './services/documentAI.js';

console.log('🧪 Testing Document AI with FULL Server Context...');

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
        process.exit(0);
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}

test();
