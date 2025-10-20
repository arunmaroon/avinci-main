/**
 * Enhanced Transcript Upload Route
 * Handles file uploads, Google Docs scraping, and AI persona generation
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const pdfParse = require('pdf-parse');
const GoogleDocsScraper = require('../services/googleDocsScraper');
const UnsplashImageService = require('../services/unsplashImageService');
const { auth } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const GenerationErrorHandler = require('../utils/generationErrorHandler');
const { pool } = require('../models/database');

const router = express.Router();
const googleDocsScraper = new GoogleDocsScraper();
const unsplashImageService = new UnsplashImageService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/transcripts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, DOC, DOCX, CSV, and JSON files are allowed.'), false);
    }
  }
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir('uploads/transcripts/', { recursive: true });
  } catch (error) {
    logger.error('Error creating uploads directory:', error);
  }
};

ensureUploadsDir();

/**
 * @route POST /api/transcript/upload
 * @desc Upload and process transcripts to generate AI personas
 * @access Public (for testing)
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { urls, text, context } = req.body;
    const files = req.files || [];
    
    logger.info(`Processing transcript upload: ${files.length} files, ${urls ? JSON.parse(urls).length : 0} URLs, ${text ? 'with' : 'without'} pasted text`);

    // Validate request
    if (files.length === 0 && !urls && !text) {
      return res.status(400).json({
        success: false,
        error: 'No files, URLs, or text provided'
      });
    }

    const transcripts = [];
    const sourceFiles = [];

    // Process uploaded files
    for (const file of files) {
      try {
        let content;
        
        if (file.mimetype === 'text/plain' || file.mimetype === 'text/csv') {
          content = await fs.readFile(file.path, 'utf8');
        } else if (file.mimetype === 'application/json') {
          const jsonContent = await fs.readFile(file.path, 'utf8');
          const jsonData = JSON.parse(jsonContent);
          content = jsonData.text || jsonData.content || JSON.stringify(jsonData);
        } else if (file.mimetype === 'application/pdf') {
          // Extract text from PDF
          const buffer = await fs.readFile(file.path);
          const parsed = await pdfParse(buffer);
          content = parsed.text || '';
        } else {
          // For PDF, DOC, DOCX - would need additional processing
          content = await fs.readFile(file.path, 'utf8');
        }

        transcripts.push(content);
        sourceFiles.push(file.originalname);

        // Clean up uploaded file
        await fs.unlink(file.path);
      } catch (error) {
        logger.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    // Process Google Docs URLs
    if (urls) {
      try {
        const urlList = JSON.parse(urls);
        const googleDocsResults = await googleDocsScraper.extractMultipleTexts(urlList);
        
        for (const result of googleDocsResults) {
          if (result.success) {
            transcripts.push(result.text);
            sourceFiles.push(result.url);
          } else {
            logger.error(`Error extracting from ${result.url}:`, result.error);
          }
        }
      } catch (error) {
        logger.error('Error processing Google Docs URLs:', error);
      }
    }

    // Process pasted text
    if (text && text.trim()) {
      transcripts.push(text.trim());
      sourceFiles.push('pasted_text.txt');
    }

    if (transcripts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid transcripts found'
      });
    }

    // Process transcripts with AI
    logger.info(`Sending ${transcripts.length} transcripts to AI processing`);
    
    const processingResponse = await axios.post(`${process.env.DATA_PROCESSING_URL || 'http://localhost:5000'}/process-transcripts`, {
      transcripts: transcripts,
      source_files: sourceFiles
    }, {
      timeout: 300000, // 5 minutes
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!processingResponse.data.success) {
      throw new Error(processingResponse.data.error || 'AI processing failed');
    }

    const personas = processingResponse.data.personas;
    logger.info(`AI processing completed: ${personas.length} personas generated`);

    // Generate images for personas
    const personasWithImages = [];
    
    for (const persona of personas) {
      try {
        const imageData = await unsplashImageService.searchPersonaImage(persona);
        
        const enhancedPersona = {
          ...persona,
          image_url: imageData.url,
          image_data: {
            thumb: imageData.thumb,
            small: imageData.small,
            full: imageData.full,
            alt: imageData.alt,
            photographer: imageData.photographer,
            attribution: unsplashImageService.getAttribution(imageData)
          }
        };
        
        personasWithImages.push(enhancedPersona);
      } catch (error) {
        logger.error(`Error generating image for ${persona.name}:`, error);
        // Add persona without image
        personasWithImages.push({
          ...persona,
          image_url: null,
          image_data: null
        });
      }
    }

    // Save personas to database
    const savedAgents = [];
    for (const persona of personasWithImages) {
      try {
        const insertQuery = `
          INSERT INTO ai_agents (
            name, occupation, location, age, gender, avatar_url, source_type, source_document, is_active, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
          ) RETURNING id
        `;
        const values = [
          persona.name || 'Unknown',
          persona.occupation || 'AI Persona',
          persona.location || 'Unknown',
          Number(persona.age) || null,
          persona.gender || null,
          persona.image_url || null,
          'transcript',
          (persona.source_file || null),
          true
        ];

        const result = await pool.query(insertQuery, values);
        const agentId = result.rows[0].id;

        savedAgents.push({
          id: agentId,
          name: values[0],
          occupation: values[1],
          location: values[2],
          age: values[3],
          gender: values[4],
          avatar_url: values[5]
        });

      } catch (error) {
        logger.error(`Error saving persona ${persona.name}:`, error);
      }
    }

    logger.info(`Successfully processed ${savedAgents.length} personas`);

    res.json({
      success: true,
      message: `Successfully generated ${savedAgents.length} AI personas`,
      data: {
        agents: savedAgents,
        total_transcripts: transcripts.length,
        total_personas: savedAgents.length,
        processing_time: Date.now() - req.startTime
      }
    });

  } catch (error) {
    logger.error('Error in transcript upload:', error);
    const errorInfo = GenerationErrorHandler.formatErrorResponse(error, {
      operation: 'transcript_upload',
      userId: req.user?.id
    });
    res.status(errorInfo.statusCode).json(errorInfo);
  }
});

/**
 * @route GET /api/transcript/agents
 * @desc Get list of generated agents
 * @access Private
 */
router.get('/agents', auth, async (req, res) => {
  try {
    // This would typically fetch from your database
    // For now, return empty array
    res.json({
      success: true,
      agents: []
    });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents'
    });
  }
});

/**
 * @route GET /api/transcript/agents/:id
 * @desc Get specific agent by ID
 * @access Private
 */
router.get('/agents/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically fetch from your database
    // For now, return mock data
    res.json({
      success: true,
      agent: {
        id: id,
        name: 'Sample Agent',
        occupation: 'Software Engineer',
        location: 'Bangalore, Karnataka',
        image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
      }
    });
  } catch (error) {
    logger.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent'
    });
  }
});

module.exports = router;
