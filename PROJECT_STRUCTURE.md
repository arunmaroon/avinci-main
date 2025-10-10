# 📁 Project Structure

## Overview
Sirius v2.02 follows a clean, modular architecture with clear separation of concerns.

```
avinci-main/
├── 📄 README.md                 # Main documentation
├── 📄 docker-compose.yml        # Docker orchestration
├── 📄 package.json              # Root dependencies
├── 📄 env.example               # Environment template
├── 📄 setup.sh                  # Quick setup script
│
├── 📂 docs/                     # 📚 All Documentation
│   ├── ENHANCED_PERSONA_SYSTEM.md
│   ├── TRANSCRIPT_TO_PERSONA_GUIDE.md
│   ├── UXPRESSIA_PERSONA_REDESIGN.md
│   ├── PERSONA_CARD_QUICK_START.md
│   ├── PERSONA_DISPLAY_FIX.md
│   ├── GROUP_CHAT_SCROLL_FIX.md
│   ├── COMPILATION_ERROR_FIX.md
│   └── IMPLEMENTATION_SUMMARY.md
│
├── 📂 scripts/                  # 🔧 Utility Scripts
│   ├── create_rich_persona.js
│   ├── create_sample_personas.js
│   ├── create_indian_personas.js
│   ├── create_diverse_male_users.js
│   ├── create-admin.js
│   ├── create-sample-agents.js
│   ├── debug-admin.js
│   ├── reset-admin.js
│   ├── demo_enhanced_personas.js
│   ├── update_agent_behaviors.js
│   ├── update_agent_psychological_data.js
│   ├── update_all_agents_rich.js
│   └── update_enhanced_schema.js
│
├── 📂 tests/                    # 🧪 Test Files
│   ├── test_personas.js
│   ├── test_enhanced_system.js
│   ├── test_enhanced_system_simple.js
│   ├── test_persona_only.js
│   ├── test_persona_structure.js
│   ├── test_transcript_analysis.js
│   ├── test-enhanced-agent.js
│   ├── test-provider.js
│   ├── agents_v2.js           # Legacy route tests
│   ├── agents_v3.js
│   ├── agents_v4.js
│   ├── chat_v2.js
│   ├── chat_v3.js
│   ├── chat_v4.js
│   └── feedback_v2.js
│
├── 📂 backend/                  # 🖥️ Node.js Backend
│   ├── 📄 server.js            # Main server entry
│   ├── 📄 package.json         # Backend dependencies
│   ├── 📄 Dockerfile           # Backend container
│   │
│   ├── 📂 routes/              # API Endpoints
│   │   ├── agents_v5.js       # ✅ Current agent API
│   │   ├── agents.js          # ✅ Legacy agent API
│   │   ├── aiChat.js          # ✅ Enhanced chat with GPT-4o vision
│   │   ├── personas.js        # ✅ Persona management
│   │   ├── enhancedChat.js    # ✅ Chat orchestration
│   │   ├── transcriptUpload.js # ✅ Transcript processing
│   │   ├── auth.js            # Authentication
│   │   ├── analytics.js       # Analytics
│   │   ├── designFeedback.js  # UI feedback
│   │   ├── agentGenerate.js   # Agent generation
│   │   ├── generate.js        # Legacy generate
│   │   ├── upload.js          # File uploads
│   │   ├── chat.js            # Legacy chat
│   │   ├── debug.js           # Debug utilities
│   │   ├── simpleTest.js      # Testing
│   │   └── testPersona.js     # Persona testing
│   │
│   ├── 📂 services/            # Business Logic
│   │   ├── promptBuilder.js   # ✅ Master prompt generation
│   │   ├── providerGateway.js # ✅ AI provider abstraction
│   │   ├── personaExtractor.js # ✅ Persona extraction
│   │   ├── personaSynthesizer.js # ✅ Persona synthesis
│   │   ├── transcriptAnalyzer.js # ✅ Transcript analysis
│   │   ├── avatarService.js   # ✅ Avatar generation
│   │   ├── chatOrchestrator.js # Chat management
│   │   ├── behaviorEngine.js  # Behavior simulation
│   │   ├── agentBuilder.js    # Agent creation
│   │   ├── agentGenerator.js  # Agent generation
│   │   ├── enhancedAgentBuilder.js # Enhanced builder
│   │   ├── indianDemographics.js # Indian data
│   │   ├── designArtifacts.js # Design handling
│   │   ├── designFeedback.js  # Feedback logic
│   │   ├── documentProcessor.js # Document processing
│   │   ├── multiAgentFeedback.js # Multi-agent
│   │   ├── photoService.js    # Photo handling
│   │   ├── aiProvider.js      # AI provider
│   │   ├── aiService.js       # AI services
│   │   └── mockProvider.js    # Mock provider
│   │
│   ├── 📂 models/              # Database Models
│   │   └── database.js        # PostgreSQL connection
│   │
│   ├── 📂 middleware/          # Express Middleware
│   │   └── auth.js            # Authentication
│   │
│   ├── 📂 migrations/          # Database Migrations
│   │   ├── 001_transcript_persona_schema.sql
│   │   ├── 002_enhance_agents_table.sql
│   │   ├── 002_enhanced_agent_schema.sql
│   │   ├── 002_enhanced_persona_schema.sql
│   │   ├── 003_comprehensive_persona_schema.sql
│   │   ├── 003_enhance_ai_agents_schema.sql
│   │   ├── 004_simplified_persona_schema.sql
│   │   ├── 005_create_agents_table.sql
│   │   ├── 006_feedback_system.sql
│   │   └── 007_enhanced_schema_columns.sql
│   │
│   ├── 📂 src/                 # Additional Source
│   │   ├── behaviorEngine.js
│   │   ├── enhancedBehaviorEngine.js
│   │   ├── providerGateway.js
│   │   └── transcriptAnalysis.js
│   │
│   └── 📂 uploads/             # File Uploads
│       ├── transcripts/        # Uploaded transcripts
│       └── ui/                 # UI screenshots
│
├── 📂 frontend/                 # ⚛️ React Frontend
│   ├── 📄 package.json         # Frontend dependencies
│   ├── 📄 Dockerfile           # Frontend container
│   ├── 📄 tailwind.config.js  # Tailwind configuration
│   │
│   ├── 📂 public/              # Static Assets
│   │   └── index.html
│   │
│   ├── 📂 src/                 # Source Code
│   │   ├── 📄 index.js        # App entry
│   │   ├── 📄 App.js          # Main app component
│   │   ├── 📄 index.css       # Global styles
│   │   │
│   │   ├── 📂 components/      # ✨ React Components
│   │   │   ├── AgentChat.jsx  # ✅ Enhanced chat with memory
│   │   │   ├── AgentGrid.jsx  # ✅ Agent display grid
│   │   │   ├── GroupChat.jsx  # ✅ Multi-agent chat
│   │   │   ├── GroupChatNew.jsx
│   │   │   ├── DetailedPersonaCard.jsx
│   │   │   ├── EnhancedDetailedPersonaCard.jsx # ✅ Persona card
│   │   │   ├── PersonaDetailView.jsx
│   │   │   ├── DocumentUpload.jsx # ✅ File upload
│   │   │   ├── GenerationStatus.jsx
│   │   │   ├── Sidebar.jsx    # ✅ Navigation
│   │   │   └── ... (38 total components)
│   │   │
│   │   ├── 📂 pages/           # 📄 Page Components
│   │   │   ├── AIAgents.jsx   # ✅ Generate agents
│   │   │   ├── AgentLibrary.jsx # ✅ Agent library
│   │   │   ├── ChatTest.jsx
│   │   │   ├── DetailedPersonas.jsx
│   │   │   ├── EnhancedChatPage.jsx # ✅ Enhanced chat
│   │   │   ├── GroupChatPage.jsx # ✅ Group chat
│   │   │   ├── TestEnhancedChat.jsx
│   │   │   └── ... (11 total pages)
│   │   │
│   │   ├── 📂 stores/          # 🗃️ State Management
│   │   │   ├── chatStore.js   # ✅ Chat state (Zustand)
│   │   │   └── agentStore.js
│   │   │
│   │   ├── 📂 hooks/           # 🪝 Custom Hooks
│   │   │   ├── useAgentChat.js
│   │   │   └── useAuth.jsx
│   │   │
│   │   ├── 📂 utils/           # 🔧 Utilities
│   │   │   └── api.js         # API client
│   │   │
│   │   ├── 📂 design-system/   # 🎨 Design System
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   └── index.js
│   │   │
│   │   ├── 📂 types/           # 📝 Type Definitions
│   │   │   └── agent.js
│   │   │
│   │   └── 📂 styles/          # 💅 Styles
│   │       └── globals.css
│   │
│   ├── 📂 build/               # Production Build
│   └── 📂 uploads/             # Uploaded Designs
│
├── 📂 data-processing/          # 🐍 Python Services
│   ├── 📄 main.py              # Main entry
│   ├── 📄 requirements.txt     # Python dependencies
│   ├── 📄 Dockerfile           # Python container
│   │
│   ├── 📂 config/              # Configuration
│   │   └── settings.py
│   │
│   └── 📂 services/            # Python Services
│       ├── embedding_service.py
│       └── text_processor.py
│
├── 📂 nginx/                    # 🌐 Nginx Configuration
│   └── nginx.conf
│
└── 📂 node_modules/             # Dependencies (gitignored)
```

