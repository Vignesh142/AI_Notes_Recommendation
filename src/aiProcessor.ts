// File: src/aiProcessor.ts
import { Groq } from 'groq-sdk';
import { NoteMetadata } from './noteGenerator.js';
import { getRoadmapPrompt } from './sysPrompt.js';
import { Phase, SubPhase } from './noteGenerator.js';
import { getNotesPrompt } from './sysPrompt.js';

const groq = new Groq({
  // apiKey: process.env.GROQ_API_KEY
  apiKey: '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'
});

// ✅ Generic AI Completion Function
export async function askGroq(prompt: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      // temperature: 0.3,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    throw error;
  }
}


export async function getRoadmap(
  content: string,
  metadata: NoteMetadata
): Promise<string> {
  try {
    const type = 'syllabus';
    const sysPrompt = getRoadmapPrompt(content, type);

    return await askGroq(sysPrompt);
  } catch (error) {
    console.error('Error processing content with AI (Roadmap):', error);
    throw error;
  }
}


export async function generateNotesForPhase(phase: string) {
    // console.log("Current: \n\n" + phase)
    const phaseObj = JSON.parse(phase) as Phase;
    console.log(phaseObj.title);
    console.log(phaseObj.description);

    const systemPrompt = getNotesPrompt();

    const subPhases = phaseObj?.subPhases;
    if (!subPhases || typeof subPhases !== 'object') {
      throw new Error('Invalid or missing subPhases');
    }

    const userPrompt = `
    Phase: ${phaseObj?.title}
    Description: ${phaseObj?.description}

    SubPhases:
    ${Object.values(subPhases)
      .map((sub) => `- ${sub?.title}: ${sub?.description}`)
      .join("\n")}
    `;

    const response = await askGroq(systemPrompt + '\n\n' + userPrompt);

    let filteredResponseStr = response.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();

    console.log(filteredResponseStr)
    
    return response;
    // return 'hi';
}