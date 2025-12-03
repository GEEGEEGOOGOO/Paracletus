import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DOTENV LOADING DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════\n');

// Test 1: Check file existence
console.log('Step 1: File Existence Check');
console.log('─────────────────────────────────────────────────────');

const rootEnvPath = path.resolve(__dirname, '..', '.env');
const serverEnvPath = path.resolve(__dirname, '.env');

console.log(`Root .env path: ${rootEnvPath}`);
console.log(`  Exists: ${fs.existsSync(rootEnvPath)}`);
if (fs.existsSync(rootEnvPath)) {
    const stats = fs.statSync(rootEnvPath);
    console.log(`  Size: ${stats.size} bytes`);
    console.log(`  Modified: ${stats.mtime}`);
}

console.log(`\nServer .env path: ${serverEnvPath}`);
console.log(`  Exists: ${fs.existsSync(serverEnvPath)}`);
if (fs.existsSync(serverEnvPath)) {
    const stats = fs.statSync(serverEnvPath);
    console.log(`  Size: ${stats.size} bytes`);
    console.log(`  Modified: ${stats.mtime}`);
}

// Test 2: Read raw file content
console.log('\n\nStep 2: Raw File Content');
console.log('─────────────────────────────────────────────────────');

if (fs.existsSync(rootEnvPath)) {
    const content = fs.readFileSync(rootEnvPath, 'utf-8');
    const lines = content.split('\n');
    const geminiLine = lines.find(l => l.startsWith('GEMINI_API_KEY'));
    console.log(`Root .env GEMINI_API_KEY line:`);
    console.log(`  "${geminiLine}"`);
    console.log(`  Length: ${geminiLine?.length || 0} chars`);
    console.log(`  Has carriage return: ${geminiLine?.includes('\r')}`);
}

if (fs.existsSync(serverEnvPath)) {
    const content = fs.readFileSync(serverEnvPath, 'utf-8');
    const lines = content.split('\n');
    const geminiLine = lines.find(l => l.startsWith('GEMINI_API_KEY'));
    console.log(`\nServer .env GEMINI_API_KEY line:`);
    console.log(`  "${geminiLine}"`);
    console.log(`  Length: ${geminiLine?.length || 0} chars`);
    console.log(`  Has carriage return: ${geminiLine?.includes('\r')}`);
}

// Test 3: Load with dotenv
console.log('\n\nStep 3: Dotenv Loading Test');
console.log('─────────────────────────────────────────────────────');

// Clear any existing
delete process.env.GEMINI_API_KEY;

console.log('Loading from ROOT .env...');
const result = dotenv.config({ path: rootEnvPath, override: true });

if (result.error) {
    console.error(`❌ Error: ${result.error.message}`);
} else {
    console.log(`✅ Loaded successfully`);
    console.log(`   Parsed keys: ${Object.keys(result.parsed || {}).length}`);
    if (result.parsed?.GEMINI_API_KEY) {
        console.log(`   GEMINI_API_KEY from parsed: ${result.parsed.GEMINI_API_KEY.substring(0, 20)}...`);
    }
}

console.log(`\nprocess.env.GEMINI_API_KEY after dotenv.config():`);
if (process.env.GEMINI_API_KEY) {
    console.log(`  Value: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`);
    console.log(`  Length: ${process.env.GEMINI_API_KEY.length} chars`);
    console.log(`  Starts with AIza: ${process.env.GEMINI_API_KEY.startsWith('AIza')}`);
} else {
    console.log(`  ❌ NOT SET!`);
}

// Test 4: Try to use the key
console.log('\n\nStep 4: API Key Validation');
console.log('─────────────────────────────────────────────────────');

import { GoogleGenerativeAI } from '@google/generative-ai';

if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say "OK"');
        const response = result.response.text();
        console.log(`✅ API Key Works! Response: ${response.trim()}`);
    } catch (error) {
        console.error(`❌ API Key Failed: ${error.message}`);
    }
} else {
    console.error('❌ Cannot test - GEMINI_API_KEY not loaded');
}

console.log('\n═══════════════════════════════════════════════════════');