## 🔑 Key Directories

### **`/docs`** - Documentation
All markdown documentation files organized in one place.

### **`/scripts`** - Utility Scripts
- Database setup scripts
- Persona creation scripts
- Admin management
- Data migration tools

### **`/tests`** - Test Files
- Unit tests
- Integration tests
- Legacy route versions for testing

### **`/backend`** - Node.js API
- **`/routes`**: RESTful API endpoints
- **`/services`**: Business logic layer
- **`/models`**: Database models
- **`/middleware`**: Express middleware
- **`/migrations`**: SQL schema migrations

### **`/frontend`** - React Application
- **`/components`**: Reusable UI components
- **`/pages`**: Page-level components
- **`/stores`**: Zustand state management
- **`/hooks`**: Custom React hooks
- **`/utils`**: Helper functions

### **`/data-processing`** - Python Services
- Embedding generation
- Text processing
- NLP operations

## 🚀 Active vs Legacy Files

### ✅ **Active Production Files**

**Backend Routes:**
- `agents_v5.js` - Latest agent API with full features
- `aiChat.js` - Enhanced chat with GPT-4o vision
- `personas.js` - Persona management
- `enhancedChat.js` - Chat orchestration
- `transcriptUpload.js` - Transcript processing

**Frontend Components:**
- `AgentChat.jsx` - Chat with memory & UI feedback
- `AgentGrid.jsx` - Agent display
- `GroupChat.jsx` - Multi-agent conversations
- `EnhancedDetailedPersonaCard.jsx` - Persona display
- `DocumentUpload.jsx` - File uploads

