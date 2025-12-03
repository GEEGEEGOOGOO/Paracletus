// Quick check - what API key is the server actually using?
import 'dotenv/config';

console.log('\n🔍 Current Server Environment Check\n');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ?
    `${process.env.GEMINI_API_KEY.substring(0, 20)}...` :
    '❌ NOT SET');
console.log('Expected to start with: AIzaSyDZKu6GeG6...');
console.log('\nMatch:', process.env.GEMINI_API_KEY?.startsWith('AIzaSyDZKu6GeG6') ? '✅ CORRECT' : '❌ WRONG KEY');
