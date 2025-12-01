import { GoogleGenerativeAI } from '@google/generative-ai';
import { chunkText } from '../handlers/fileProcessor.js';

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // Use stable model from env or default to 2.5 flash

if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set - document AI will not work');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Analyze uploaded document using Gemini 2.5 Flash
 * Returns: { summary, keyPoints, classification, followUpHint }
 */
export async function analyze(processedFile) {
    try {
        if (!genAI) {
            throw new Error('Gemini AI not initialized - API key missing');
        }

        console.log(`🤖 Analyzing document with Gemini ${GEMINI_MODEL}...`);

        // DEBUG: Verify API Key and Model at runtime
        const currentKey = process.env.GEMINI_API_KEY;
        console.log('🔍 Debug - Runtime Config:');
        console.log(`   - API Key present: ${!!currentKey}`);
        console.log(`   - API Key length: ${currentKey ? currentKey.length : 0}`);
        console.log(`   - Model: ${GEMINI_MODEL}`);

        // Re-initialize to ensure we have the latest key
        const activeGenAI = new GoogleGenerativeAI(currentKey || GEMINI_API_KEY);
        const model = activeGenAI.getGenerativeModel({ model: GEMINI_MODEL });

        let prompt = '';
        let parts = [];

        if (processedFile.type === 'text') {
            // Text content
            const text = processedFile.text;

            // Check if we need to chunk
            if (text.length > 30000) {
                console.log(`📝 Text is large (${text.length} chars), using first chunk only for analysis`);
                const chunks = chunkText(text);
                prompt = `Analyze this document and provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet list)
3. Content classification (category/topic)
4. A hint for follow-up questions

Document excerpt:
${chunks[0]}

${chunks.length > 1 ? `[Note: This is part 1 of ${chunks.length}. Full document analysis available via Q&A.]` : ''}`;
            } else {
                prompt = `Analyze this document and provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet list)
3. Content classification (category/topic)
4. A hint for follow-up questions

Document content:
${text}`;
            }

            parts = [{ text: prompt }];

        } else if (processedFile.type === 'image') {
            // Image content
            prompt = `Analyze this image and provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet list)
3. Content classification (category/topic)
4. A hint for follow-up questions`;

            parts = [
                { text: prompt },
                {
                    inlineData: {
                        data: processedFile.images[0].base64,
                        mimeType: processedFile.images[0].mimetype
                    }
                }
            ];

        } else if (processedFile.type === 'mixed') {
            // Mixed content (text + images)
            prompt = `Analyze this document (text + images) and provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet list)
3. Content classification (category/topic)
4. A hint for follow-up questions

Text content:
${processedFile.text}`;

            parts = [{ text: prompt }];

            // Add images
            for (const img of processedFile.images) {
                parts.push({
                    inlineData: {
                        data: img.base64,
                        mimeType: img.mimetype
                    }
                });
            }
        }

        // Generate content with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 60000)
        );

        const result = await Promise.race([
            model.generateContent(parts),
            timeoutPromise
        ]);

        const response = result.response.text();

        console.log(`✅ Analysis complete: ${response.substring(0, 100)}...`);

        // Parse response (simple parsing - expect structured format)
        const lines = response.split('\n').filter(l => l.trim());

        return {
            summary: response.substring(0, 300),
            keyPoints: extractKeyPoints(response),
            classification: extractClassification(response),
            followUpHint: "You can ask me questions about this document, such as: 'What are the main topics?', 'Explain section X', or 'Summarize page Y'.",
            rawResponse: response
        };

    } catch (error) {
        console.error('❌ Document analysis error:', error.message);

        // Provide user-friendly error messages
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            throw new Error('Network error - Unable to connect to Gemini API. Please check your internet connection.');
        } else if (error.message.includes('API key') || error.message.includes('401')) {
            throw new Error('Invalid or missing Gemini API key. Please check your .env configuration.');
        } else if (error.message.includes('429') || error.message.includes('quota')) {
            throw new Error('API quota exceeded. Please try again later or check your Gemini API quota.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Request timeout - The document may be too large. Please try a smaller file.');
        } else {
            throw new Error(`Document analysis failed: ${error.message}`);
        }
    }
}

/**
 * Chat with document context using RAG-lite approach
 * Returns: { answer, context }
 */
export async function chat(query, fileContext) {
    try {
        console.log(`💬 Document chat query: "${query}"`);

        // DEBUG: Verify API Key and Model at runtime (Fix for "API key expired" error)
        const currentKey = process.env.GEMINI_API_KEY;
        console.log('🔍 Debug - Chat Runtime Config:');
        console.log(`   - API Key present: ${!!currentKey}`);

        // Re-initialize to ensure we have the latest key
        const activeGenAI = new GoogleGenerativeAI(currentKey || GEMINI_API_KEY);
        const model = activeGenAI.getGenerativeModel({ model: GEMINI_MODEL });

        let parts = [];
        let contextText = '';

        // Build context from file
        if (fileContext.extractedText) {
            contextText = fileContext.extractedText;

            // Chunk if needed
            if (contextText.length > 30000) {
                const chunks = chunkText(contextText);
                contextText = chunks[0]; // Use first chunk for now
                console.log(`📝 Using first chunk of ${chunks.length} for context`);
            }
        }

        // Build prompt
        const prompt = `Based on the following document, answer the user's question.

Document content:
${contextText}

${fileContext.summary ? `Summary: ${fileContext.summary}\n` : ''}

User question: ${query}

Provide a clear, concise answer based on the document content. If the answer is not in the document, say so.`;

        parts.push({ text: prompt });

        // Add images if available
        if (fileContext.extractedImages && fileContext.extractedImages.length > 0) {
            for (const img of fileContext.extractedImages) {
                parts.push({
                    inlineData: {
                        data: img.base64,
                        mimeType: img.mimetype
                    }
                });
            }
        }

        // Generate answer
        const result = await model.generateContent(parts);
        const answer = result.response.text();

        console.log(`✅ Answer generated: ${answer.substring(0, 100)}...`);

        return {
            answer: answer,
            context: contextText.substring(0, 500) + '...'
        };

    } catch (error) {
        console.error('❌ Document chat error:', error.message);

        // Provide user-friendly error messages
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            throw new Error('Network error - Unable to connect to Gemini API. Please check your internet connection.');
        } else if (error.message.includes('API key') || error.message.includes('401')) {
            throw new Error('Invalid or missing Gemini API key. Please check your .env configuration.');
        } else if (error.message.includes('429') || error.message.includes('quota')) {
            throw new Error('API quota exceeded. Please try again later.');
        } else {
            throw new Error(`Chat failed: ${error.message}`);
        }
    }
}

// Helper: Extract key points from response
function extractKeyPoints(response) {
    const points = [];
    const lines = response.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
            points.push(trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
        }
    }

    return points.slice(0, 5); // Top 5 points
}

// Helper: Extract classification
function extractClassification(response) {
    const lower = response.toLowerCase();

    if (lower.includes('classification') || lower.includes('category')) {
        const match = response.match(/classification:?\s*([^\n]+)/i) ||
            response.match(/category:?\s*([^\n]+)/i);
        if (match) {
            return match[1].trim();
        }
    }

    return 'General Document';
}
