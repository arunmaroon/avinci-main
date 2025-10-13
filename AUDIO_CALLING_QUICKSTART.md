# 🎙️ Audio Calling Quick Start Guide

## Get Audio Calling Running in 15 Minutes

This guide will get you up and running with Sirius v0.2 audio calling feature quickly.

## Step 1: Get API Keys (5 minutes)

### Twilio Setup
1. Visit [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (free $15 credit)
3. Go to **Console Dashboard**
4. Copy these values:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" and copy
5. Go to **API Keys** → Create API Key
   - Copy **SID** (starts with SK)
   - Copy **Secret** (save immediately, can't view again)
6. Go to **Phone Numbers** → **TwiML Apps** → Create
   - Name it "Avinci Calls"
   - Copy the **SID** (starts with AP)

### ElevenLabs Setup
1. Visit [elevenlabs.io](https://elevenlabs.io)
2. Sign up (free 10k characters/month)
3. Go to **Profile** → **API Key**
4. Click "Generate" and copy the key

### Deepgram Setup
1. Visit [deepgram.com](https://deepgram.com)
2. Sign up (free $200 credit)
3. Go to **Console** → **API Keys**
4. Create new key and copy it

### OpenAI Setup (for AI responses)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys**
3. Create new key

## Step 2: Install Dependencies (3 minutes)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Data Processing
cd ../data-processing
pip install -r requirements.txt
```

## Step 3: Configure Environment (2 minutes)

Create `.env` file in project root:

```bash
# Database (use your existing config or Docker defaults)
DATABASE_URL=postgresql://avinci_user:avinci_password@localhost:5432/avinci
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...your_key...
OPENAI_MODEL=gpt-4

# Twilio (paste your keys from Step 1)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_key_here

# Service URLs
DATA_PROCESSING_URL=http://localhost:8000
FRONTEND_URL=http://localhost:9000
```

## Step 4: Run Database Migration (1 minute)

```bash
cd backend
psql $DATABASE_URL -f migrations/008_voice_calls_schema.sql
```

Or if using Docker:
```bash
docker-compose exec postgres psql -U avinci_user -d avinci -f /migrations/008_voice_calls_schema.sql
```

## Step 5: Start Services (2 minutes)

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual**

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd data-processing
python api.py
```

Terminal 3:
```bash
cd frontend
npm start
```

## Step 6: Test Audio Calling (2 minutes)

1. Open browser: `http://localhost:9000`
2. Navigate to **User Research**
3. Click **Create Session** or similar
4. Select 2-3 AI agents
5. Enter topic: "Mobile banking experience"
6. Click **Start Audio Call**
7. Allow microphone permissions
8. Click **Mic button** to unmute
9. Say: "What do you think about mobile banking apps?"
10. Wait for agent response with Indian accent!

## 🎉 You're Done!

You should now have:
- ✅ Real-time audio calls working
- ✅ AI agents responding in character
- ✅ Indian regional accents
- ✅ Live transcription
- ✅ Group chat dynamics

## 🐛 Quick Troubleshooting

### "Cannot connect to call"
- Check Twilio keys are correct
- Verify backend is running on port 9001
- Check browser console for errors

### "No audio playing"
- Allow microphone permissions in browser
- Check ElevenLabs API key
- Verify audio files are created in `backend/uploads/audio/`

### "Agents not responding"
- Verify data-processing service is running on port 8000
- Check OpenAI API key is valid
- Ensure agents exist in database

### "Transcription errors"
- Speak clearly and slowly
- Check Deepgram API key
- Verify microphone is working

## 📊 Check Your Setup

Visit these URLs to verify:
- Backend health: `http://localhost:9001/api/health`
- Data processing: `http://localhost:8000/`
- Frontend: `http://localhost:9000`

## 🔊 Voice IDs for Different Accents

Default voice IDs in the system:
- **North Indian**: `pNInz6obpgDQGcFmaJgB` (Hindi-influenced)
- **South Indian**: `onwK4e9ZLuTAKqWW03F9` (Clear, formal)
- **West Indian**: Same as North (Marathi/Gujarati)
- **East Indian**: Same as South (Bengali)

To customize, visit [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) and update `backend/routes/calls.js`.

## 💡 Next Steps

1. **Create more agents**: Use existing persona generation
2. **Test different topics**: Banking, e-commerce, healthcare
3. **Try 1-on-1 mode**: Better for detailed interviews
4. **Adjust accent settings**: Modify voice IDs for different regions
5. **Review transcripts**: Check database `voice_events` table

## 📚 Full Documentation

See `SIRIUS_AUDIO_SETUP.md` for complete details on:
- Architecture
- API endpoints
- Customization
- Production deployment
- Cost optimization

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Review documentation: `SIRIUS_AUDIO_SETUP.md`
3. Open issue: GitHub Issues
4. Check API status: Twilio/ElevenLabs/Deepgram dashboards

---

**Happy Researching! 🎤✨**

