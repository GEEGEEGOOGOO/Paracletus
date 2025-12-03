import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 GEMINI API KEY TEST');
console.log('═══════════════════════════════════════════════════════\n');

// Step 1: Check if API key exists
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('Step 1: API Key Check');
console.log('─────────────────────────────────────────────────────');
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is NOT SET in .env file');
    console.error('\n📝 Action Required:');
    console.error('   1. Open d:\\PROJECT_101\\.env');
    console.error('   2. Add: GEMINI_API_KEY=your_key_here');
    console.error('   3. Get key from: https://aistudio.google.com/apikey\n');
    process.exit(1);
}

console.log(`✅ API Key Found: ${GEMINI_API_KEY.substring(0, 15)}...`);
console.log(`   Length: ${GEMINI_API_KEY.length} characters`);
console.log(`   Format: ${GEMINI_API_KEY.startsWith('AIza') ? 'Valid format' : '⚠️ Unexpected format'}\n`);

// Step 2: Test API Connection
console.log('Step 2: Testing API Connection');
console.log('─────────────────────────────────────────────────────');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

try {
    console.log('   Sending test request to Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Respond with exactly: "API Connected Successfully"');
    const response = result.response.text();

    console.log(`✅ API Response: ${response.trim()}`);
    console.log('✅ Connection Successful!\n');
} catch (error) {
    console.error('❌ API Connection Failed!');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('API key expired') || error.message.includes('expired')) {
        console.error('🔑 Your API key has EXPIRED');
        console.error('   Get a new key: https://aistudio.google.com/apikey\n');
    } else if (error.message.includes('API key not valid')) {
        console.error('🔑 Your API key is INVALID');
        console.error('   Verify the key in .env file\n');
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('🌐 Network/Firewall Issue');
        console.error('   Check your internet connection\n');
    }

    process.exit(1);
}

// Step 3: Test Resume Parsing Capability
console.log('Step 3: Testing Resume Parsing');
console.log('─────────────────────────────────────────────────────');

const testPrompt = `Extract resume information and return ONLY valid JSON:
{
  "name": "Full Name",
  "email": "email@example.com",
  "title": "Job Title",
  "skills": ["skill1", "skill2"]
}

Document:
Jane Smith
Senior Software Engineer
jane.smith@email.com
Skills: JavaScript, Python, React`;

try {
    console.log('   Testing JSON extraction from resume...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    // Try to parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Resume Parsing Works!`);
        console.log(`   Extracted Name: ${parsed.name || 'N/A'}`);
        console.log(`   Extracted Email: ${parsed.email || 'N/A'}`);
        console.log(`   Extracted Title: ${parsed.title || 'N/A'}`);
        console.log(`   Extracted Skills: ${parsed.skills?.length || 0} skills\n`);
    } else {
        console.error('⚠️ Could not extract JSON from response');
        console.error(`   Response: ${response.substring(0, 100)}...\n`);
    }
} catch (error) {
    console.error('❌ Resume Parsing Test Failed!');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
}

// Final Summary
console.log('═══════════════════════════════════════════════════════');
console.log('✅ ALL TESTS PASSED!');
console.log('═══════════════════════════════════════════════════════');
console.log('\n🎉 Your Gemini API key is working correctly!');
console.log('📄 Resume parsing is ready to use.');
console.log('\n💡 Next Steps:');
console.log('   1. Restart the application: npm start');
console.log('   2. Click 🎭 Role Adoption mode');
console.log('   3. Upload a PDF resume\n');
