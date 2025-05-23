// File: src/noteGenerator.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractTextFromFile } from './textExtractor.js';
import { getRoadmap, generateNotesForPhase } from './aiProcessor.js';
import { generateDocx, generatePdf } from './documentGenerator.js';
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function toMarkdown(allNotes) {
    return allNotes.map(note => {
        const subNotesMarkdown = note.notes.map((sub) => `### ${sub.subPhaseTitle}\n${sub.notes}`).join('\n\n');
        return `# ${note.title}\n\n${note.description}\n\n${subNotesMarkdown}`;
    }).join('\n\n---\n\n');
}
export async function generateNotes(filePath, metadata) {
    try {
        // Create outputs directory if it doesn't exist
        const outputDir = path.join(__dirname, '../outputs');
        await fs.mkdir(outputDir, { recursive: true });
        // Extract text from the file
        console.log('Extracting text from file...');
        const extractedText = await extractTextFromFile(filePath);
        // Process the content with Gemini AI
        console.log('Generating Roadmap with AI...');
        const rawRoadmap = await getRoadmap(extractedText, metadata);
        const rawRoadmapStr = rawRoadmap.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
        const filteredRoadmap = JSON.parse(rawRoadmapStr);
        console.log('Filtered Roadmap:', filteredRoadmap);
        const roadmapObj = filteredRoadmap.roadmapjson;
        const phaseEntries = Object.entries(roadmapObj);
        // console.log('Phase Entries:', phaseEntries);
        const allNotes = [];
        for (const [phaseKey, phase] of phaseEntries) {
            try {
                console.log(`📘 Generating notes for phase: ${phase.title}`);
                const phaseString = JSON.stringify(phase);
                const data = await generateNotesForPhase(phaseString);
                allNotes.push({
                    phaseKey,
                    title: data.phaseTitle,
                    description: data.phaseDescription,
                    notes: data.notes,
                });
            }
            catch (err) {
                console.error(`❌ Error generating notes for phase "${phaseKey}":`, err);
            }
        }
        const finalNotesMarkdown = toMarkdown(allNotes);
        const outputPath = './notes.md'; // testing how many lines it spits out
        try {
            await fs.writeFile(outputPath, finalNotesMarkdown, 'utf-8');
            console.log(`✅ Notes written successfully to: ${outputPath}`);
        }
        catch (error) {
            console.error('❌ Failed to write notes to file:', error);
        }
        // Generate output files
        console.log('Generating documents...');
        const timestamp = Date.now();
        const baseFilename = `${metadata.courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes_${timestamp}`;
        const docxPath = path.join(outputDir, `${baseFilename}.docx`);
        const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
        await generateDocx(finalNotesMarkdown, metadata, docxPath);
        await generatePdf(finalNotesMarkdown, metadata, pdfPath);
        return [docxPath, pdfPath];
        // return ['hi', 'bro'];
    }
    catch (error) {
        console.error('Error in generateNotes:', error);
        throw error;
    }
}
