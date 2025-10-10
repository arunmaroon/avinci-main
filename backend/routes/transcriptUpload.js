/**
 * Transcript Upload API - Create personas from transcript documents
 * Supports Excel, CSV, and text files with transcript data
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const { pool } = require('../models/database');
const providerGateway = require('../services/providerGateway');
const promptBuilder = require('../services/promptBuilder');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/transcripts/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'transcript-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        console.log('File upload attempt:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        const allowedTypes = [
            'text/csv',
            'text/plain',
            'application/json',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/pdf',
            'application/octet-stream', // Fallback for various files
            'application/x-csv', // Alternative CSV type
            'text/x-csv', // Another CSV variant
        ];
        
        const allowedExtensions = ['.csv', '.xlsx', '.xls', '.txt', '.json', '.pdf', '.doc', '.docx', '.rtf', '.odt', '.md', '.html', '.htm'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        // Accept if either MIME type matches OR file extension is allowed
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            console.log('✅ File accepted:', file.originalname);
            cb(null, true);
        } else {
            console.log('❌ File rejected:', file.originalname, 'MIME:', file.mimetype, 'Ext:', fileExtension);
            cb(new Error(`Invalid file type: ${file.originalname}. Allowed: CSV, Excel, TXT, JSON, PDF, DOCX, and more.`));
        }
    }
});

/**
 * POST /transcript-upload
 * Upload transcript file and create personas
 */
router.post('/', upload.single('transcript'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No transcript file uploaded' });
    }

    try {
        console.log('Processing transcript file:', req.file.originalname);
        
        // Parse the uploaded file
        const transcripts = await parseTranscriptFile(req.file.path, req.file.mimetype);
        console.log(`Found ${transcripts.length} transcripts`);

        if (transcripts.length === 0) {
            return res.status(400).json({ error: 'No valid transcripts found in file' });
        }

        // Create personas from transcripts
        const results = [];
        const errors = [];

        for (let i = 0; i < transcripts.length; i++) {
            const transcript = transcripts[i];
            try {
                console.log(`Creating persona ${i + 1}/${transcripts.length}: ${transcript.name || 'Unknown'}`);
                
                const agentId = await createPersonaFromTranscript(transcript);
                results.push({
                    index: i + 1,
                    name: transcript.name || 'Unknown',
                    agentId: agentId,
                    status: 'success'
                });
            } catch (error) {
                console.error(`Error creating persona ${i + 1}:`, error.message);
                errors.push({
                    index: i + 1,
                    name: transcript.name || 'Unknown',
                    error: error.message,
                    status: 'failed'
                });
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: `Processed ${transcripts.length} transcripts`,
            successful: results.length,
            failed: errors.length,
            results: results,
            errors: errors
        });

    } catch (error) {
        console.error('Transcript upload error:', error);
        res.status(500).json({ error: 'Failed to process transcript file: ' + error.message });
    }
});

/**
 * Parse transcript file based on file type
 */
