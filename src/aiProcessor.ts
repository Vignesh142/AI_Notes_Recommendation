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


export async function generateNotesForPhase(phaseStr: string) {
  const phaseObj = JSON.parse(phaseStr) as Phase;
  console.log(`\n📘 Generating notes for phase: ${phaseObj.title}\n`);

  const systemPrompt = getNotesPrompt();
  const subPhases = phaseObj?.subPhases;

  if (subPhases && typeof subPhases === 'object') {
    const subNotes = [];

    for (const sub of Object.values(subPhases)) {
      const userPrompt = `
You are generating notes for a sub-topic of a phase.

SubPhase Title: ${sub?.title}
SubPhase Description: ${sub?.description}
Generate clear and comprehensive notes for this sub-topic.
`;

      try {
        const response = await askGroq(systemPrompt + '\n\n' + userPrompt);
        const filteredResponseStr = response
          .replace(/^```[a-z]*\n?/i, "")
          .replace(/```$/, "")
          .trim();

        subNotes.push({
          subPhaseTitle: sub.title,
          notes: filteredResponseStr,
        });
      } catch (error) {
        console.error(`❌ Failed to generate notes for subPhase "${sub?.title}":`, error);
      }
    }

    return {
      phaseTitle: phaseObj.title,
      phaseDescription: phaseObj.description,
      notes: subNotes,
    };
  }

  return {
    phaseTitle: phaseObj.title,
    phaseDescription: phaseObj.description,
    notes: [],
  };
}

