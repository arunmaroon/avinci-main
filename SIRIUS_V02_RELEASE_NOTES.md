# 🎙️ Sirius v0.2 - Audio Calling Release Notes

**Release Date**: October 2025  
**Version**: 2.02  
**Feature**: Real-Time Audio Calling with Indian Regional Accents

---

## 🎯 What's New

Sirius v0.2 introduces **real-time audio calling** for user research sessions, enabling product teams to conduct voice-based interviews and group discussions with AI agents that speak with authentic Indian regional accents.

### Key Features

#### 1. **Real-Time Voice Calling** 🎧
- Browser-based audio calls (no app download required)
- Powered by Twilio Voice SDK
- Low-latency speech processing
- Works on desktop and mobile browsers

#### 2. **Indian Regional Accents** 🇮🇳
- **North India** (Delhi, Jaipur): Hindi-influenced accent
- **South India** (Bangalore, Chennai): Clear, formal accent  
- **West India** (Mumbai, Pune): Marathi/Gujarati influenced
- **East India** (Kolkata): Bengali influenced
- Powered by ElevenLabs TTS with regional voice models

#### 3. **Intelligent Speech Recognition** 🎤
- Optimized for Indian English (Deepgram)
- Handles accents, code-switching, and colloquialisms
- Real-time transcription
- High accuracy for Indian speech patterns

#### 4. **Natural Conversation Dynamics** 💬
- Agents respond with human-like delays (0.5-2 seconds)
- Group calls feature natural overlaps
- Casual language with Indian English patterns ("actually", "yaar", "basically")
- Context-aware responses based on agent personas

#### 5. **Two Session Types** 👥
- **Group Discussion** (2-5 agents): Multiple perspectives, natural debates
- **1-on-1 Interview** (1 agent): Deep, focused conversations

#### 6. **Modern UI Design** 🎨
- Airbnb/Uber inspired interface
- Clean, minimal, with bold typography
- Real-time transcript display
- Participant avatars and status indicators

---

## 🏗️ Technical Architecture

### Backend (Node.js + Express)
- **New Dependencies**: `twilio`, `@deepgram/sdk`, `elevenlabs`, `socket.io`
- **New Endpoints**:
  - `POST /api/call/create` - Initialize call session with Twilio token
  - `POST /api/call/process-speech` - STT → AI → TTS pipeline
  - `GET /api/call/:id` - Fetch call transcript
  - `POST /api/call/:id/end` - End call session
- **Real-Time Communication**: Socket.IO for agent response streaming

### Frontend (React)
- **New Dependencies**: `@twilio/voice-sdk`, `react-mic`, `socket.io-client`, `react-icons`
- **New Page**: `/audio-call` - Full-featured audio calling interface
- **Features**: 
  - Browser audio recording (ReactMic)
  - Real-time transcript display
  - Participant management
  - Mute/unmute controls

### Data Processing (FastAPI + Python)
- **New Service**: `services/call_simulator.py` - AI response generation
- **New API**: `POST /process-input` - Generate agent responses with persona context
- **Features**:
  - Regional accent hint generation
  - Natural language responses with Indian English patterns
  - Group dynamics simulation

### Database
- **New Tables**:
  - `voice_calls` - Call session metadata
  - `voice_events` - Speech events and transcripts
- **Migration**: `008_voice_calls_schema.sql`

---

## 📦 Installation & Setup

### Quick Start (15 minutes)
See `AUDIO_CALLING_QUICKSTART.md` for step-by-step setup.

### Full Documentation
See `SIRIUS_AUDIO_SETUP.md` for comprehensive guide.

### Dependencies
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# Data Processing
cd data-processing && pip install -r requirements.txt
```

### Environment Variables
Required new variables in `.env`:
```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_API_KEY=SKxxxx...
TWILIO_API_SECRET=xxx...
TWILIO_TWIML_APP_SID=APxxxx...

