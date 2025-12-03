import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGeminiResponse } from './geminiService.js';
import Groq from 'groq-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mode-to-Model mapping (hard-coded as per spec)
const MODE_CONFIG = {
    general: { provider: 'groq', model: 'llama-3.1-8b-instant' },
    coding: { provider: 'gemini', model: 'gemini-2.5-flash' },
    document: { provider: 'gemini', model: 'gemini-2.5-flash' }
};



class ActorManager {
    constructor() {
        this.currentMode = 'general';
    }

    /**
     * Get current mode
     */
    getMode() {
        return this.currentMode;
    }

    /**
     * Set mode
     */
    setMode(mode) {
        if (!MODE_CONFIG[mode]) {
            throw new Error(`Invalid mode: ${mode}. Must be: general, coding, or document`);
        }

        console.log(`🔄 Mode switched: ${this.currentMode} → ${mode}`);
        this.currentMode = mode;

        // Log event
        this.logEvent('mode_switch', { from: this.currentMode, to: mode });
    }



    /**
     * Handle question with mode-aware routing
     */
    async handleQuestion(question, opts = {}) {
        const { conversationHistory = [], image = null } = opts;

        const config = MODE_CONFIG[this.currentMode];

        console.log(`📝 Handling question in ${this.currentMode} mode`);
        console.log(`   Provider: ${config.provider}, Model: ${config.model}`);

        // Build prompt based on mode
        let systemPrompt = '';
        let userPrompt = question;



        // Generate answer
        let answer;

        if (config.provider === 'groq') {
            answer = await this.generateGroqResponse(userPrompt, systemPrompt, conversationHistory, image);
        } else if (config.provider === 'gemini') {
            answer = await this.generateGeminiResponse(userPrompt, systemPrompt, conversationHistory, image);
        }



        return {
            answer: answer,
            verified: true
        };
    }

    /**
     * Generate Groq response
     */
    /**
     * Generate Groq response
     */
    async generateGroqResponse(userPrompt, systemPrompt, conversationHistory, image = null) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const messages = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        } else {
            messages.push({
                role: 'system',
                content: 'You are a helpful AI assistant. Provide clear, concise answers.'
            });
        }

        // Add conversation history (last 10 messages)
        messages.push(...conversationHistory.slice(-10));

        // Add current question
        if (image) {
            console.log('👁️ Using Groq Vision Model: meta-llama/llama-4-scout-17b-16e-instruct');
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: userPrompt },
                    { type: 'image_url', image_url: { url: image } }
                ]
            });
        } else {
            messages.push({ role: 'user', content: userPrompt });
        }

        const model = image ? 'meta-llama/llama-4-scout-17b-16e-instruct' : MODE_CONFIG.general.model;

        const completion = await groq.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        });

        return completion.choices[0]?.message?.content || 'No response generated';
    }

    /**
     * Generate Gemini response
     */
    async generateGeminiResponse(userPrompt, systemPrompt, conversationHistory, image) {
        // Construct full prompt
        let fullPrompt = '';

        if (systemPrompt) {
            fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        } else {
            fullPrompt = userPrompt;
        }

        // Use existing geminiService
        const result = await generateGeminiResponse(
            fullPrompt,
            MODE_CONFIG.coding.model,
            conversationHistory,
            image
        );

        return result.answer;
    }



    /**
     * Log event
     */
    logEvent(event, data = {}) {
        console.log(`📊 Event: ${event}`, data);

        // TODO: Implement proper logging to file if needed
        // For now, just console log
    }
}

// Singleton instance
const actorManager = new ActorManager();

export default actorManager;
export { ActorManager, MODE_CONFIG };
