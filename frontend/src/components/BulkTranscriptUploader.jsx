import React, { useState, useRef } from 'react';
import { 
    CloudArrowUpIcon, 
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import api from '../utils/api';
import ExcelDebugger from './ExcelDebugger';

const BulkTranscriptUploader = ({ onAgentsCreated }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState({});
    const [demographics, setDemographics] = useState({
        age: '',
        gender: '',
        occupation: '',
        location: ''
    });
    const [showDebugger, setShowDebugger] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            file.type === 'text/plain' || 
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'text/csv' ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.xlsx')
        );

        const newFiles = validFiles.map(file => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            status: 'pending',
            agentId: null,
            error: null
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({
                content: e.target.result,
                type: file.type,
                name: file.name
            });
            reader.onerror = reject;
            
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                reader.readAsText(file);
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    };

    const parseExcelFile = (arrayBuffer, fileName) => {
        try {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const transcripts = [];

            console.log('Excel file parsed:', {
                sheetNames: workbook.SheetNames,
                fileName: fileName
            });

            // Check if there are multiple sheets
            const sheetNames = workbook.SheetNames;
            
            if (sheetNames.length > 1) {
                // Multiple sheets - each sheet is a transcript
                sheetNames.forEach((sheetName, index) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    console.log(`Processing sheet ${sheetName}:`, {
                        rowCount: jsonData.length,
                        firstFewRows: jsonData.slice(0, 3)
                    });
                    
                    const transcriptData = parseSheetData(jsonData, `${fileName} - ${sheetName}`);
                    if (transcriptData) {
                        console.log(`Successfully parsed sheet ${sheetName}:`, transcriptData.metadata);
                        transcripts.push(transcriptData);
                    } else {
                        console.log(`Failed to parse sheet ${sheetName} - no valid data found`);
                    }
                });
            } else {
                // Single sheet - check if it has multiple transcripts
                const worksheet = workbook.Sheets[sheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                console.log('Processing single sheet:', {
                    rowCount: jsonData.length,
                    firstFewRows: jsonData.slice(0, 5)
                });
                
                // Check if data has multiple transcript sections
                const transcriptSections = findTranscriptSections(jsonData);
                
                console.log('Found transcript sections:', transcriptSections.length);
                
                if (transcriptSections.length > 1) {
                    // Multiple transcripts in one sheet
                    transcriptSections.forEach((section, index) => {
                        const transcriptData = parseSheetData(section, `${fileName} - Transcript ${index + 1}`);
                        if (transcriptData) {
                            console.log(`Successfully parsed section ${index + 1}:`, transcriptData.metadata);
                            transcripts.push(transcriptData);
                        } else {
                            console.log(`Failed to parse section ${index + 1} - no valid data found`);
                        }
                    });
                } else {
                    // Single transcript
                    const transcriptData = parseSheetData(jsonData, fileName);
                    if (transcriptData) {
                        console.log('Successfully parsed single transcript:', transcriptData.metadata);
                        transcripts.push(transcriptData);
                    } else {
                        console.log('Failed to parse single transcript - no valid data found');
                        console.log('Raw data sample:', jsonData.slice(0, 10));
                    }
                }
            }

            console.log(`Total transcripts found: ${transcripts.length}`);
            return transcripts;
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
    };

    const findTranscriptSections = (data) => {
        // Look for patterns that indicate multiple transcripts
        // This could be empty rows, specific headers, or other patterns
        const sections = [];
        let currentSection = [];
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            // Check if this row indicates a new transcript
            if (isNewTranscriptIndicator(row)) {
                if (currentSection.length > 0) {
                    sections.push(currentSection);
                    currentSection = [];
                }
            }
            
            if (row && row.some(cell => cell && cell.toString().trim())) {
                currentSection.push(row);
            }
        }
        
        if (currentSection.length > 0) {
            sections.push(currentSection);
        }
        
        return sections.length > 0 ? sections : [data]; // Fallback to single transcript
    };

    const isNewTranscriptIndicator = (row) => {
        if (!row || row.length === 0) return false;
        
        const firstCell = row[0] ? row[0].toString().toLowerCase().trim() : '';
        
        // Look for indicators like "Transcript", "Interview", "Session", etc.
        const indicators = ['transcript', 'interview', 'session', 'participant', 'user'];
        return indicators.some(indicator => firstCell.includes(indicator));
    };

    const parseSheetData = (data, transcriptName) => {
        console.log(`Parsing sheet data for ${transcriptName}:`, {
            totalRows: data.length,
            firstFewRows: data.slice(0, 3)
        });

        if (!data || data.length === 0) {
            console.log('No data found in sheet');
            return null;
        }
        
        // Clean the data - remove completely empty rows
        const cleanedData = data.filter(row => 
            row && row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '')
        );
        
        console.log(`Cleaned data rows: ${cleanedData.length}`);
        
        if (cleanedData.length === 0) {
            console.log('No valid data after cleaning');
            return null;
        }
        
        // Try different parsing strategies
        let speakerTurns = [];
        let isModeratorRespondentFormat = false;
        
        // Strategy 1: Check for M:/R: format in first column
        const firstColumnMROrder = cleanedData.some(row => {
            const firstCell = row[0] ? row[0].toString().trim() : '';
            return firstCell.startsWith('M:') || firstCell.startsWith('R:');
        });
        
        if (firstColumnMROrder) {
            console.log('Detected M:/R: format in first column');
            isModeratorRespondentFormat = true;
            speakerTurns = cleanedData.map((row, index) => {
                const firstCell = row[0] ? row[0].toString().trim() : '';
                let speaker, content;
                
                if (firstCell.startsWith('M:')) {
                    speaker = 'Moderator';
                    content = firstCell.substring(2).trim();
                } else if (firstCell.startsWith('R:')) {
                    speaker = 'Respondent';
                    content = firstCell.substring(2).trim();
                } else {
                    // If line doesn't start with M: or R:, assume it's a continuation
                    speaker = speakerTurns.length > 0 ? speakerTurns[speakerTurns.length - 1].speaker : 'Unknown';
                    content = firstCell;
                }
                
                return {
                    speaker,
                    content,
                    timestamp: index * 1000
                };
            }).filter(turn => turn.content && turn.content.length > 0);
        } else {
            // Strategy 2: Look for M:/R: format in any column
            const anyColumnMROrder = cleanedData.some(row => 
                row.some(cell => {
                    const cellStr = cell ? cell.toString().trim() : '';
                    return cellStr.startsWith('M:') || cellStr.startsWith('R:');
                })
            );
            
            if (anyColumnMROrder) {
                console.log('Detected M:/R: format in any column');
                isModeratorRespondentFormat = true;
                speakerTurns = cleanedData.map((row, index) => {
                    // Find the cell that starts with M: or R:
                    let speaker = 'Unknown';
                    let content = '';
                    
                    for (let i = 0; i < row.length; i++) {
                        const cellStr = row[i] ? row[i].toString().trim() : '';
                        if (cellStr.startsWith('M:')) {
                            speaker = 'Moderator';
                            content = cellStr.substring(2).trim();
                            break;
                        } else if (cellStr.startsWith('R:')) {
                            speaker = 'Respondent';
                            content = cellStr.substring(2).trim();
                            break;
                        }
                    }
                    
                    // If no M:/R: found, use the first non-empty cell
                    if (!content && row[0]) {
                        content = row[0].toString().trim();
                        speaker = speakerTurns.length > 0 ? speakerTurns[speakerTurns.length - 1].speaker : 'Unknown';
                    }
                    
                    return {
                        speaker,
                        content,
                        timestamp: index * 1000
                    };
                }).filter(turn => turn.content && turn.content.length > 0);
            } else {
                // Strategy 3: Standard column-based parsing
                console.log('Using standard column-based parsing');
                
                // Find the header row (usually first non-empty row)
                let headerRowIndex = 0;
                for (let i = 0; i < cleanedData.length; i++) {
                    if (cleanedData[i] && cleanedData[i].some(cell => cell && cell.toString().trim())) {
                        headerRowIndex = i;
                        break;
                    }
                }
                
                const headers = cleanedData[headerRowIndex] || [];
                const contentRows = cleanedData.slice(headerRowIndex + 1);
                
                console.log('Headers found:', headers);
                console.log('Content rows:', contentRows.length);
                
                const speakerIndex = findColumnIndex(headers, ['speaker', 'participant', 'user', 'person']);
                const contentIndex = findColumnIndex(headers, ['content', 'text', 'message', 'response']);
                const timestampIndex = findColumnIndex(headers, ['timestamp', 'time', 'duration']);
                
                console.log('Column indices:', { speakerIndex, contentIndex, timestampIndex });
                
                speakerTurns = contentRows.map((row, index) => ({
                    speaker: speakerIndex >= 0 && row[speakerIndex] ? row[speakerIndex].toString().trim() : `Speaker_${index + 1}`,
                    content: contentIndex >= 0 && row[contentIndex] ? row[contentIndex].toString().trim() : 
                            (row[0] ? row[0].toString().trim() : ''),
                    timestamp: timestampIndex >= 0 && row[timestampIndex] ? 
                             (typeof row[timestampIndex] === 'number' ? row[timestampIndex] : index * 1000) : 
                             index * 1000
                })).filter(turn => turn.content && turn.content.length > 0);
                
                // If no speaker turns found with column mapping, try fallback
                if (speakerTurns.length === 0) {
                    console.log('No speaker turns found with column mapping, trying fallback...');
                    speakerTurns = cleanedData.map((row, index) => {
                        // Use the first non-empty cell as content
                        const content = row.find(cell => cell && cell.toString().trim())?.toString().trim() || '';
                        return {
                            speaker: `Speaker_${index + 1}`,
                            content,
                            timestamp: index * 1000
                        };
                    }).filter(turn => turn.content && turn.content.length > 0);
                }
            }
        }
        
        console.log(`Parsed ${speakerTurns.length} speaker turns:`, speakerTurns.slice(0, 3));
        
        if (speakerTurns.length === 0) {
            console.log('No valid speaker turns found');
            return null;
        }
        
        // Create raw text from speaker turns
        const rawText = speakerTurns.map(turn => `${turn.speaker}: ${turn.content}`).join('\n');
        
        const result = {
            raw_text: rawText,
            speaker_turns: speakerTurns,
            metadata: {
                filename: transcriptName,
                total_turns: speakerTurns.length,
                estimated_duration: speakerTurns.length * 3,
                format: isModeratorRespondentFormat ? 'moderator_respondent' : 'standard',
                speakers: [...new Set(speakerTurns.map(turn => turn.speaker))]
            }
        };
        
        console.log('Successfully parsed transcript:', result.metadata);
        return result;
    };

    const findColumnIndex = (headers, possibleNames) => {
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i] ? headers[i].toString().toLowerCase().trim() : '';
            if (possibleNames.some(name => header.includes(name))) {
                return i;
            }
        }
        return -1;
    };

    // Helper functions for enhanced personality analysis
    const extractEmotionalIndicators = (content) => {
        const emotions = {
            positive: ['love', 'great', 'awesome', 'amazing', 'excellent', 'wonderful', 'fantastic', 'happy', 'excited'],
            negative: ['hate', 'terrible', 'awful', 'horrible', 'frustrated', 'angry', 'annoyed', 'disappointed', 'confused'],
            uncertainty: ['maybe', 'perhaps', 'might', 'could', 'not sure', 'think so', 'probably', 'possibly'],
            hesitation: ['um', 'uh', 'like', 'you know', 'well', 'so', 'actually', 'basically']
        };
        
        const found = [];
        Object.keys(emotions).forEach(emotion => {
            if (emotions[emotion].some(word => content.toLowerCase().includes(word))) {
                found.push(emotion);
            }
        });
        
        return found;
    };

    const analyzeLanguageStyle = (turns) => {
        const allContent = turns.map(turn => turn.content).join(' ');
        const words = allContent.split(/\s+/).filter(word => word.length > 0);
        
        return {
            average_sentence_length: words.length / turns.length,
            formality_level: calculateFormalityLevel(allContent),
            question_frequency: turns.filter(turn => turn.content.includes('?')).length / turns.length,
            hesitation_frequency: turns.filter(turn => 
                turn.content.toLowerCase().includes('um') || 
                turn.content.toLowerCase().includes('uh') ||
                turn.content.toLowerCase().includes('like')
            ).length / turns.length,
            common_phrases: extractCommonPhrases(turns),
            vocabulary_complexity: calculateVocabularyComplexity(words)
        };
    };

    const calculateFormalityLevel = (content) => {
        const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'nevertheless'];
        const informalWords = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'okay'];
        
        const formalCount = formalWords.filter(word => content.toLowerCase().includes(word)).length;
        const informalCount = informalWords.filter(word => content.toLowerCase().includes(word)).length;
        
        return informalCount > formalCount ? 'informal' : formalCount > informalCount ? 'formal' : 'neutral';
    };

    const extractCommonPhrases = (turns) => {
        const phrases = {};
        turns.forEach(turn => {
            const words = turn.content.toLowerCase().split(/\s+/);
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = `${words[i]} ${words[i + 1]}`;
                phrases[phrase] = (phrases[phrase] || 0) + 1;
            }
        });
        
        return Object.entries(phrases)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([phrase, count]) => ({ phrase, count }));
    };

    const calculateVocabularyComplexity = (words) => {
        const uniqueWords = new Set(words.map(word => word.toLowerCase()));
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        
        return {
            unique_word_ratio: uniqueWords.size / words.length,
            average_word_length: avgWordLength,
            vocabulary_size: uniqueWords.size
        };
    };

    const extractKeyTopics = (turns) => {
        const allContent = turns.map(turn => turn.content).join(' ').toLowerCase();
        const topics = {
            technology: ['app', 'software', 'website', 'digital', 'online', 'computer', 'phone', 'device'],
            work: ['job', 'work', 'career', 'office', 'company', 'business', 'professional'],
            personal: ['family', 'home', 'personal', 'life', 'myself', 'feel', 'think'],
            problems: ['problem', 'issue', 'difficult', 'hard', 'struggle', 'confused', 'don\'t understand'],
            preferences: ['like', 'prefer', 'love', 'hate', 'enjoy', 'dislike', 'favorite']
        };
        
        const foundTopics = [];
        Object.keys(topics).forEach(topic => {
            const count = topics[topic].filter(word => allContent.includes(word)).length;
            if (count > 0) {
                foundTopics.push({ topic, mentions: count });
            }
        });
        
        return foundTopics.sort((a, b) => b.mentions - a.mentions);
    };

    const parseTextFile = (content, fileName) => {
        console.log(`Parsing text file ${fileName}:`, {
            contentLength: content.length,
            firstFewLines: content.split('\n').slice(0, 5)
        });

        const lines = content.split('\n').filter(line => line.trim());
        
        // Check for various moderator/respondent formats
        const isModeratorRespondentFormat = lines.some(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('M:') || trimmed.startsWith('R:') ||
                   trimmed.startsWith('Moderator:') || trimmed.startsWith('Respondent:') ||
                   trimmed.startsWith('Interviewer:') || trimmed.startsWith('Participant:') ||
                   trimmed.startsWith('Q:') || trimmed.startsWith('A:');
        });
        
        let speakerTurns = [];
        
        if (isModeratorRespondentFormat) {
            console.log('Detected moderator/respondent format in text file');
            
            // Parse various moderator/respondent formats
            speakerTurns = lines.map((line, index) => {
                const trimmedLine = line.trim();
                let speaker, content;
                
                if (trimmedLine.startsWith('M:') || trimmedLine.startsWith('Moderator:')) {
                    speaker = 'Moderator';
                    content = trimmedLine.replace(/^(M:|Moderator:)\s*/, '').trim();
                } else if (trimmedLine.startsWith('R:') || trimmedLine.startsWith('Respondent:') || trimmedLine.startsWith('Participant:')) {
                    speaker = 'Respondent';
                    content = trimmedLine.replace(/^(R:|Respondent:|Participant:)\s*/, '').trim();
                } else if (trimmedLine.startsWith('Q:') || trimmedLine.startsWith('Interviewer:')) {
                    speaker = 'Moderator';
                    content = trimmedLine.replace(/^(Q:|Interviewer:)\s*/, '').trim();
                } else if (trimmedLine.startsWith('A:')) {
                    speaker = 'Respondent';
                    content = trimmedLine.replace(/^A:\s*/, '').trim();
                } else {
                    // If line doesn't start with a speaker prefix, assume it's a continuation
                    speaker = speakerTurns.length > 0 ? speakerTurns[speakerTurns.length - 1].speaker : 'Unknown';
                    content = trimmedLine;
                }
                
                return {
                    speaker,
                    content,
                    timestamp: index * 1000
                };
            }).filter(turn => turn.content && turn.content.length > 0);
        } else {
            // Default parsing for other formats
            console.log('Using standard text parsing');
            speakerTurns = lines.map((line, index) => ({
                speaker: `Speaker_${index + 1}`,
                content: line.trim(),
                timestamp: index * 1000
            })).filter(turn => turn.content && turn.content.length > 0);
        }
        
        console.log(`Parsed ${speakerTurns.length} speaker turns from text file`);
        
        const transcriptData = {
            raw_text: content,
            speaker_turns: speakerTurns,
            metadata: {
                filename: fileName,
                total_turns: speakerTurns.length,
                estimated_duration: speakerTurns.length * 2,
                format: isModeratorRespondentFormat ? 'moderator_respondent' : 'standard',
                speakers: [...new Set(speakerTurns.map(turn => turn.speaker))]
            }
        };

        return [transcriptData];
    };

    const processFile = async (fileData) => {
        try {
            setProcessingStatus(prev => ({
                ...prev,
                [fileData.id]: { status: 'processing', message: 'Reading file...' }
            }));

            const fileContent = await readFileContent(fileData.file);
            let transcripts = [];

            // Parse based on file type
            if (fileContent.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                fileData.file.name.endsWith('.xlsx')) {
                transcripts = parseExcelFile(fileContent.content, fileData.name);
            } else {
                transcripts = parseTextFile(fileContent.content, fileData.name);
            }

            if (transcripts.length === 0) {
                throw new Error('No valid transcripts found in file');
            }

            setProcessingStatus(prev => ({
                ...prev,
                [fileData.id]: { 
                    status: 'processing', 
                    message: `Found ${transcripts.length} transcript(s). Creating agents...` 
                }
            }));

            const createdAgents = [];
            const errors = [];

            // Process each transcript
            for (let i = 0; i < transcripts.length; i++) {
                try {
                    setProcessingStatus(prev => ({
                        ...prev,
                        [fileData.id]: { 
                            status: 'processing', 
                            message: `Creating agent ${i + 1}/${transcripts.length}...` 
                        }
                    }));

                    // For moderator/respondent format, focus on respondent data
                    let transcriptForAgent = transcripts[i];
                    if (transcripts[i].metadata.format === 'moderator_respondent') {
                        // Filter to only include respondent turns for agent creation
                        const respondentTurns = transcripts[i].speaker_turns.filter(turn => turn.speaker === 'Respondent');
                        
                        // Create enhanced transcript data for better agent replication
                        const enhancedTranscript = {
                            ...transcripts[i],
                            speaker_turns: respondentTurns,
                            raw_text: respondentTurns.map(turn => turn.content).join('\n'),
                            // Add conversation context for better personality capture
                            conversation_context: {
                                total_turns: respondentTurns.length,
                                response_patterns: respondentTurns.map(turn => ({
                                    content: turn.content,
                                    length: turn.content.length,
                                    word_count: turn.content.split(' ').length,
                                    has_questions: turn.content.includes('?'),
                                    has_hesitation: turn.content.includes('um') || turn.content.includes('uh') || turn.content.includes('like'),
                                    emotional_indicators: extractEmotionalIndicators(turn.content)
                                })),
                                language_style: analyzeLanguageStyle(respondentTurns),
                                key_topics: extractKeyTopics(respondentTurns)
                            }
                        };
                        
                        transcriptForAgent = enhancedTranscript;
                    }

                    // For each transcript, create a separate file and upload
                    for (let i = 0; i < transcripts.length; i++) {
                        const transcript = transcripts[i];
                        
                        // Create a temporary file for this transcript
                        const transcriptData = {
                            name: transcript.name || `Agent ${i + 1}`,
                            age: transcript.demographics?.age || null,
                            gender: transcript.demographics?.gender || null,
                            role: transcript.demographics?.role_title || null,
                            company: transcript.demographics?.company || null,
                            location: transcript.demographics?.location || null,
                            transcript: transcript.raw_text || transcript.text || transcript.content
                        };
                        
                        // Convert to CSV format
                        const csvContent = `name,age,gender,role,company,location,transcript\n"${transcriptData.name}",${transcriptData.age || ''},"${transcriptData.gender || ''}","${transcriptData.role || ''}","${transcriptData.company || ''}","${transcriptData.location || ''}","${transcriptData.transcript}"`;
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const file = new File([blob], `transcript_${i + 1}.csv`, { type: 'text/csv' });
                        
                        const formData = new FormData();
                        formData.append('transcript', file);
                        
                        const response = await api.post('/transcript-upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        // Handle the new response format
                        if (response.data.results && response.data.results.length > 0) {
                            response.data.results.forEach(result => {
                                createdAgents.push({
                                    id: result.agentId,
                                    name: result.name,
                                    transcriptName: fileData.name
                                });
                            });
                        }
                    }

                    // Small delay between agent creations
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (error) {
                    console.error(`Error creating agent ${i + 1} from ${fileData.name}:`, error);
                    errors.push(`Agent ${i + 1}: ${error.message}`);
                }
            }

            if (createdAgents.length === 0) {
                throw new Error(`Failed to create any agents: ${errors.join(', ')}`);
            }

            const statusMessage = createdAgents.length === transcripts.length 
                ? `Successfully created ${createdAgents.length} agent(s)!`
                : `Created ${createdAgents.length}/${transcripts.length} agents. ${errors.length} failed.`;

            setProcessingStatus(prev => ({
                ...prev,
                [fileData.id]: { status: 'completed', message: statusMessage }
            }));

            return {
                ...fileData,
                status: 'completed',
                agentCount: createdAgents.length,
                agents: createdAgents,
                errors: errors.length > 0 ? errors : null
            };

        } catch (error) {
            console.error(`Error processing ${fileData.name}:`, error);
            setProcessingStatus(prev => ({
                ...prev,
                [fileData.id]: { status: 'error', message: error.message }
            }));

            return {
                ...fileData,
                status: 'error',
                error: error.message
            };
        }
    };

    const processAllFiles = async () => {
        if (uploadedFiles.length === 0) return;

        setIsProcessing(true);
        const results = [];

        // Process files one by one to avoid overwhelming the API
        for (const fileData of uploadedFiles) {
            if (fileData.status === 'pending') {
                const result = await processFile(fileData);
                results.push(result);
                
                // Update the file in the list
                setUploadedFiles(prev => 
                    prev.map(f => f.id === fileData.id ? result : f)
                );

                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setIsProcessing(false);
        
        // Notify parent component
        const successfulFiles = results.filter(r => r.status === 'completed');
        const allCreatedAgents = successfulFiles.flatMap(file => file.agents || []);
        
        if (onAgentsCreated && allCreatedAgents.length > 0) {
            onAgentsCreated(allCreatedAgents);
        }
    };

    const getStatusIcon = (fileId) => {
        const status = processingStatus[fileId]?.status || 'pending';
        
        switch (status) {
            case 'processing':
                return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
            case 'completed':
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
            default:
                return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
        }
    };

    const getStatusMessage = (fileId) => {
        return processingStatus[fileId]?.message || 'Ready to process';
    };

    const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
    const errorCount = uploadedFiles.filter(f => f.status === 'error').length;
    const pendingCount = uploadedFiles.filter(f => f.status === 'pending').length;
    const totalAgentsCreated = uploadedFiles
        .filter(f => f.status === 'completed')
        .reduce((sum, f) => sum + (f.agentCount || 0), 0);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Transcript Upload</h3>
                    <button
                        onClick={() => setShowDebugger(!showDebugger)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showDebugger ? 'Hide' : 'Show'} Excel Debugger
                    </button>
                </div>
                <p className="text-sm text-gray-600">
                    Upload multiple transcript files to create agents automatically. 
                    Supports .txt, .csv, and .xlsx files.
                </p>
            </div>

            {showDebugger && (
                <div className="mb-6">
                    <ExcelDebugger />
                </div>
            )}

            {/* Demographics Template */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Default Demographics (applied to all agents)</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                        <input
                            type="number"
                            value={demographics.age}
                            onChange={(e) => setDemographics({...demographics, age: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="30"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                        <select
                            value={demographics.gender}
                            onChange={(e) => setDemographics({...demographics, gender: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Select gender</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Occupation</label>
                        <input
                            type="text"
                            value={demographics.occupation}
                            onChange={(e) => setDemographics({...demographics, occupation: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Software Engineer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            value={demographics.location}
                            onChange={(e) => setDemographics({...demographics, location: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="San Francisco, CA"
                        />
                    </div>
                </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Transcript Files</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Click to select files or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        Supports .txt, .csv, .xlsx files
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900">
                            Files ({uploadedFiles.length})
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span className="flex items-center space-x-1">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <span>{completedCount} files completed</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <SparklesIcon className="w-4 h-4 text-blue-500" />
                                <span>{totalAgentsCreated} agents created</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                <span>{errorCount} errors</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                <span>{pendingCount} pending</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uploadedFiles.map((fileData) => (
                            <div
                                key={fileData.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(fileData.id)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {fileData.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {getStatusMessage(fileData.id)}
                                        </p>
                                        {fileData.agentCount > 0 && (
                                            <div className="text-xs text-green-600">
                                                <p>Created {fileData.agentCount} agent(s):</p>
                                                {fileData.agents && fileData.agents.map((agent, index) => (
                                                    <p key={index} className="ml-2">• {agent.name}</p>
                                                ))}
                                            </div>
                                        )}
                                        {fileData.errors && fileData.errors.length > 0 && (
                                            <div className="text-xs text-red-600">
                                                <p>Errors:</p>
                                                {fileData.errors.map((error, index) => (
                                                    <p key={index} className="ml-2">• {error}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(fileData.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Process Button */}
            {uploadedFiles.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {isProcessing ? 'Processing files...' : 'Ready to process'}
                    </div>
                    <button
                        onClick={processAllFiles}
                        disabled={isProcessing || pendingCount === 0}
                        className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#144835' }}
                        onMouseOver={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0f3a2a')}
                        onMouseOut={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#144835')}
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                <span>Process {pendingCount} Files</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkTranscriptUploader;
