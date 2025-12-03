/**
 * Test script for PDF context integration with voice queries
 * This script simulates uploading a PDF and then asking a question via text query
 */

import { io } from 'socket.io-client';
import fs from 'fs';

const SERVER_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'desktop-app-token';

async function testPDFContextIntegration() {
    console.log('🧪 Starting PDF Context Integration Test...\n');

    // Connect to WebSocket server
    const socket = io(SERVER_URL, {
        auth: { token: AUTH_TOKEN },
        transports: ['websocket']
    });

    return new Promise((resolve, reject) => {
        socket.on('connect', async () => {
            console.log('✅ Connected to server\n');

            try {
                // Step 1: Upload a mock PDF
                console.log('📄 Step 1: Uploading mock PDF...');

                // Create a simple mock PDF content (in real scenario, this would be actual PDF data)
                const mockPDFText = `
Project Documentation

Tech Stack:
- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- AI Integration: Gemini Flash 2.5
- Voice Recognition: OpenAI Whisper

Features:
- Real-time voice queries
- PDF document analysis
- Multi-file context support
        `;

                // Encode as base64 (simulating PDF upload)
                const mockPDFBase64 = Buffer.from(mockPDFText).toString('base64');

                socket.emit('file_upload', {
                    fileData: mockPDFBase64,
                    fileName: 'project_documentation.pdf',
                    fileType: 'application/pdf',
                    question: 'Analyze this project documentation'
                });

                // Wait for file analysis response
                socket.once('answer_final', (data) => {
                    console.log('✅ PDF uploaded and analyzed');
                    console.log(`   Summary: ${data.answer.substring(0, 100)}...\n`);

                    // Step 2: Ask a question about the PDF via text query
                    console.log('💬 Step 2: Asking question about uploaded PDF...');
                    console.log('   Question: "What tech stack is used in this project?"\n');

                    socket.emit('text_query', {
                        text: 'What tech stack is used in this project?'
                    });

                    // Wait for answer
                    socket.once('answer_final', (answerData) => {
                        console.log('✅ Answer received:');
                        console.log(`   ${answerData.answer}\n`);

                        // Verify the answer mentions the tech stack
                        const answer = answerData.answer.toLowerCase();
                        const hasReact = answer.includes('react');
                        const hasNode = answer.includes('node');
                        const hasGemini = answer.includes('gemini') || answer.includes('ai');

                        console.log('🔍 Verification:');
                        console.log(`   ✓ Mentions React: ${hasReact ? '✅' : '❌'}`);
                        console.log(`   ✓ Mentions Node.js: ${hasNode ? '✅' : '❌'}`);
                        console.log(`   ✓ Mentions AI/Gemini: ${hasGemini ? '✅' : '❌'}\n`);

                        if (hasReact && hasNode) {
                            console.log('🎉 TEST PASSED: PDF context successfully integrated!\n');
                            socket.disconnect();
                            resolve(true);
                        } else {
                            console.log('❌ TEST FAILED: Answer does not include expected tech stack\n');
                            socket.disconnect();
                            reject(new Error('Answer missing expected content'));
                        }
                    });
                });

                // Handle errors
                socket.on('error', (error) => {
                    console.error('❌ Error:', error);
                    socket.disconnect();
                    reject(error);
                });

            } catch (error) {
                console.error('❌ Test error:', error);
                socket.disconnect();
                reject(error);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
            reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            console.error('❌ Test timeout');
            socket.disconnect();
            reject(new Error('Test timeout'));
        }, 30000);
    });
}

// Run the test
testPDFContextIntegration()
    .then(() => {
        console.log('✅ All tests completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    });
