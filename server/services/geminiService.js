import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: dotenv is loaded in server.js with { override: true }
// Log the API key being used (first 20 chars for debugging)
console.log('🔑 Gemini Service - API Key:', process.env.GEMINI_API_KEY?.substring(0, 20) + '...');
console.log('🤖 Gemini Service - Model:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');

// Initialize Gemini client
let genAI = null;

const initializeGemini = (apiKey = process.env.GEMINI_API_KEY) => {
  if (!apiKey) {
    console.error('❌ Gemini API key not found');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
    return false;
  }
};

// Initialize on module load
initializeGemini();

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - The user's question
 * @param {string} model - Model ID to use
 * @param {Array} conversationHistory - Previous conversation
 * @param {string|null} image - Base64 image data (optional)
 * @returns {Promise<Object>} AI response
 */
export const generateGeminiResponse = async (
  userMessage,
  model = process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  conversationHistory = [],
  image = null
) => {
  try {
    if (!genAI) {
      throw new Error('Gemini client not initialized');
    }

    // Build conversation history
    let historyString = '';
    if (conversationHistory.length > 0) {
      historyString = '\n\n[Previous conversation]\n';
      conversationHistory.slice(-10).forEach((msg) => {
        historyString += `${msg.role}: ${msg.content}\n`;
      });
    }

    // Check if userMessage already contains a structured prompt (e.g., PDF content with delimiters)
    const hasStructuredPrompt = userMessage.includes('---BEGIN DOCUMENT---') ||
      userMessage.includes('[Document Content]');

    // Different prompts for visual vs text queries
    let prompt;

    if (hasStructuredPrompt) {
      // For structured prompts (PDFs), use the message as-is with minimal wrapping
      prompt = `You are Wieesion, a helpful AI assistant.

${historyString}

${userMessage}`;
    } else if (image) {
      // For images, use vision-specific prompt
      prompt = `You are Wieesion, a helpful AI assistant with vision capabilities.

The user has shared their screen with you. Analyze the image and provide a helpful response.

${historyString}

User: ${userMessage}

Instructions:
- Describe what you see in the image clearly and accurately
- If there's code, explain what it does
- If there's an error, help debug it
- If there's text, read and summarize it
- Answer the user's specific question based on the visual content
- Be concise but thorough

Provide your response:`;
    } else {
      // For regular text queries - User defined behavior
      prompt = `You are Wieesion, a helpful AI assistant.

${historyString}

User: ${userMessage}

Instructions:
Anything the user asks, analyze the query, decide yourself if the user wants one word or detailed answer based on the question the user has asked.
If user specified a certain way then follow that.
If the user did not specify the certain way then answer in these steps:
1. Give the one line answer.
2. Give a brief summary of the answer with an example.

Ask this before generating these, if user says "yes" in voice commands then only {
3. Give the detailed answer but not more than 150 words.
4. If a question can only be explained with a code then give the code and summarize the code and its components briefly.
}

Also, prioritize speed over accuracy and details.
The quickness of response matters the most.
ALways give the asnwer in simple english not professional technical english.`;
    }

    // Get Gemini model with appropriate temperature
    // Use temperature 0 for file analysis (deterministic), 0.7 for chat
    const temperature = hasStructuredPrompt ? 0 : 0.7;

    const geminiModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      }
    });

    // Prepare content parts
    const contentParts = [prompt];

    // Add image if present
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      });
      console.log('📸 Adding image to Gemini request');
    }

    // Generate response
    const result = await geminiModel.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response generated');

    // Return simple response object
    return {
      answer: text,
      model: model,
      provider: 'gemini',
      hasVisualContext: !!image
    };

  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    throw error;
  }
};

/**
 * Validate Gemini API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} Whether the key is valid
 */
export const validateGeminiKey = async (apiKey) => {
  try {
    const testClient = new GoogleGenerativeAI(apiKey);
    const model = testClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await model.generateContent('test');
    return true;
  } catch (error) {
    console.error('Gemini key validation failed:', error.message);
    return false;
  }
};

/**
 * Generate session summary from transcript
 * @param {Array} transcript - Array of {role, content} messages
 * @returns {Promise<string>} Summary text
 */
export const generateSessionSummary = async (transcript) => {
  try {
    if (!genAI) {
      throw new Error('Gemini client not initialized');
    }

    const conversationText = transcript
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const prompt = `You are a professional meeting assistant. Analyze the following conversation and generate a comprehensive summary.

CONVERSATION:
${conversationText}

Generate a summary with the following sections:
1. **Key Topics Discussed**: Main themes and subjects covered
2. **Decisions Made**: Any conclusions or agreements reached
3. **Action Items**: Tasks or follow-ups identified
4. **Important Points**: Notable insights or information shared

Format the summary in clear, professional markdown.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log('✅ Session summary generated');
    return summary;

  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    throw error;
  }
};

/**
 * Generate follow-up email from summary
 * @param {string} summary - Meeting summary
 * @returns {Promise<string>} Email draft
 */
export const generateFollowUpEmail = async (summary) => {
  try {
    if (!genAI) {
      throw new Error('Gemini client not initialized');
    }

    const prompt = `Based on the following meeting summary, generate a professional follow-up email.

SUMMARY:
${summary}

Generate a concise, professional email that:
- Thanks the recipient for their time
- Briefly recaps key points
- Mentions any action items or next steps
- Has a friendly, professional tone

Format as a complete email with subject line and body.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const email = response.text();

    console.log('✅ Follow-up email generated');
    return email;

  } catch (error) {
    console.error('❌ Email generation error:', error.message);
    throw error;
  }
};

export default {
  generateGeminiResponse,
  generateSessionSummary,
  generateFollowUpEmail,
  validateGeminiKey,
  initializeGemini
};
