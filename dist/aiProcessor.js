// File: src/aiProcessor.ts
import { Groq } from 'groq-sdk';
import { getSysPrompt } from './sysPrompt.js';
export async function processContentWithGroq(content, metadata) {
    try {
        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        const sysPrompt = getSysPrompt(metadata, content);
        const prompt = sysPrompt;
        // Call the Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            // temperature: 0.3,
        });
        return completion.choices[0].message.content;
    }
    catch (error) {
        console.error('Error processing content with AI:', error);
        throw error;
    }
}