async function parseTranscriptFile(filePath, mimeType) {
    const transcripts = [];

    try {
        if (mimeType === 'text/plain') {
            // Plain text file - treat as single transcript
            const content = fs.readFileSync(filePath, 'utf8');
            transcripts.push({
                name: 'Transcript User',
                raw_text: content,
                demographics: {}
            });
        } else if (mimeType === 'application/json') {
            // JSON file - expect array of transcripts
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
                transcripts.push(...data);
            } else {
                transcripts.push(data);
            }
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            // Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            // Check if this is a conversation format (single column with M:/R: prefixes)
            const firstRow = data[0];
            const firstKey = Object.keys(firstRow)[0];
            const firstValue = firstRow[firstKey];
            
            if (firstValue && typeof firstValue === 'string' && (firstValue.startsWith('M:') || firstValue.startsWith('R:'))) {
                // This is a conversation format - extract all text
                const conversationText = data.map(row => {
                    const key = Object.keys(row)[0];
                    return row[key];
                }).join('\n');
                
                // Extract participant name from filename or use default
                const fileName = path.basename(filePath, path.extname(filePath));
                const participantName = fileName.replace(/^\d+-?transcript-?/i, '').replace(/[_-]/g, ' ').trim() || 'Transcript Participant';
                
                transcripts.push({
                    name: participantName,
                    raw_text: conversationText,
                    demographics: {}
                });
            } else {
                // Standard format - look for transcript columns
                for (const row of data) {
                    if (row.transcript || row.text || row.content) {
                        transcripts.push({
                            name: row.name || row.participant || row.user || 'Unknown',
                            raw_text: row.transcript || row.text || row.content,
                            demographics: {
                                age: row.age || null,
                                gender: row.gender || null,
                                role_title: row.role || row.title || row.position || null,
                                company: row.company || row.organization || null,
                                location: row.location || row.city || null,
                                education: row.education || null,
                                income_range: row.income || null
                            }
                        });
                    }
                }
            }
        } else if (mimeType === 'text/csv' || mimeType === 'application/octet-stream') {
            // CSV file - use XLSX to parse CSV properly
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            // Check if this is a conversation format (single column with M:/R: prefixes)
            const firstRow = data[0];
            const firstKey = Object.keys(firstRow)[0];
            const firstValue = firstRow[firstKey];
            
            if (firstValue && typeof firstValue === 'string' && (firstValue.startsWith('M:') || firstValue.startsWith('R:'))) {
                // This is a conversation format - extract all text
                const conversationText = data.map(row => {
                    const key = Object.keys(row)[0];
                    return row[key];
                }).join('\n');
                
                // Extract participant name from filename or use default
                const fileName = path.basename(filePath, path.extname(filePath));
                const participantName = fileName.replace(/^\d+-?transcript-?/i, '').replace(/[_-]/g, ' ').trim() || 'Transcript Participant';
                
                transcripts.push({
                    name: participantName,
                    raw_text: conversationText,
                    demographics: {}
                });
            } else {
                // Standard format - look for transcript columns
                for (const row of data) {
                    if (row.transcript || row.text || row.content) {
                        transcripts.push({
                            name: row.name || row.participant || row.user || 'Unknown',
                            raw_text: row.transcript || row.text || row.content,
                            demographics: {
                                age: row.age ? parseInt(row.age) : null,
                                gender: row.gender || null,
                                role_title: row.role || row.title || row.position || null,
                                company: row.company || row.organization || null,
                                location: row.location || row.city || null,
                                education: row.education || null,
                                income_range: row.income || null
                            }
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw new Error('Failed to parse transcript file: ' + error.message);
    }

    return transcripts;
}

/**
 * Create persona from transcript using the v5 agents API
 */
async function createPersonaFromTranscript(transcript) {
    try {
        console.log('Starting two-stage agent creation pipeline...');
        
        // Stage 1: Analyze transcript for behavioral signals
        console.log('Stage 1: Extracting behavioral DNA...');
        const analysis = await providerGateway.analyzeTranscript(transcript, transcript.demographics);
        console.log('Behavioral analysis completed');

        // Stage 2: Synthesize persona and master system prompt
        console.log('Stage 2: Synthesizing persona...');
        const synthesisResult = await providerGateway.synthesizePersona(analysis, transcript.demographics);
        console.log('Persona synthesis completed');

        // Parse synthesis result
        let personaData, masterSystemPrompt;
        try {
            const parsed = JSON.parse(synthesisResult);
            personaData = parsed.persona;
            masterSystemPrompt = parsed.master_system_prompt;
        } catch (e) {
            // Fallback if synthesis doesn't return JSON
            personaData = {
                name: transcript.name || 'Generated Persona',
                role_title: transcript.demographics.role_title || 'Professional',
                company: transcript.demographics.company || 'Unknown',
                location: transcript.demographics.location || 'Unknown',
                demographics: transcript.demographics,
                ...analysis
            };
            masterSystemPrompt = promptBuilder.buildMasterPrompt(personaData);
        }

        // Generate avatar URL
        const avatarUrl = promptBuilder.generateAvatarUrl(personaData);

        // Save to database
        const agentId = await saveAgent({
            ...personaData,
            master_system_prompt: masterSystemPrompt,
            avatar_url: avatarUrl,
            status: 'active'
        });

        console.log(`Agent created successfully: ${agentId}`);
        return agentId;

    } catch (error) {
        console.error('Error creating persona:', error);
        throw error;
    }
}

/**
 * Save agent to database (same as agents_v5.js)
 */
async function saveAgent(personaData) {
    try {
        const query = `
            INSERT INTO ai_agents (
                name, occupation, employment_type, location, demographics, traits, behaviors,
                objectives, needs, fears, apprehensions, motivations, frustrations,
                domain_literacy, tech_savviness, communication_style, speech_patterns,
                vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                quote, master_system_prompt, is_active, source_meta, avatar_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
            ) RETURNING id
        `;

        const values = [
            personaData.name,
            personaData.occupation || personaData.role_title || 'AI Persona',
            personaData.employment_type || 'full-time',
            personaData.location || 'Unknown',
            JSON.stringify(personaData.demographics || {}),
            JSON.stringify(personaData.traits || {}),
            JSON.stringify(personaData.behaviors || {}),
            personaData.objectives || [],
            personaData.needs || [],
            personaData.fears || [],
            personaData.apprehensions || [],
            personaData.motivations || [],
            personaData.frustrations || [],
            JSON.stringify(personaData.domain_literacy || {}),
            personaData.tech_savviness || 'medium',
            JSON.stringify(personaData.communication_style || {}),
            JSON.stringify(personaData.speech_patterns || {}),
            JSON.stringify(personaData.vocabulary_profile || {}),
            JSON.stringify(personaData.emotional_profile || {}),
            JSON.stringify(personaData.cognitive_profile || {}),
            JSON.stringify(personaData.knowledge_bounds || {}),
            personaData.quote || '',
            personaData.master_system_prompt || '',
            personaData.is_active !== false, // Default to true
            JSON.stringify(personaData.source_meta || {}),
            personaData.avatar_url || ''
        ];

        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Database save failed:', error);
        throw new Error('Failed to save agent to database: ' + error.message);
    }
}

module.exports = router;
