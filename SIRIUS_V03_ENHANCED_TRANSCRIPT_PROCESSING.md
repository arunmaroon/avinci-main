# Sirius v0.3: Enhanced Transcript Processing & AI Persona Generation

## 🚀 Overview

Sirius v0.3 introduces a comprehensive transcript scraping and AI agent persona generation system that can extract rich, detailed personas from user research transcripts. The system supports multiple input formats, uses advanced AI processing, and generates realistic personas with authentic stock images.

## ✨ Key Features

### 📄 Multi-Format Transcript Support
- **File Upload**: TXT, PDF, DOC, DOCX, CSV, JSON files
- **Google Docs Integration**: Direct scraping from Google Docs URLs
- **Paste Text**: Direct text input with real-time validation
- **Batch Processing**: Handle multiple transcripts simultaneously

### 🤖 Advanced AI Persona Extraction
- **51 Comprehensive Fields**: Demographics, psychographics, behavioral patterns
- **Cultural Context**: Heritage, beliefs, traditions, social context
- **Financial Profile**: Apps, banks, payment habits, pain points
- **Emotional Intelligence**: Triggers, responses, tone analysis
- **Life Events**: Significant events with impact analysis
- **Decision Making**: Style and influence patterns

### 🖼️ Real Stock Images
- **Unsplash Integration**: Authentic, non-AI generated images
- **Smart Search**: Age, gender, occupation, and location-based queries
- **Attribution**: Proper photographer credits and licensing
- **Fallback System**: Graceful handling when images aren't found

### 🎨 Modern UI/UX
- **Airbnb/Uber Style**: Clean, minimal, bold typography
- **React Dropzone**: Drag & drop file uploads
- **Real-time Validation**: Instant feedback and error handling
- **Mobile-First**: Responsive design for all devices
- **Toast Notifications**: Success/error feedback with react-hot-toast

## 🏗️ Architecture

### Backend Services
```
backend/
├── services/
│   ├── googleDocsScraper.js      # Google Docs text extraction
│   ├── unsplashImageService.js   # Stock image fetching
│   └── enhancedAgentGenerator.js # AI persona generation
├── routes/
│   └── enhancedTranscriptUpload.js # Main API endpoints
└── utils/
    └── generationErrorHandler.js  # Comprehensive error handling
```

### Data Processing
```
data-processing/
├── services/
│   └── enhanced_transcript_processor.py # LangChain-powered extraction
├── api/
│   └── data_api.py               # FastAPI endpoints
└── requirements.txt              # Python dependencies
```

### Frontend Components
```
frontend/src/components/
├── EnhancedTranscriptUpload.jsx  # Main upload interface
├── GenerateUserModal.jsx         # User generation popup
└── AdvancedTranscriptUpload.jsx  # Legacy component
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis
- API Keys: OpenAI, Unsplash, Google APIs

### Backend Setup
```bash
cd backend
npm install unsplash-js googleapis
npm install
```

### Frontend Setup
```bash
cd frontend
npm install react-dropzone
npm install
```

### Data Processing Setup
```bash
cd data-processing
pip install langchain langgraph google-auth-oauthlib google-api-python-client
pip install -r requirements.txt
```

### Environment Variables
```bash
# Add to .env
OPENAI_API_KEY=your_openai_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATA_PROCESSING_URL=http://localhost:5000
```

## 🚀 Usage

### 1. Upload Transcripts
Navigate to the Users page and click "Generate" to open the enhanced upload modal.

**File Upload:**
- Drag & drop files or click to select
- Supports TXT, PDF, DOC, DOCX, CSV, JSON
- Maximum 10MB per file, 10 files total

**Google Docs:**
- Paste Google Docs URLs (one per line)
- Automatic text extraction and processing
- Validates URL format before processing

**Paste Text:**
- Direct text input with character counter
- Sample transcript button for testing
- Minimum 100 characters recommended

### 2. AI Processing
The system automatically:
- Extracts multiple personas from transcripts
- Generates comprehensive 51-field profiles
- Fetches authentic stock images
- Calculates confidence scores
- Handles errors gracefully

### 3. Generated Personas
Each persona includes:
- **Basic Info**: Name, age, gender, occupation, location
- **Background**: Professional history, education, experience
- **Personality**: Traits, values, motivations, goals
- **Financial Profile**: Apps, banks, payment habits, pain points
- **Cultural Context**: Heritage, beliefs, traditions, social circle
- **Behavioral Patterns**: Communication style, decision making
- **Life Events**: Significant events with years and impact
- **Technical Profile**: Tech savviness, English proficiency
- **Authentic Image**: Real stock photo with attribution

## 📊 API Endpoints

### POST `/api/transcript/upload`
Upload and process transcripts to generate AI personas.

**Request:**
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('urls', JSON.stringify(['https://docs.google.com/...']));
formData.append('text', 'Pasted transcript text...');
formData.append('context', JSON.stringify({...}));
```

