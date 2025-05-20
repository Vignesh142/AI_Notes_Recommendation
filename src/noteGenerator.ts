// File: src/noteGenerator.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractTextFromFile } from './textExtractor.js';
import { processContentWithGroq } from './aiProcessor.js';
import { generateDocx, generatePdf } from './documentGenerator.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NoteMetadata {
  courseTitle: string;
  professorName: string;
  institution: string;
}

export async function generateNotes(
  filePath: string,
  metadata: NoteMetadata
): Promise<string[]> {
  try {
    // Create outputs directory if it doesn't exist
    const outputDir = path.join(__dirname, '../outputs');
    await fs.mkdir(outputDir, { recursive: true });

    // Extract text from the file
    console.log('Extracting text from file...');
    const extractedText = await extractTextFromFile(filePath);

    // Process the content with Groq AI
    console.log('Processing content with AI...');
    const processedContent = await processContentWithGroq(extractedText, metadata);

    // Generate output files
    console.log('Generating documents...');
    const timestamp = Date.now();
    const baseFilename = `${metadata.courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes_${timestamp}`;
    
    const docxPath = path.join(outputDir, `${baseFilename}.docx`);
    const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
    
    await generateDocx(processedContent, metadata, docxPath);
    await generatePdf(processedContent, metadata, pdfPath);
    
    return [docxPath, pdfPath];
  } catch (error) {
    console.error('Error in generateNotes:', error);
    throw error;
  }
}