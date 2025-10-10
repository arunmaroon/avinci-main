# 🚀 Development Environment - Sirius v2.02

## ✅ Running Now

### Backend (Node.js)
- **URL**: http://localhost:9001
- **Status**: ✅ Running with nodemon (hot reload)
- **API Docs**: http://localhost:9001/api/health
- **Logs**: `tail -f /tmp/backend_dev.log`

### Frontend (React)
- **URL**: http://localhost:3000
- **Status**: 🔄 Starting...
- **Logs**: `tail -f /tmp/frontend_dev.log`

---

## 📋 Quick Commands

### Start Development
```bash
# Backend (with hot reload)
cd backend
npm run dev

# Frontend (with hot reload)
cd frontend
npm start
```

### Stop Everything
```bash
# Kill all node processes
killall node

# Or kill specific ports
lsof -ti:9001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### View Logs
```bash
# Backend logs (real-time)
tail -f /tmp/backend_dev.log

# Frontend logs (real-time)
tail -f /tmp/frontend_dev.log

# Or check directly in terminal where you started them
```

---

## 🎯 Features Ready to Test

### 1. **Transcript Upload → Generate AI Agents**
**URL**: http://localhost:3000/ai-agents

1. Click **"Generate Agents"** in sidebar
2. Upload transcript file (`.txt`, `.csv`, `.xlsx`, `.pdf`)
3. Select number of agents (1-10)
4. Click **"Generate AI Agents"**
5. Wait 30-90 seconds for generation
6. View in **"Agent Library"**

**Test File**: Use `/sample_transcripts.csv` or create a simple `.txt`:
```txt
M: Tell me about your banking experience.
R: Well, honestly, I find mobile apps confusing. Like, too many options, you know?

M: What frustrates you most?
R: The forms! They ask for so much information. I just want to transfer money quickly.
```

### 2. **Enhanced Chat with Memory**
**URL**: http://localhost:3000/enhanced-chat

1. Select an agent from the list
2. Type a message and press Enter
3. Upload a UI screenshot (PNG/JPG, max 5MB)
4. Ask "What do you think of this UI?"
5. Agent analyzes with GPT-4o vision
6. Get pixel-perfect feedback!

**Test Queries**:
- "What are your thoughts on mobile banking?"
- "What frustrates you about apps?"
- (after uploading UI) "What's bad about this design?"
- "How would you improve the button placement?"

### 3. **Usability Testing**
**URL**: http://localhost:3000/enhanced-chat (right sidebar)

1. Chat with an agent
2. Upload UI screenshot
3. Select task from dropdown:
   - Navigation
   - Form Usability
   - Button Placement
   - Information Architecture
   - Mobile Responsiveness
4. Click **"Run Usability Test"**
5. Get structured results:
   - Steps the user would take
   - Pain points identified
   - Usability rating (1-10)
   - Specific fixes

### 4. **Group Chat**
**URL**: http://localhost:3000/group-chat

1. Click **"Select / Start Chat"**
2. Enter **"Purpose of Chat"** (e.g., "Review mobile app design")
3. Select **2 or more agents**
4. Click **"Start Group Chat"** (will turn blue when ready)
5. Watch agents discuss and provide perspectives
6. Generate summary of feedback

### 5. **Detailed Personas**
**URL**: http://localhost:3000/detailed-personas

- View rich persona cards with all 51 fields
- See demographics, traits, goals, fears
- Check speech patterns and vocabulary
- View master system prompts

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# In /backend/.env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here (optional)
DATABASE_URL=postgresql://localhost/avinci
REDIS_URL=redis://localhost:6379
```

### Check Configuration
```bash
curl http://localhost:9001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "Avinci Backend",
  "timestamp": "2025-10-09T18:41:14.360Z",
  "port": "9001",
  "aiProvider": "openai"
}
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port is in use
lsof -i :9001

# Check logs
cat /tmp/backend_dev.log

# Verify dependencies
cd backend && npm install

# Check database
psql -U postgres -d avinci -c "SELECT 1;"
```

