// File: src/index.ts
import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateNotes } from './noteGenerator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/downloads', express.static(path.join(__dirname, '../outputs')));

// API endpoint for file upload and processing
app.post('/api/generate-notes', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract metadata from the request
    const courseTitle = req.body.courseTitle || 'Course Title';
    const professorName = req.body.professorName || 'Professor Name';
    const institution = req.body.institution || 'Institution Name';

    // Generate the notes
    const filePath = req.file.path;
    const outputFiles = await generateNotes(filePath, {
      courseTitle,
      professorName,
      institution
    });

    res.json({
      success: true,
      message: 'Notes generated successfully',
      files: outputFiles.map(file => ({
        url: `/downloads/${path.basename(file)}`,
        filename: path.basename(file)
      }))
    });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ 
      error: 'Failed to generate notes', 
      message: (error instanceof Error ? error.message : String(error))
    });
  }
});

// Root endpoint to serve the HTML interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});