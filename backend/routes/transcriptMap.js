/**
 * Transcript Mapping Route
 * Handles file upload (TXT), Google Docs URLs, and pasted text
 * Maps transcripts to comprehensive persona JSON with exact detail extraction
 */

const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const axios = require('axios');
const { pool } = require('../models/database');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext) || file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only TXT and PDF files are allowed.'));
        }
    }
});

/**
 * Extract text from Google Docs
 */
async function extractGoogleDocsText(docUrl) {
    try {
        // Extract document ID from URL
        const docIdMatch = docUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!docIdMatch) {
            throw new Error('Invalid Google Docs URL format');
        }
        const documentId = docIdMatch[1];

        console.log(`📄 Extracting Google Doc: ${documentId}`);

        // Use public export endpoint (no auth required for public docs)
        const exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=txt`;
        
        const response = await axios.get(exportUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Avinci/1.0)'
            }
        });

        if (!response.data) {
            throw new Error('No content extracted from Google Doc');
        }

        console.log(`✅ Extracted ${response.data.length} characters from Google Doc`);
        return response.data;

    } catch (error) {
        console.error('❌ Error extracting Google Doc:', error.message);
        
        // If public export fails, try authenticated approach
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            console.log('🔄 Attempting authenticated Google Docs access...');
            return await extractGoogleDocsWithAuth(docUrl);
        }
        
        throw new Error(`Failed to extract Google Doc: ${error.message}`);
    }
}

/**
 * Extract text from Google Docs using authentication
 */
async function extractGoogleDocsWithAuth(docUrl) {
    try {
        const docIdMatch = docUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!docIdMatch) {
            throw new Error('Invalid Google Docs URL format');
        }
        const documentId = docIdMatch[1];

        // Initialize OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:9001/auth/google/callback'
        );

        // For server-to-server, use service account or API key
        const docs = google.docs({ version: 'v1', auth: process.env.GOOGLE_API_KEY || oauth2Client });
        
        const doc = await docs.documents.get({ documentId });
        
        // Extract text from document structure
        let text = '';
        if (doc.data.body && doc.data.body.content) {
            for (const element of doc.data.body.content) {
                if (element.paragraph && element.paragraph.elements) {
                    for (const textElement of element.paragraph.elements) {
                        if (textElement.textRun && textElement.textRun.content) {
                            text += textElement.textRun.content;
                        }
                    }
                }
            }
        }

        console.log(`✅ Authenticated extraction: ${text.length} characters`);
        return text;

    } catch (error) {
        console.error('❌ Authenticated extraction failed:', error.message);
        throw error;
    }
}

/**
 * Extract text from uploaded file
 */
async function extractFileText(file) {
    try {
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (ext === '.txt' || file.mimetype === 'text/plain') {
            return file.buffer.toString('utf-8');
        } else if (ext === '.pdf') {
            const pdfData = await pdfParse(file.buffer);
            return pdfData.text;
        } else {
            throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error('❌ Error extracting file text:', error.message);
        throw error;
    }
}

/**
 * Validate transcript content
 */
function validateTranscript(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid transcript: must be a non-empty string');
    }
    
    if (text.length > 100000) { // 100k chars max
        throw new Error('Transcript too long: maximum 100,000 characters');
    }
    
    if (text.length < 10) {
        throw new Error('Transcript too short: minimum 10 characters');
    }
    
    return true;
}

/**
 * @route POST /api/transcript/map
 * @desc Map transcripts to comprehensive persona JSON
 * @access Public
 */
router.post('/map', upload.array('files', 10), async (req, res) => {
    try {
        console.log('\n📥 Received transcript mapping request');
        console.log('  Files:', req.files?.length || 0);
        console.log('  Body keys:', Object.keys(req.body));

        const transcripts = [];
        const sourceFiles = [];

        // 1. Handle uploaded files
        if (req.files && req.files.length > 0) {
            console.log(`📁 Processing ${req.files.length} uploaded files`);
            
            for (const file of req.files) {
                try {
                    console.log(`  Processing file: ${file.originalname}`);
                    const text = await extractFileText(file);
                    validateTranscript(text);
                    transcripts.push(text);
                    sourceFiles.push(file.originalname);
                    console.log(`  ✅ Extracted ${text.length} chars from ${file.originalname}`);
                } catch (error) {
                    console.error(`  ❌ Error processing ${file.originalname}:`, error.message);
                    // Continue with other files
                }
            }
        }

        // 2. Handle Google Docs URLs
        if (req.body.urls) {
            const urls = Array.isArray(req.body.urls) ? req.body.urls : [req.body.urls];
            console.log(`🔗 Processing ${urls.length} Google Docs URLs`);
            
            for (const url of urls) {
                if (url && url.trim()) {
                    try {
                        // Validate URL
                        if (!url.includes('docs.google.com')) {
                            throw new Error('Only Google Docs URLs are supported');
                        }
                        
                        console.log(`  Processing URL: ${url}`);
                        const text = await extractGoogleDocsText(url);
                        validateTranscript(text);
                        transcripts.push(text);
                        sourceFiles.push(`Google Doc: ${url.split('/d/')[1]?.split('/')[0] || 'unknown'}`);
                        console.log(`  ✅ Extracted ${text.length} chars from Google Doc`);
                    } catch (error) {
                        console.error(`  ❌ Error processing URL:`, error.message);
                        // Continue with other URLs
                    }
                }
            }
        }

        // 3. Handle pasted text
        if (req.body.text && req.body.text.trim()) {
            console.log(`📝 Processing pasted text`);
            try {
                const text = req.body.text.trim();
                validateTranscript(text);
                transcripts.push(text);
                sourceFiles.push('Pasted Text');
                console.log(`  ✅ Added ${text.length} chars from pasted text`);
            } catch (error) {
                console.error(`  ❌ Error processing pasted text:`, error.message);
            }
        }

        // Validate we have at least one transcript
        if (transcripts.length === 0) {
            return res.status(400).json({
                error: 'No valid transcripts provided',
                details: 'Please provide files, Google Docs URLs, or pasted text'
            });
        }

        console.log(`\n🤖 Sending ${transcripts.length} transcripts to data-processing service...`);

        // 4. Send to data-processing service
        const dataProcessingUrl = process.env.DATA_PROCESSING_URL || 'http://localhost:8001';
        console.log(`📡 Data processing URL: ${dataProcessingUrl}/map-transcripts`);
        
        try {
            const response = await axios.post(`${dataProcessingUrl}/map-transcripts`, {
                transcripts,
                source_files: sourceFiles
            }, {
                timeout: 120000, // 2 minutes timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const personas = response.data.personas || [];
            console.log(`✅ Received ${personas.length} personas from data-processing`);

            // 5. Store personas in database
            const savedPersonas = [];
            
            for (let i = 0; i < personas.length; i++) {
                try {
                    const persona = personas[i];
                    
                    // Skip error personas
                    if (persona.error) {
                        console.error(`⚠️  Skipping persona ${i + 1} due to error:`, persona.error);
                        continue;
                    }

                    console.log(`\n💾 Saving persona ${i + 1}/${personas.length}: ${persona.identity?.name || 'Unknown'}`);

                    // Extract fields for database
                    const name = persona.identity?.name || 'Unknown';
                    const age = persona.identity?.age || null;
                    const gender = persona.identity?.gender || null;
                    const occupation = persona.profession?.occupation || 'Not specified';
                    const location = persona.location?.city ? 
                        `${persona.location.city}${persona.location.state ? ', ' + persona.location.state : ''}` : 
                        'Not specified';
                    
                    // Use fallback avatar
                    const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=200`;

                    // Prepare arrays and objects
                    // For TEXT[] columns, pass native JS arrays (pg maps them to Postgres arrays)
                    const painPoints = [
                        ...(persona.pain_points?.general || []),
                        ...(persona.pain_points?.ui || [])
                    ];
                    const goals = [
                        ...(persona.goals?.short_term || []),
                        ...(persona.goals?.long_term || [])
                    ];
                    const motivations = Array.isArray(persona.motivations)
                        ? persona.motivations
                        : (persona.personality?.motivations || []);
                    const personality = JSON.stringify({
                        traits: persona.personality?.personality_traits || [],
                        values: persona.personality?.values || [],
                        archetype: null
                    });
                    const hobbies = JSON.stringify(persona.hobbies || []);
                    const daily_routine = JSON.stringify(persona.daily_routine || []);

                    // Insert into database
                    const insertQuery = `
                        INSERT INTO ai_agents (
                            name, occupation, location, age, gender, avatar_url,
                            pain_points, goals, motivations, personality, sample_quote,
                            hobbies, daily_routine, background_story,
                            tech_savviness, english_level, domain_savvy,
                            communication_style, emotional_profile, speech_patterns,
                            behavioral_patterns, cognitive_profile,
                            comprehensive_persona_json,
                            source_type, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                        RETURNING id, name, occupation, location, age, gender, avatar_url, created_at;
                    `;

                    const insertValues = [
                        name,
                        occupation,
                        location,
                        age,
                        gender,
                        avatar_url,
                        painPoints,
                        goals,
                        motivations,
                        personality,
                        persona.key_quotes?.[0] || '',
                        hobbies,
                        daily_routine,
                        persona.profession?.background || '',
                        (persona.tech_profile?.tech_savviness || 'medium').substring(0, 100),
                        (persona.tech_profile?.english_level || 'intermediate').substring(0, 100),
                        (persona.tech_profile?.domain_savvy || 'intermediate').substring(0, 20),
                        JSON.stringify(persona.communication_style || {}),
                        JSON.stringify(persona.emotional_profile || {}),
                        JSON.stringify({ formality: 5, vocabulary_level: persona.communication_style?.vocabulary_level || 'conversational' }),
                        JSON.stringify({ habits: persona.behavioral_patterns?.habits || [], routines: persona.daily_routine || [] }),
                        JSON.stringify({ decision_style: persona.decision_making?.style || null, learning_style: persona.learning_style?.style || null }),
                        JSON.stringify(persona),
                        'mapped_transcript',
                        new Date()
                    ];

                    const result = await pool.query(insertQuery, insertValues);
                    const savedAgent = result.rows[0];
                    
                    console.log(`✅ Saved: ${savedAgent.name} (ID: ${savedAgent.id})`);
                    savedPersonas.push(savedAgent);

                } catch (dbError) {
                    console.error(`❌ Database error for persona ${i + 1}:`, dbError.message);
                    // Continue with other personas
                }
            }

            console.log(`\n🎉 Successfully processed ${savedPersonas.length}/${transcripts.length} transcripts`);

            // 6. Return response
            res.json({
                success: true,
                personas: savedPersonas,
                extracted_data: personas,
                count: savedPersonas.length,
                message: `Successfully processed ${savedPersonas.length} transcript(s)`
            });

        } catch (apiError) {
            console.error('❌ Data processing API error:', apiError.message);
            console.error('Error code:', apiError.code);
            console.error('Error response:', apiError.response?.data);
            console.error('Error status:', apiError.response?.status);
            
            // Check if data-processing service is running
            if (apiError.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    error: 'Data processing service unavailable',
                    details: 'Please ensure the data-processing service is running on port 8001',
                    hint: 'Run: cd data-processing && python api/transcript_api.py'
                });
            }
            
            // Return detailed error
            return res.status(apiError.response?.status || 500).json({
                error: 'Data processing error',
                details: apiError.response?.data?.detail || apiError.message,
                hint: 'Check data-processing service logs'
            });
        }

    } catch (error) {
        console.error('❌ Transcript mapping error:', error);
        res.status(500).json({
            error: 'Failed to process transcripts',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * @route GET /api/transcript/test
 * @desc Test endpoint
 * @access Public
 */
router.get('/test', (req, res) => {
    res.json({
        service: 'Transcript Mapping API',
        status: 'online',
        endpoints: {
            map: 'POST /api/transcript/map',
            supports: ['TXT files', 'PDF files', 'Google Docs URLs', 'Pasted text']
        }
    });
});

module.exports = router;

