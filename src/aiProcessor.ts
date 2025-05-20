// File: src/aiProcessor.ts
import { Groq } from 'groq-sdk';
import { NoteMetadata } from './noteGenerator.js';

export async function processContentWithGroq(
  content: string,
  metadata: NoteMetadata
): Promise<string> {
  try {
    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Prepare the prompt
    const prompt = `
You are an expert educational content creator. Your task is to create comprehensive, well-structured notes based on the syllabus or course content provided below.

COURSE INFORMATION:
- Course Title: ${metadata.courseTitle}
- Professor: ${metadata.professorName}
- Institution: ${metadata.institution}

ORIGINAL CONTENT:
${content}

Please generate detailed, comprehensive educational notes that:
1. Cover all the topics mentioned in the original content
2. Expand with detailed explanations, examples, and clarifications
3. Use a clear, academic structure with headings and subheadings
4. Include relevant definitions, concepts, and principles
5. Are suitable for college-level students
6. Are well-organized for easy studying and reference

FORMAT:
- Use Markdown for structure
- Use # for main headings (H1)
- Use ## for subheadings (H2)
- Use ### for sub-subheadings (H3)
- Use bullet points and numbered lists where appropriate
- Bold key terms and important concepts

Your response should only contain the formatted notes content, without any introductory or concluding remarks.
`;

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