### Frontend Won't Start
```bash
# Check if port is in use
lsof -i :3000

# Check logs
cat /tmp/frontend_dev.log

# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Transcript Upload Fails
**Error**: "Error uploading files. Please try again."

**Solutions**:
1. ✅ Check backend is running: `curl http://localhost:9001/api/health`
2. ✅ Verify file size < 50MB
3. ✅ Check supported format: `.txt`, `.csv`, `.xlsx`, `.pdf`, `.docx`
4. ✅ Check browser console (F12) for detailed error
5. ✅ Ensure `uploads/transcripts/` directory exists:
   ```bash
   cd backend && mkdir -p uploads/transcripts
   ```

### Chat Memory Not Working
1. Clear localStorage: Open browser console (F12), type:
   ```javascript
   localStorage.clear()
   ```
2. Refresh page
3. Start new conversation

### Group Chat Button Disabled
The button requires:
- ✅ At least **2 agents selected**
- ✅ **Chat purpose** field filled in

Look for validation messages at bottom of modal:
- ⚠️ "Select at least 2 agents to continue"
- ⚠️ "Please enter the chat purpose above"
- ✓ "Ready to start group chat" (button will be blue)

---

## 📊 API Endpoints Available

### Core APIs
```
GET  /api/health                 - Health check
GET  /api/personas               - List all personas
GET  /api/personas/:id           - Get persona details
POST /api/transcript-upload      - Upload transcript & generate agents
```

### Chat APIs
```
POST /api/ai/generate            - Chat with agent (with memory)
POST /api/ai/upload-ui           - Upload UI image
POST /api/ai/clear-history       - Clear chat history
POST /api/agent/usability        - Run usability test
POST /api/ai/generate-summary    - Generate chat summary
```

### Agent APIs
```
GET  /api/agents/v5              - Get all agents (latest API)
GET  /api/agents/v5/:id          - Get agent by ID
POST /api/agents/v5              - Create new agent
```

### Enhanced Chat
```
GET  /api/enhanced-chat/personas - Get chat-ready personas
POST /api/enhanced-chat/message  - Send chat message
```

---

## 🎨 Development Features

### Hot Reload
- **Backend**: Nodemon watches for file changes
- **Frontend**: React Fast Refresh for instant updates

### Code Changes
1. Edit any file in `/backend` or `/frontend/src`
2. Save the file
3. Changes auto-reload
4. Check browser/terminal for updates

### Database Migrations
```bash
cd backend
# Run migrations
psql -U postgres -d avinci -f migrations/007_enhanced_schema_columns.sql
```

### Add New Components
```bash
cd frontend/src/components
# Create new component
touch MyNewComponent.jsx

# Import in parent
import MyNewComponent from './components/MyNewComponent';
```

---

## 📁 File Structure Quick Reference

```
/backend
├── routes/
│   ├── aiChat.js          ✅ Enhanced chat with GPT-4o vision
│   ├── transcriptUpload.js ✅ Transcript → Persona generation
│   └── agents_v5.js       ✅ Latest agent API

/frontend/src
├── components/
│   ├── AgentChat.jsx      ✅ Chat with memory
│   ├── DocumentUpload.jsx ✅ Transcript upload
│   └── GroupChat.jsx      ✅ Multi-agent chat
├── stores/
│   └── chatStore.js       ✅ Zustand state management
└── pages/
    ├── AIAgents.jsx       ✅ Generate agents page
    ├── EnhancedChatPage.jsx ✅ Chat page
    └── GroupChatPage.jsx  ✅ Group chat page
```

---

## 🎉 What's Working

✅ **Backend** - Running on :9001 with hot reload  
✅ **Frontend** - Starting on :3000  
✅ **Database** - PostgreSQL connected  
✅ **Redis** - Connected for caching  
✅ **OpenAI** - GPT-4o with vision enabled  
✅ **Transcript Upload** - PDF/DOCX/TXT/CSV/XLSX support  
✅ **Chat Memory** - Persistent per agent  
✅ **UI Feedback** - GPT-4o vision analysis  
✅ **Usability Testing** - Task-based scenarios  
✅ **Group Chat** - Multi-agent discussions  
✅ **File Uploads** - Images for UI feedback  

---

## 📞 Next Steps

1. **Open Browser**: http://localhost:3000
2. **Generate Agent**: Upload a transcript file
3. **Test Chat**: Start conversation with agent
4. **Upload UI**: Get detailed feedback
5. **Run Usability Test**: Test specific tasks
6. **Try Group Chat**: Get multiple perspectives

---

**Environment**: Development  
**Status**: ✅ Running  
**Last Updated**: October 10, 2025