**Stores:**
- `chatStore.js` - Persistent chat history with Zustand

### 🗂️ **Legacy/Archived Files**

Moved to `/tests`:
- `agents_v2.js`, `agents_v3.js`, `agents_v4.js`
- `chat_v2.js`, `chat_v3.js`, `chat_v4.js`
- `feedback_v2.js`

## 🎯 Quick Reference

| Feature | Location |
|---------|----------|
| Chat with Memory | `/frontend/src/components/AgentChat.jsx` |
| UI Feedback | `/backend/routes/aiChat.js` (GPT-4o vision) |
| Usability Testing | `/backend/routes/aiChat.js` line 658-730 |
| Persona Generation | `/backend/routes/transcriptUpload.js` |
| Agent Management | `/backend/routes/agents_v5.js` |
| Chat State | `/frontend/src/stores/chatStore.js` |
| Master Prompts | `/backend/services/promptBuilder.js` |
| Group Chat | `/frontend/src/pages/GroupChatPage.jsx` |

## 📦 Package Structure

```json
{
  "workspaces": [
    "backend",
    "frontend",
    "data-processing"
  ]
}
```

## 🔄 Migration Path

If you need to reference old code:
1. Check `/tests` for legacy route versions
2. Check git history for deleted files
3. Reference documentation in `/docs`

## 🧹 Maintenance

- **Clean build artifacts**: `npm run clean`
- **Remove test files**: Already in `/tests`
- **Update docs**: All in `/docs`
- **Run scripts**: Use files in `/scripts`

---

**Last Updated**: October 9, 2025
**Version**: 2.02

