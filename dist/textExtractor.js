// File: src/textExtractor.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
/**
 * Extracts text content from various file types
 * Supports: .txt, .pdf, .docx, .doc
 *
 * @param filePath Path to the file
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromFile(filePath) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        if (fileExtension === '.txt') {
            // For text files, just read the content
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        }
        else if (fileExtension === '.pdf') {
            // For PDF files, use pdf-parse
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdfParse(dataBuffer);
            return pdfData.text;
        }
        else if (fileExtension === '.docx' || fileExtension === '.doc') {
            // For Word documents, use mammoth
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
        else {
            throw new Error(`Unsupported file type: ${fileExtension}`);
        }
    }
    catch (error) {
        console.error(`Error extracting text from ${filePath}:`, error);
        throw error;
    }
}
