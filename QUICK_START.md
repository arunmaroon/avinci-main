# 🚀 Sirius v2.02 - Quick Start Guide

## 📁 New Organized Structure

```
✅ Cleaned and optimized project structure!

📂 Root Directory
├── README.md              # Main documentation
├── PROJECT_STRUCTURE.md   # Detailed structure guide
├── CLEANUP_SUMMARY.md     # What changed
├── docker-compose.yml     # Docker setup
├── package.json           # Dependencies
├── env.example            # Environment template
└── setup.sh               # Quick setup script

📂 /docs (8 files)
└── All documentation centralized here

📂 /scripts (21 files)
└── Utility scripts for setup and management

📂 /tests (7+ files)
└── Test files and legacy code versions

📂 /backend
└── Node.js API server

📂 /frontend
└── React application

📂 /data-processing
└── Python services
```

---

## 🎯 Quick Commands

### Start the Application
```bash
# Using Docker (Recommended)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Run Scripts
```bash
# Create admin user
node scripts/create-admin.js

# Generate sample personas
node scripts/create_rich_persona.js

# Demo enhanced personas
node scripts/demo_enhanced_personas.js
```

### Access Documentation
```bash
# Main features
cat docs/ENHANCED_PERSONA_SYSTEM.md

# Transcript upload guide
cat docs/TRANSCRIPT_TO_PERSONA_GUIDE.md

# UI redesign details
cat docs/UXPRESSIA_PERSONA_REDESIGN.md
```

---

## 🔧 Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Data Processing
```bash
cd data-processing
pip install -r requirements.txt
python main.py
```

---

## 📚 Key Features

### 💬 **Enhanced Chat with Memory**
- Upload UI screenshots for feedback
- GPT-4o vision analyzes images
- Persistent conversation history
- Context-aware responses

**Location**: `frontend/src/components/AgentChat.jsx`

### 🧪 **Usability Testing**
- Task-based testing (Navigation, Forms, etc.)
- Persona-specific insights
- Structured results with ratings
- Actionable fixes

**Location**: `backend/routes/aiChat.js` (line 658-730)

### 🎭 **Persona Generation**
- Upload interview transcripts
- Two-stage AI pipeline
- Rich 51-field persona model
- Master system prompts

**Location**: `backend/routes/transcriptUpload.js`

### 👥 **Group Chat**
- Multi-agent conversations
- Purpose-driven discussions
- Real-time collaboration

**Location**: `frontend/src/pages/GroupChatPage.jsx`

---

## ⚠️ Important Notes

### Start Group Chat Button
To enable the "Start Group Chat" button:
1. ✅ Select **at least 2 agents**
2. ✅ Fill in the **"Purpose of Chat"** field
3. Button will turn blue when ready!

**Validation messages will guide you if requirements aren't met.**

### File Uploads
- **Max size**: 5MB per file
- **Formats**: PNG, JPG, JPEG
- **Validation**: Automatic with error toasts

### Environment Setup
```bash
# Copy template
cp env.example .env

# Required variables:
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://...
```

---

## 📖 Documentation Index

| Topic | Location |
|-------|----------|
| Project Structure | `PROJECT_STRUCTURE.md` |
| Cleanup Summary | `CLEANUP_SUMMARY.md` |
| Enhanced Personas | `docs/ENHANCED_PERSONA_SYSTEM.md` |
| Transcript Upload | `docs/TRANSCRIPT_TO_PERSONA_GUIDE.md` |
| UI Redesign | `docs/UXPRESSIA_PERSONA_REDESIGN.md` |
| Persona Cards | `docs/PERSONA_CARD_QUICK_START.md` |
| Bug Fixes | `docs/*_FIX.md` |

---

## 🐛 Troubleshooting

### Group Chat Button Not Clickable
**Solution**: Ensure you have:
- [ ] Selected 2+ agents
- [ ] Entered chat purpose
- [ ] Check validation messages in modal footer

### File Upload Fails
**Solution**:
- Check file size < 5MB
- Use PNG/JPG format only
- Check backend is running
- Verify OPENAI_API_KEY is set

### Chat Memory Not Persisting
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Check browser console for errors

### Docker Issues
```bash
# Reset Docker
docker-compose down -v
docker-compose up -d --build
```

---

## 📊 Project Stats

- **Backend Routes**: 16 active routes
- **Frontend Components**: 51 components
- **Documentation Files**: 8 guides
- **Utility Scripts**: 21 scripts
- **Test Files**: 7+ test suites
- **Migrations**: 10 schema migrations

---

## 🎉 What's New in v2.02

✅ **Enhanced Chat System**
- Persistent memory per agent
- Image upload & analysis
- GPT-4o vision integration

✅ **Detailed UI Feedback**
- Pixel-perfect critiques
- Persona-driven insights
- Actionable suggestions

✅ **Usability Testing**
- Task-based scenarios
- Structured results
- Rating system (1-10)

✅ **Clean Architecture**
- Organized file structure
- Centralized documentation
- Separated concerns

✅ **Modern UI/UX**
- Airbnb/Uber style
- Gradient backgrounds
- Toast notifications
- Accessibility features

---

## 💡 Tips

1. **Check `PROJECT_STRUCTURE.md` first** - Find files quickly
2. **Use `/scripts` for setup** - Don't run test files
3. **Read `/docs` for features** - Comprehensive guides
4. **Test in `/tests`** - Keep production clean
5. **Follow .gitignore** - Don't commit test files

---

## 🆘 Need Help?

1. Check documentation in `/docs`
2. Review `PROJECT_STRUCTURE.md`
3. Look at code examples in `/tests`
4. Check git commit history
5. Consult `README.md`

---

**Last Updated**: October 9, 2025  
**Version**: 2.02  
**Status**: Production Ready ✅

