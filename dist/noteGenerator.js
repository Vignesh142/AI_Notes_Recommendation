// File: src/noteGenerator.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractTextFromFile } from './textExtractor.js';
import { getRoadmap, generateNotesForPhase } from './aiProcessor.js';
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function generateNotes(filePath, metadata) {
    try {
        // Create outputs directory if it doesn't exist
        const outputDir = path.join(__dirname, '../outputs');
        await fs.mkdir(outputDir, { recursive: true });
        // Extract text from the file
        console.log('Extracting text from file...');
        const extractedText = await extractTextFromFile(filePath);
        // Process the content with Groq AI
        console.log('Generating Roadmap with AI...');
        const rawRoadmap = await getRoadmap(extractedText, metadata);
        const rawRoadmapStr = rawRoadmap.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
        const filteredRoadmap = JSON.parse(rawRoadmapStr);
        // console.log('Filtered Roadmap:', filteredRoadmap);
        // Grab the inner object containing phase1, phase2, etc.
        const roadmapObj = filteredRoadmap.roadmapjson;
        const phaseEntries = Object.entries(roadmapObj);
        // console.log('Phase Entries:', phaseEntries);
        const allNotes = [];
        for (const [key, phase] of phaseEntries) {
            try {
                console.log("Generating notes for:", key);
                const res = await generateNotesForPhase(JSON.stringify(phase));
                allNotes.push({
                    phaseKey: key,
                    title: phase.title,
                    notes: res,
                });
            }
            catch (err) {
                console.error(`❌ Error generating notes for phase "${key}":`, err);
            }
        }
        const finalNotesMarkdown = allNotes
            .map(({ title, notes }) => `## ${title}\n\n${notes}`)
            .join("\n\n");
        const outputPath = './notes.md'; // or any path you want
        try {
            await fs.writeFile(outputPath, finalNotesMarkdown, 'utf-8');
            console.log(`✅ Notes written successfully to: ${outputPath}`);
        }
        catch (error) {
            console.error('❌ Failed to write notes to file:', error);
        }
        // Generate output files
        console.log('Generating documents...');
        // const timestamp = Date.now();
        // const baseFilename = `${metadata.courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes_${timestamp}`;
        // const docxPath = path.join(outputDir, `${baseFilename}.docx`);
        // const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
        // await generateDocx(processedContent, metadata, docxPath);
        // await generatePdf(processedContent, metadata, pdfPath);
        // return [docxPath, pdfPath];
        return ['hi', 'bro'];
    }
    catch (error) {
        console.error('Error in generateNotes:', error);
        throw error;
    }
}
