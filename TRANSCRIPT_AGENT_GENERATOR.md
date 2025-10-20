# Transcript-Based AI Agent Generator

A comprehensive system for generating realistic AI agents from transcript files using advanced AI analysis and persona extraction.

## 🚀 Features

### Core Functionality
- **Multi-format Support**: TXT, PDF, DOC, DOCX, CSV, JSON files
- **Batch Processing**: Process multiple transcripts simultaneously
- **Real-time Progress**: Live updates during generation process
- **Agent Preview**: Review generated agents before saving
- **Comprehensive Profiles**: 51 UXPressia fields for detailed personas

### AI-Powered Analysis
- **Persona Extraction**: Automatically identify unique individuals from transcripts
- **Behavioral Patterns**: Generate realistic communication and decision-making patterns
- **Conversation Examples**: Create authentic dialogue samples
- **Psychographic Profiling**: Detailed personality and value analysis
- **Technical Assessment**: Evaluate tech proficiency and domain expertise

### Error Handling & Validation
- **File Validation**: Size, type, and content validation
- **Retry Logic**: Automatic retry for transient failures
- **Comprehensive Error Messages**: Detailed error reporting
- **Graceful Degradation**: Continue processing when some files fail

## 📁 File Structure

```
frontend/src/
├── pages/
│   └── AdvancedAgentGeneration.jsx          # Main generation page
├── components/
│   ├── AdvancedTranscriptUpload.jsx         # File upload component
│   ├── AdvancedGenerationStatus.jsx         # Progress tracking modal
│   └── AgentPreviewModal.jsx                # Agent preview and selection

backend/
├── services/
│   └── advancedAgentGenerator.js            # Core generation service
├── routes/
│   └── advancedAgentGeneration.js           # API endpoints
├── utils/
│   └── generationErrorHandler.js            # Error handling utilities
└── scripts/
    └── test-agent-generation.js             # Test suite
```

## 🔧 API Endpoints

### POST `/api/advanced-agents/generate`
Generate AI agents from transcript files.

**Request:**
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('context', JSON.stringify({
  source: 'transcript_upload',
  timestamp: new Date().toISOString()
}));
formData.append('language', 'en');
formData.append('options', JSON.stringify({
  generate_avatars: true,
  include_conversation_examples: true,
  detailed_psychographics: true
}));
```

**Response:**
```javascript
{
  "success": true,
  "summary": {
    "totalAgents": 5,
    "successfulFiles": 2,
    "failedFiles": 0,
    "totalFiles": 2
  },
  "results": [
    {
      "fileName": "interview-1.txt",
      "agents": [...],
      "metadata": {...}
    }
  ]
}
```

### POST `/api/advanced-agents/preview`
Preview agents that would be generated without full processing.

### POST `/api/advanced-agents/save`
Save generated agents to the database.

### GET `/api/advanced-agents/status/:jobId`
Get status of a generation job (for async processing).

## 🎯 Usage

### 1. Upload Transcripts
```javascript
// Navigate to /generate page
// Upload transcript files using drag & drop or file picker
// Files are automatically validated and processed
```

### 2. Generate Agents
```javascript
// Click "Generate AI Agents" button
// Watch real-time progress in the status modal
// Review generated agents in preview modal
```

### 3. Save Agents
```javascript
// Select agents to save
// Click "Save X Agents" button
// Agents are saved to database and available in the system
```

## 🧪 Testing

### Run Test Suite
```bash
cd backend
node scripts/test-agent-generation.js
```

### Test Features
- File upload and validation
- Agent generation from sample transcripts
- Error handling for invalid files
- Preview functionality
- Complete generation workflow

## 🔍 Generated Agent Structure

Each generated agent includes:

### Basic Information
- Name, age, gender, occupation, location
- Avatar URL and visual characteristics
- Contact information

### Skills & Proficiency
- Technical savviness level
- Domain literacy assessment
- English proficiency rating
- Communication style

### Personality & Behavior
- Personality traits and values
- Behavioral patterns and preferences
- Decision-making style
- Learning preferences

### Background & Context
- Professional background
- Education and experience
- Interests and motivations
- Goals and pain points

### Conversation Data
- Key quotes from transcripts
- Conversation examples
- Main concerns and interests
- Source file information

### UXPressia Fields (51 comprehensive fields)
- Demographics (age, gender, location, education, income, family)
- Psychographics (personality, values, lifestyle, interests, attitudes)
- Behavior (communication, decision-making, problem-solving, learning)
- Technology (device usage, platform preferences, comfort level)
- Context (environment, time constraints, goals, pain points)

## 🛠️ Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:9001
FRONTEND_URL=http://localhost:9000
```

### File Limits
- Maximum file size: 10MB
- Maximum files per request: 10
- Supported formats: TXT, PDF, DOC, DOCX, CSV, JSON

### Generation Options
```javascript
{
  generate_avatars: true,           // Generate avatar URLs
  include_conversation_examples: true, // Create dialogue samples
  detailed_psychographics: true,    // Full personality analysis
  language: 'en',                   // Processing language
  context: {...}                    // Additional context
}
```

## 🚨 Error Handling

### File Errors
- Invalid file type
- File too large
- Too many files
- File access denied

### API Errors
- OpenAI quota exceeded
- Rate limit exceeded
- Invalid API key
- Context too long

### Generation Errors
- Validation errors
- Timeout errors
- Memory errors
- Network errors

### Database Errors
- Connection failures
- Constraint violations
- Timeout errors

## 📊 Performance

### Processing Times
- Small files (< 1MB): 10-30 seconds
- Medium files (1-5MB): 30-90 seconds
- Large files (5-10MB): 90-300 seconds

### Retry Logic
- File reading: 3 retries with 1s delay
- Agent generation: 2 retries with 2s delay
- API calls: 3 retries with exponential backoff

## 🔒 Security

### File Validation
- MIME type checking
- File size limits
- Filename sanitization
- Content validation

### API Security
- JWT authentication required
- Rate limiting
- Input validation
- Error message sanitization

## 🎨 UI Components

### AdvancedTranscriptUpload
- Drag & drop file upload
- File validation and preview
- Progress tracking
- Batch processing

### AdvancedGenerationStatus
- Real-time progress updates
- Step-by-step status
- Generation logs
- Error reporting

### AgentPreviewModal
- Agent grid display
- Detailed agent information
- Selection interface
- Save confirmation

## 🚀 Future Enhancements

### Planned Features
- Async job processing with queues
- Real-time WebSocket updates
- Advanced file format support (video, audio)
- Custom persona templates
- Bulk agent management
- Integration with external APIs

### Performance Improvements
- Caching for repeated requests
- Parallel processing optimization
- Database query optimization
- CDN integration for avatars

## 📝 License

This project is part of the Avinci AI Agent Platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the test suite
- Contact the development team