# ElevenLabs
ELEVENLABS_API_KEY=xxx...

# Deepgram
DEEPGRAM_API_KEY=xxx...
```

---

## 🚀 Usage

### Starting an Audio Call

1. **Navigate**: Go to **User Research** page
2. **Select**: Choose 2-5 agents (group) or 1 agent (1-on-1)
3. **Topic**: Enter research topic (e.g., "Mobile banking experience")
4. **Start**: Click "🎙️ Audio Call" button
5. **Connect**: Allow microphone permissions
6. **Speak**: Click mic button to unmute and speak
7. **Listen**: Agents respond with Indian accents automatically

### During the Call

- **Left Panel**: Participant list with avatars
- **Right Panel**: Live conversation transcript
- **Controls**: Mute/unmute, end call
- **Real-Time**: Responses play automatically with natural delays

### Sample Questions to Try

#### Banking/Fintech
- "What features do you want in a banking app?"
- "How often do you use mobile payments?"
- "What concerns do you have about digital banking?"

#### E-commerce
- "What makes you trust an online shopping platform?"
- "How do you decide which app to buy from?"
- "What delivery options are most important?"

#### Healthcare
- "Would you use telemedicine services?"
- "What health features would you want in an app?"
- "How important is privacy in health apps?"

---

## 🎨 UI/UX Improvements

### Design Philosophy
- **Clean & Minimal**: Focus on content, reduce clutter
- **Bold Typography**: Clear hierarchy, easy to scan
- **Subtle Shadows**: Depth without distraction
- **Rounded Corners**: Modern, friendly feel

### Color Palette
- **Primary Blue**: `#2563EB` - Trustworthy, professional
- **Success Green**: `#16A34A` - Positive actions
- **Danger Red**: `#DC2626` - Critical actions
- **Gray Scale**: 50-900 for hierarchy

### Components
- Rounded buttons with hover effects
- Card-based layouts with subtle borders
- Real-time status indicators
- Smooth transitions and animations

---

## 📊 Performance & Costs

### Latency
- **Speech-to-Text**: ~300-500ms (Deepgram)
- **AI Response Generation**: ~1-2s (OpenAI GPT-4)
- **Text-to-Speech**: ~500-800ms (ElevenLabs)
- **Total Response Time**: ~2-3.5 seconds

### Cost Estimates (Per Minute of Audio)

**Free Tier**:
- Twilio: $15 credit (3000 minutes)
- ElevenLabs: 10k chars/month (13 responses)
- Deepgram: $200 credit (46k minutes)

**Production Pricing**:
- Twilio: ~$0.005/min
- ElevenLabs: ~$0.30/min (Creator tier)
- Deepgram: ~$0.004/min
- **Total**: ~$0.31/min or ~$18.60/hour

**Cost Optimization Tips**:
- Use streaming for longer responses
- Cache common responses
- Implement response timeouts
- Monitor API usage closely

---

## 🔒 Security & Privacy

### Data Protection
- Audio files temporarily stored, deleted after processing
- Transcripts saved in database (can be disabled)
- API keys never exposed to frontend
- HTTPS required for production WebRTC

### Compliance
- GDPR-ready (data deletion on request)
- Audio recording disclosure recommended
- User consent for microphone access
- Secure token-based authentication (Twilio)

### Rate Limiting
- 100 requests per 15 minutes per IP
- 10MB max audio chunk size
- 5 concurrent calls per account (configurable)

---

## 🧪 Testing

### Automated Test Script
```bash
node scripts/test-audio-setup.js
```

This tests:
- ✅ Environment variables
- ✅ Twilio connection
- ✅ ElevenLabs API
- ✅ Deepgram API
- ✅ OpenAI API
- ✅ Backend service
- ✅ Data processing service
- ✅ Database tables
- ✅ Audio directories

