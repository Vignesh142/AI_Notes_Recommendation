import { getRoadmapPrompt } from './sysPrompt.js';
import { getNotesPrompt } from './sysPrompt.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyCwK-lRm-iYFCNufCSSAypLbKegNtauTKY");
// ✅ Gemini AI Completion Function
export async function askGemini(Prompt) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
        const chatSession = model.startChat({
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 64,
            },
        });
        const result = await chatSession.sendMessage(Prompt);
        const rawText = result.response.text();
        return rawText;
    }
    catch (error) {
        console.error("Error calling Gemini AI:", error);
        throw error;
    }
}
export async function getRoadmap(content, metadata) {
    try {
        const type = 'syllabus';
        const sysPrompt = getRoadmapPrompt(content, type);
        return await askGemini(sysPrompt);
    }
    catch (error) {
        console.error('Error processing content with AI (Roadmap):', error);
        throw error;
    }
}
export async function generateNotesForPhase(phaseStr) {
    const phaseObj = JSON.parse(phaseStr);
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
                const response = await askGemini(systemPrompt + '\n\n' + userPrompt);
                const filteredResponseStr = response
                    .replace(/^```[a-z]*\n?/i, "")
                    .replace(/```$/, "")
                    .trim();
                console.log("Title: " + sub.title + " Response: " + filteredResponseStr);
                subNotes.push({
                    subPhaseTitle: sub.title,
                    notes: filteredResponseStr,
                });
            }
            catch (error) {
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
