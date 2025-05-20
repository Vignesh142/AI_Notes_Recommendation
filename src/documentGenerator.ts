// File: src/documentGenerator.ts
import * as fs from 'fs/promises';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, BorderStyle } from 'docx';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { NoteMetadata } from './noteGenerator.js';

export async function generateDocx(
  content: string,
  metadata: NoteMetadata,
  outputPath: string
): Promise<void> {
  try {
    // Convert markdown to document structure
    const lines = content.split('\n');
    const children = [];
    
    // Add header
    const header = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: metadata.institution,
              bold: true,
              size: 24
            })
          ]
        })
      ]
    });
    
    // Add title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: metadata.courseTitle,
            bold: true,
            size: 32
          })
        ]
      })
    );
    
    // Process markdown content
    let currentHeadingLevel = 0;
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 }
          })
        );
        currentHeadingLevel = 1;
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 160, after: 80 }
          })
        );
        currentHeadingLevel = 2;
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 40 }
          })
        );
        currentHeadingLevel = 3;
      } else if (line.startsWith('- ')) {
        children.push(
          new Paragraph({
            text: '• ' + line.substring(2),
            indent: { left: 720 }
          })
        );
      } else if (line.trim().match(/^\d+\.\s/)) {
        const matchResult = line.trim().match(/^(\d+)\.\s(.+)$/);
        if (matchResult) {
          children.push(
            new Paragraph({
              text: `${matchResult[1]}. ${matchResult[2]}`,
              indent: { left: 720 }
            })
          );
        }
      } else if (line.trim() !== '') {
        children.push(
          new Paragraph({
            text: line
          })
        );
      } else {
        // Empty line
        children.push(new Paragraph({}));
      }
    }
    
    // Add footer
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: {
            top: {
              color: "auto",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          children: [
            new TextRun({
              text: `${metadata.professorName} | ${new Date().toLocaleDateString()}`,
              size: 20
            })
          ]
        })
      ]
    });
    
    // Create document
    const doc = new Document({
      sections: [
        {
          headers: {
            default: header
          },
          footers: {
            default: footer
          },
          children: children
        }
      ]
    });
    
    // Generate and save the document
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
}

export async function generatePdf(
  content: string,
  metadata: NoteMetadata,
  outputPath: string
): Promise<void> {
  try {
    // Convert markdown to HTML
    const htmlContent = marked(content);
    
    // Create full HTML document with styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${metadata.courseTitle} Notes</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #333;
            margin-bottom: 30px;
          }
          .institution {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            font-size: 22px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-top: 30px;
          }
          h2 {
            font-size: 18px;
            margin-top: 25px;
          }
          h3 {
            font-size: 16px;
            margin-top: 20px;
          }
          ul, ol {
            margin-left: 20px;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #ddd;
            margin-top: 30px;
            font-size: 14px;
          }
          @page {
            margin: 1cm;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="institution">${metadata.institution}</div>
            <div class="title">${metadata.courseTitle}</div>
          </div>
          
          ${htmlContent}
          
          <div class="footer">
            ${metadata.professorName} | ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Use Puppeteer to generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(fullHtml);
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
    
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
