import { generateGeminiResponse, validateGeminiKey } from './geminiService.js';
import { getCachedAIResponse, cacheAIResponse, isCacheable } from './cacheService.js';
import { checkRateLimit } from './rateLimiter.js';
import logger from '../logger.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, retries = RETRY_CONFIG.maxRetries, delay = RETRY_CONFIG.initialDelay) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      logger.error('❌ Max retries exceeded', { error: error.message });
      throw error;
    }

    const isRetryable =
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('429') ||
      error.message.includes('503') ||
      error.message.includes('500');

    if (!isRetryable) {
      logger.error('❌ Non-retryable error', { error: error.message });
      throw error;
    }

    const nextDelay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
    logger.warn(`⚠️ Retrying in ${delay}ms (${retries} retries left)`, { error: error.message });

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, nextDelay);
  }
};

// Model definitions
export const MODELS = {
  groq: [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      provider: 'groq'
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B',
      provider: 'groq'
    }
  ],
  gemini: [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'gemini'
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'gemini'
    }
  ]
};

/**
 * Generate Groq response
 */
const generateGroqResponse = async (question, conversationHistory = [], image = null, model = null) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const messages = [
    {
      role: 'system', content: `You are Wieesion, a helpful AI assistant.

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
ALways give the asnwer in simple english not professional technical english.` }
  ];

  // Add conversation history (sanitize to remove timestamp etc)
  const cleanHistory = conversationHistory.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  messages.push(...cleanHistory);

  // Add user question
  if (image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: question },
        { type: 'image_url', image_url: { url: image } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: question });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return {
      answer: completion.choices[0]?.message?.content || 'No response generated',
      model: model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      provider: 'groq'
    };
  } catch (error) {
    logger.error('❌ Groq generation failed', { error: error.message });
    throw error;
  }
};

/**
 * Generate AI response
 * @param {string} question - User's question
 * @param {string} provider - AI provider ('groq' or 'gemini')
 * @param {string} model - Model ID
 * @param {Array} conversationHistory - Previous messages
 * @param {string|null} image - Base64 image data
 * @returns {Promise<Object>} AI response
 */
export const generateResponse = async (
  question,
  provider = 'groq',
  model = null,
  conversationHistory = [],
  image = null
) => {
  const startTime = Date.now();

  try {
    logger.info('🤖 Generating AI response', {
      provider,
      model: model || 'default',
      questionLength: question.length,
      hasImage: !!image
    });

    // Check rate limits
    const rateLimitCheck = checkRateLimit(provider);
    if (!rateLimitCheck.allowed) {
      logger.warn('🚫 Rate limit exceeded', {
        provider,
        reason: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter
      });

      throw new Error(
        `${rateLimitCheck.reason}. Please wait ${rateLimitCheck.retryAfter} seconds.`
      );
    }

    // Check cache (only for text queries without images)
    if (!image && isCacheable(question)) {
      const cachedResponse = getCachedAIResponse(question, provider, model);
      if (cachedResponse) {
        const elapsed = Date.now() - startTime;
        logger.info('✅ Response from cache', { provider, elapsed: `${elapsed}ms` });
        return cachedResponse;
      }
    }

    // Generate response
    const response = await retryWithBackoff(async () => {
      // If an image is present and provider is Groq, switch to Groq Vision model
      if (image && provider === 'groq') {
        logger.info('🔄 Visual query detected – switching Groq model to Llama 4 Scout');
        model = 'meta-llama/llama-4-scout-17b-16e-instruct';
      }

      if (provider === 'groq') {
        return await generateGroqResponse(
          question,
          conversationHistory,
          image,
          model
        );
      } else if (provider === 'gemini') {
        return await generateGeminiResponse(
          question,
          model,
          conversationHistory,
          image
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }
    });

    // Cache response (only if no image)
    if (!image && isCacheable(question)) {
      cacheAIResponse(question, response, provider, model);
    }

    const elapsed = Date.now() - startTime;
    logger.info('✅ AI response generated', {
      provider,
      model: response.model,
      elapsed: `${elapsed}ms`,
      answerLength: response.answer?.length || 0
    });

    return response;

  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error('❌ AI generation failed', {
      provider,
      error: error.message,
      elapsed: `${elapsed}ms`
    });
    throw error;
  }
};

/**
 * Get available models for a provider
 */
export const getAvailableModels = (provider) => {
  return MODELS[provider] || [];
};

/**
 * Get all models
 */
export const getAllModels = () => {
  return MODELS;
};

/**
 * Validate provider API key
 */
export const validateProvider = async (provider, apiKey = null) => {
  try {
    if (provider === 'gemini') {
      const keyToValidate = apiKey || process.env.GEMINI_API_KEY;
      return await validateGeminiKey(keyToValidate);
    } else if (provider === 'groq') {
      const keyToValidate = apiKey || process.env.GROQ_API_KEY;
      const groq = new Groq({ apiKey: keyToValidate });
      await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Provider validation failed for ${provider}:`, error.message);
    return false;
  }
};

export default {
  generateResponse,
  getAvailableModels,
  getAllModels,
  validateProvider
};
