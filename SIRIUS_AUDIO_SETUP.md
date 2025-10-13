# Sirius v0.2: Audio Calling with Indian Accents Setup Guide

## 🎯 Overview

Sirius v0.2 introduces real-time audio calling for user research sessions with AI agents. Features include:
- **Real audio calls** via Twilio
- **Indian regional accents** (North, South, East, West) via ElevenLabs TTS
- **Speech recognition** with Deepgram (optimized for Indian English)
- **Group & 1:1 sessions** with natural overlaps and human-like responses
- **Airbnb/Uber inspired UI** - clean, minimal, bold typography

## 🚀 Prerequisites

### 1. API Keys Required

You'll need accounts and API keys from:

#### Twilio (Voice Infrastructure)
- Sign up at [twilio.com](https://www.twilio.com)
- Get: Account SID, Auth Token, API Key, API Secret
- Create a TwiML App and note the SID
- Free tier: $15 credit (sufficient for testing)

#### ElevenLabs (Text-to-Speech with Indian Accents)
- Sign up at [elevenlabs.io](https://elevenlabs.io)
- Get API Key
- Free tier: 10,000 characters/month
- Indian voices available: Use voice IDs for regional accents

#### Deepgram (Speech-to-Text)
- Sign up at [deepgram.com](https://deepgram.com)
- Get API Key
- Free tier: $200 credit
- Supports Indian English (en-IN)

### 2. System Requirements
- Node.js 18+
- Python 3.9+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 📦 Installation

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

This installs:
- `twilio` - Voice calling SDK
- `@deepgram/sdk` - Speech-to-text
- `elevenlabs` - Text-to-speech
- `socket.io` - Real-time communication

**Frontend:**
```bash
cd frontend
npm install
```

This installs:
- `@twilio/voice-sdk` - Browser calling
- `react-mic` - Audio recording
- `socket.io-client` - Real-time updates
- `react-icons` - UI icons

**Data Processing:**
```bash
cd data-processing
pip install -r requirements.txt
```

This installs:
- `deepgram-sdk` - Audio processing
- `elevenlabs` - Voice generation

### Step 2: Configure Environment Variables

Create `.env` file in the project root (copy from `env.example`):

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/avinci
REDIS_URL=redis://localhost:6379

# OpenAI (for agent responses)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key

# Service URLs
DATA_PROCESSING_URL=http://localhost:8000
FRONTEND_URL=http://localhost:9000
```

### Step 3: Setup Database

The audio calling feature uses these tables (automatically created):
- `voice_calls` - Call sessions
- `voice_events` - Transcript and audio logs

Run migrations:
```bash
cd backend
npm run migrate  # or your migration command
```

### Step 4: Start Services

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Running on http://localhost:9001
```

Terminal 2 - Data Processing:
```bash
cd data-processing
python api.py
# Running on http://localhost:8000
```

Terminal 3 - Frontend:
```bash
cd frontend
npm start
# Running on http://localhost:9000
```

## 🎙️ Using Audio Calls

### Creating a Call Session

1. Navigate to **User Research** page (`/user-research`)
2. Select AI agents (personas) for the call
3. Choose session type:
   - **Group Discussion**: Multiple agents, natural overlaps
   - **1-on-1 Interview**: Single agent, direct conversation
4. Enter research topic
5. Click **Start Audio Call**

### During the Call

**Interface Features:**
- **Participants Panel** (left): Shows all agents with avatars
- **Conversation Panel** (right): Live transcript of the call
- **Mic Button**: Click to unmute and speak
- **End Call Button**: Terminate the session

**How It Works:**
1. Click mic button to start speaking
2. System captures your audio via browser
3. Deepgram transcribes speech (optimized for Indian English)
4. Backend sends transcript to data-processing service
5. AI agent generates contextual response using persona
6. ElevenLabs converts text to speech with regional accent
7. Audio plays automatically in browser
8. Transcript updates in real-time

**Regional Accents:**
Agents are assigned accents based on their location:
- **North India** (Delhi, Jaipur): Hindi-influenced accent
- **South India** (Bangalore, Chennai): Clear, formal accent
- **West India** (Mumbai, Pune): Marathi/Gujarati influenced
- **East India** (Kolkata): Bengali influenced

### Group Call Dynamics

For group sessions, agents:
- Respond with natural delays (0.5-2 seconds)
- May overlap slightly (simulated via Socket.IO timing)
- Use casual language with Indian English patterns
- Reference each other's points

## 🏗️ Architecture

```
┌─────────────┐
│  Frontend   │ (React + Twilio Voice SDK)
│   :9000     │
└──────┬──────┘
       │
       │ HTTP + Socket.IO
       │
┌──────▼──────┐
│   Backend   │ (Node.js + Express + Socket.IO)
│   :9001     │ • Twilio integration
│             │ • Deepgram STT
│             │ • ElevenLabs TTS
└──────┬──────┘
       │
       │ POST /process-input
       │
┌──────▼──────────┐
│ Data Processing │ (FastAPI + OpenAI)
│     :8000       │ • Agent persona loading
│                 │ • Response generation
│                 │ • Context management
└─────────────────┘
```

### API Endpoints

**Backend (`/api/call`):**
- `POST /create` - Create call session, get Twilio token
- `POST /process-speech` - STT → AI → TTS pipeline
- `GET /:id` - Get call details and transcript
- `POST /:id/end` - End call session

**Data Processing:**
- `POST /process-input` - Generate agent response from transcript

### Socket.IO Events

**Client → Server:**
- `join-call` - Join call room
- `leave-call` - Leave call room
- `agent-response` - Trigger agent audio playback

**Server → Client:**
- `user-joined` - New participant joined
- `user-left` - Participant left
- `play-audio` - Play agent audio response

## 🎨 UI/UX Design

Following Airbnb/Uber style guidelines:

**Colors:**
- Primary: Blue 600 (`#2563EB`)
- Success: Green 600 (`#16A34A`)
- Danger: Red 600 (`#DC2626`)
- Background: Gray 50 (`#F9FAFB`)

**Typography:**
- Font: System default sans-serif
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Small: 12-14px

**Components:**
- Rounded corners: 12-16px
- Shadows: Subtle (`shadow-sm`)
- Borders: 1px solid gray-100
- Buttons: Rounded full, bold text

## 🧪 Testing

### Test Audio Call

1. **Create Test Agents:**
```bash
cd backend
node scripts/create_sample_personas.js
```

2. **Start a Group Call:**
   - Select 3-4 agents
   - Topic: "Best banking app features"
   - Type: Group

3. **Test Questions:**
   - "What do you think about mobile banking?"
   - "Which features are most important to you?"
   - "How often do you use banking apps?"

4. **Verify:**
   - Agents respond with different accents
   - Responses are contextual to their personas
   - Transcript updates correctly
   - Audio quality is clear

### Troubleshooting

**No audio playing:**
- Check browser permissions for microphone
- Verify Twilio token is valid
- Check ElevenLabs API quota

**Transcription errors:**
- Speak clearly, reduce background noise
- Check Deepgram API key
- Verify audio format (should be WAV)

**Agent not responding:**
- Check data-processing service is running
- Verify OpenAI API key
- Check agent IDs exist in database

## 🔒 Security & Privacy

- **Audio Storage**: Temporary audio files cleaned up after processing
- **API Keys**: Never exposed to frontend
- **HTTPS**: Required for production WebRTC
- **Rate Limiting**: 100 requests per 15 minutes
- **File Size Limits**: 10MB per audio chunk

## 📊 Cost Estimates (Free Tier)

**Twilio:**
- $15 free credit
- ~$0.005 per minute
- = ~3000 minutes free

**ElevenLabs:**
- 10,000 characters/month free
- ~150 words = 750 chars
- = ~13 agent responses/month

**Deepgram:**
- $200 credit
- ~$0.0043 per minute
- = ~46,500 minutes free

**Recommended for Production:**
- Twilio: Pay-as-you-go
- ElevenLabs: Creator tier ($5/mo for 30k chars)
- Deepgram: Growth tier ($0.0036/min)

## 🚀 Deployment

### Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f data-processing

# Stop services
docker-compose down
```

### Environment Variables (Production)

Set in your hosting platform:
- Render, Railway, Fly.io: Use environment variables UI
- AWS/GCP/Azure: Use secret management
- Kubernetes: Use ConfigMaps and Secrets

## 📚 Additional Resources

- [Twilio Voice SDK Docs](https://www.twilio.com/docs/voice/sdks/javascript)
- [ElevenLabs API Docs](https://docs.elevenlabs.io/)
- [Deepgram API Docs](https://developers.deepgram.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

## 🎉 Next Steps

1. **Enhance Accents**: Fine-tune ElevenLabs voice settings
2. **Add Recording**: Save full call audio for replay
3. **Analytics**: Track agent response quality
4. **Multi-language**: Add Hindi/Tamil support
5. **Mobile App**: React Native version

## 💬 Support

For issues or questions:
- GitHub Issues: [github.com/arunmaroon/avinci-main/issues](https://github.com/arunmaroon/avinci-main/issues)
- Email: support@avinci.ai

---

**Version**: Sirius v0.2  
**Last Updated**: October 2025  
**License**: MIT

