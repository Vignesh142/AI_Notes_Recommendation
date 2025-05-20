// File: src/aiProcessor.ts
import { Groq } from 'groq-sdk';
import { NoteMetadata } from './noteGenerator.js';
import { getRoadmapPrompt } from './sysPrompt.js';

export async function processContentWithGroq(
  content: string,
  metadata: NoteMetadata
): Promise<string> {
  try {
    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const sysPrompt = getRoadmapPrompt(content);
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
  } catch (error) {
    console.error('Error processing content with AI:', error);
    throw error;
  }
}