### Manual Testing Checklist
- [ ] Create group call with 3 agents
- [ ] Speak a question, verify STT accuracy
- [ ] Confirm agent responds with Indian accent
- [ ] Check transcript updates in real-time
- [ ] Test mute/unmute functionality
- [ ] Verify natural delays between responses
- [ ] Try 1-on-1 call mode
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Check call end and cleanup

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Browser Support**: Best in Chrome/Edge (WebRTC limitations)
2. **Mobile**: Works but battery intensive
3. **Concurrent Calls**: Limited by API quotas
4. **Background Noise**: Can affect transcription accuracy
5. **Voice IDs**: Limited Indian accent options in ElevenLabs

### Workarounds
1. Use Chrome for best experience
2. Recommend headphones for mobile
3. Implement call queueing for scale
4. Advise quiet environment
5. Custom voice cloning (ElevenLabs Pro)

### Planned Improvements
- [ ] Call recording/playback
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Improved accent detection
- [ ] Better mobile experience
- [ ] Analytics dashboard for call quality
- [ ] Real-time sentiment analysis
- [ ] Speaker diarization for groups

---

## 📚 Documentation

### Available Guides
1. **SIRIUS_AUDIO_SETUP.md** - Comprehensive setup guide
2. **AUDIO_CALLING_QUICKSTART.md** - 15-minute quick start
3. **env.example** - Environment variable reference
4. **docker-compose.yml** - Container orchestration

### API Documentation
- Backend API: `http://localhost:9001/api/health`
- Data Processing: `http://localhost:8000/docs` (FastAPI auto-docs)

### Code Examples
- Audio call initialization: `frontend/src/pages/AudioCall.jsx`
- Speech processing: `backend/routes/calls.js`
- AI response generation: `data-processing/services/call_simulator.py`

---

## 🎯 Use Cases

### Product Research
- Test prototypes with diverse user personas
- Gather feedback on features
- Validate assumptions quickly

### Market Research
- Understand regional preferences
- Test messaging and positioning
- Explore pain points

### UX Research
- Conduct usability studies
- Test information architecture
- Evaluate user flows

### Academic Research
- Simulate user studies at scale
- Test hypotheses with diverse samples
- Generate qualitative data quickly

---

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Development Setup
```bash
# Clone repo
git clone https://github.com/arunmaroon/avinci-main.git
cd avinci-main

# Install dependencies
npm install  # backend
cd frontend && npm install
cd ../data-processing && pip install -r requirements.txt

# Run in dev mode
npm run dev  # backend
npm start    # frontend (separate terminal)
python api.py  # data-processing (separate terminal)
```

### Code Style
- Backend: ESLint + Prettier
- Frontend: ESLint + Prettier
- Python: Black + Flake8

---

## 🙏 Acknowledgments

### Third-Party Services
- **Twilio**: Voice infrastructure
- **ElevenLabs**: Text-to-speech
- **Deepgram**: Speech-to-text
- **OpenAI**: AI responses

### Open Source Libraries
- React, Express, FastAPI
- Socket.IO
- Material-UI
- Tailwind CSS

---

## 📞 Support

### Getting Help
- **Documentation**: See guides above
- **Issues**: [GitHub Issues](https://github.com/arunmaroon/avinci-main/issues)
- **Email**: support@avinci.ai
- **Discord**: [Join Community](https://discord.gg/avinci)

### Troubleshooting
See `AUDIO_CALLING_QUICKSTART.md` for common issues.

---

## 📅 Roadmap

### v0.3 (Planned)
- Call recording & playback
- Multi-language support
- Improved mobile experience
- Analytics dashboard

### v0.4 (Future)
- Video calling
- Screen sharing
- Collaborative whiteboard
- AI-powered insights

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎉 Thank You!

Thank you for using Sirius! We're excited to bring AI-powered user research to product teams everywhere.

**Happy Researching! 🎤✨**

---

*For the latest updates, visit our [GitHub repository](https://github.com/arunmaroon/avinci-main)*