**Response:**
```javascript
{
  "success": true,
  "message": "Successfully generated 3 AI personas",
  "data": {
    "agents": [...],
    "total_transcripts": 2,
    "total_personas": 3,
    "processing_time": 15420
  }
}
```

### POST `/process-transcripts` (Data Processing)
Process transcripts with AI to extract personas.

**Request:**
```javascript
{
  "transcripts": ["transcript1", "transcript2"],
  "source_files": ["file1.txt", "file2.txt"]
}
```

**Response:**
```javascript
{
  "success": true,
  "personas": [...],
  "total_transcripts": 2,
  "total_personas": 3
}
```

## 🧪 Testing

### Run Test Suite
```bash
cd backend
node scripts/test-enhanced-transcript.js
```

### Test Features
- ✅ Abdul transcript processing
- ✅ Multi-persona extraction
- ✅ Google Docs scraping
- ✅ Unsplash image integration
- ✅ Edge case handling
- ✅ Error recovery

### Sample Transcript
```text
Interview with Abdul Yasser - Trader

Interviewer: Hi Abdul, thanks for joining us today. Can you tell us about yourself?

Abdul: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore. I work as a day trader, mostly dealing with stocks and crypto.

Interviewer: What financial apps do you use?

Abdul: I use PhonePe for payments, Zerodha for trading, and I have accounts with HDFC and ICICI banks. I also use Slice Pay sometimes, but the hidden charges are a big problem.
```

**Expected Output:**
- Name: "Abdul Yasser"
- Age: 24
- Location: "Bangalore, Karnataka"
- Occupation: "Day Trader"
- Fintech Apps: ["PhonePe", "Zerodha", "Slice Pay"]
- Pain Points: ["hidden charges", "complex UI"]
- Cultural Background: "Muslim", "Middle-class family"
- Confidence Score: 0.85+

## 🔒 Security & Validation

### File Validation
- MIME type checking
- File size limits (10MB)
- Filename sanitization
- Content validation

### URL Validation
- Google Docs URL format verification
- Domain whitelist checking
- Error handling for inaccessible docs

### API Security
- JWT authentication required
- Rate limiting
- Input sanitization
- Error message filtering

## 🎯 Performance

### Processing Times
- Small files (< 1MB): 10-30 seconds
- Medium files (1-5MB): 30-90 seconds
- Large files (5-10MB): 90-300 seconds
- Google Docs: 5-15 seconds per document

### Optimization
- Parallel processing for multiple files
- Caching for repeated requests
- Retry logic for transient failures
- Graceful degradation

## 🚧 Future Enhancements

### Planned Features
- **Audio/Video Support**: Extract transcripts from audio/video files
- **Real-time Processing**: WebSocket updates during generation
- **Custom Templates**: User-defined persona templates
- **Bulk Management**: Mass operations on generated personas
- **Analytics Dashboard**: Processing statistics and insights

### Integration Ready
- **Audio Calling**: Personas ready for voice interactions
- **Chat Integration**: Seamless chat with generated personas
- **Export Options**: CSV, JSON, PDF export
- **API Webhooks**: Real-time notifications

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

---

**Sirius v0.3** - Enhanced Transcript Processing & AI Persona Generation
*Building the future of AI-powered user research*
