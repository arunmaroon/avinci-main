# Sirius v2.04 - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Schema](#database-schema)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [AI Integration](#ai-integration)
7. [UI/UX Design System](#uiux-design-system)
8. [API Endpoints](#api-endpoints)
9. [Key Features Implementation](#key-features-implementation)
10. [Deployment & Environment](#deployment--environment)
11. [Development Workflow](#development-workflow)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🎯 Project Overview

**Sirius v2.04** is an advanced AI-powered UX research platform that generates realistic AI personas and facilitates intelligent conversations for design feedback. The platform enables designers to interact with diverse AI agents representing different user demographics, cultural backgrounds, and technical expertise levels.

### Core Value Proposition
- **Realistic AI Personas**: 51-field comprehensive persona data model
- **Cultural Authenticity**: Language mixing based on English proficiency levels
- **Design Feedback**: GPT-4o Vision integration for detailed UI analysis
- **Group Conversations**: Multi-agent discussions for comprehensive insights
- **Persistent Memory**: Chat history and session management
- **Professional UI**: Magazine-style persona cards and modern interface

### Target Users
- UX/UI Designers
- Product Managers
- UX Researchers
- Design Teams
- Product Strategists

---

## 🏗️ Architecture & Tech Stack

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • OpenAI GPT-4o │
│ • Tailwind CSS  │    │ • PostgreSQL    │    │ • Anthropic API  │
│ • Zustand Store │    │ • Redis Cache   │    │ • UI-Avatars    │
│ • React Router  │    │ • Multer Upload │    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand (lightweight Redux alternative)
- **Routing**: React Router v6
- **Icons**: Heroicons v2
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **File Upload**: Multer
- **Authentication**: JWT tokens
- **Validation**: Joi
- **Logging**: Winston

#### AI Services
- **Primary LLM**: OpenAI GPT-4o
- **Secondary LLM**: Anthropic Claude
- **Vision API**: OpenAI GPT-4o Vision
- **Embeddings**: OpenAI text-embedding-ada-002

#### Infrastructure
- **Containerization**: Docker
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2
- **Environment**: Node.js production environment

---

## 🗄️ Database Schema

### Core Tables

#### `ai_agents` Table (51 Columns)
```sql
CREATE TABLE ai_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    
    -- Demographics
    age INTEGER,
    gender VARCHAR(50),
    location VARCHAR(255),
    occupation VARCHAR(255),
    company VARCHAR(255),
    role_title VARCHAR(255),
    education_level VARCHAR(100),
    income_range VARCHAR(100),
    
    -- Cultural Background
    cultural_background JSONB,
    native_language VARCHAR(100),
    english_savvy VARCHAR(50),
    
    -- Personality & Behavior
    personality_traits JSONB,
    communication_style JSONB,
    vocabulary_profile JSONB,
    emotional_profile JSONB,
    cognitive_profile JSONB,
    
    -- Goals & Pain Points
    primary_goals JSONB,
    pain_points JSONB,
    frustrations JSONB,
    motivations JSONB,
    
    -- Technical Profile
    tech_savviness VARCHAR(50),
    device_preferences JSONB,
    app_usage_patterns JSONB,
    
    -- Domain Knowledge
    domain_knowledge JSONB,
    expertise_areas JSONB,
    learning_preferences JSONB,
    
    -- AI System Data
    master_system_prompt TEXT,
    behavior_engine_config JSONB,
    conversation_history JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    version VARCHAR(20) DEFAULT '2.04'
);
```

#### `chat_sessions` Table
```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    agent_id INTEGER REFERENCES ai_agents(id),
    user_id VARCHAR(255),
    chat_history JSONB,
    ui_context TEXT,
    purpose TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    summary TEXT,
    message_count INTEGER DEFAULT 0
);
```

#### `group_sessions` Table
```sql
CREATE TABLE group_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    agent_ids INTEGER[],
    user_id VARCHAR(255),
    chat_history JSONB,
    purpose TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    summary TEXT,
    message_count INTEGER DEFAULT 0
);
```

---

## 🔧 Backend Architecture

### Directory Structure
```
backend/
├── routes/                 # API route handlers
│   ├── aiChat.js          # AI chat endpoints
│   ├── agents_v5.js       # Agent management
│   ├── personas.js        # Persona operations
│   ├── enhancedChat.js    # Enhanced chat features
│   ├── transcriptUpload.js # File upload handling
│   └── ...
├── services/              # Business logic services
│   ├── promptBuilder.js   # AI prompt generation
│   ├── personaExtractor.js # Persona extraction
│   ├── behaviorEngine.js  # AI behavior simulation
│   ├── avatarService.js   # Avatar management
│   └── ...
├── src/                   # Core utilities
│   ├── enhancedBehaviorEngine.js
│   ├── transcriptAnalysis.js
│   └── providerGateway.js
├── models/                # Database models
│   └── database.js
├── middleware/            # Express middleware
│   └── auth.js
└── server.js             # Main server file
```

### Key Services

#### 1. PromptBuilder Service
**File**: `backend/services/promptBuilder.js`

**Purpose**: Generates master system prompts for AI agents based on persona data.

**Key Methods**:
```javascript
class PromptBuilder {
    static buildMasterPrompt(persona) {
        // Constructs comprehensive AI prompts with:
        // - Identity and demographics
        // - Language mixing rules
        // - Communication style
        // - Behavioral constraints
        // - Anti-AI language rules
    }
    
    static extractQuotes(persona) {
        // Extracts authentic quotes and phrases
    }
    
    static buildVocabularyConstraints(persona) {
        // Sets vocabulary complexity limits
    }
}
```

**Language Mixing Logic**:
```javascript
// English proficiency-based language mixing
if (englishSavvy === 'High') {
    languageInstructions = "Speak ONLY in English. You are fluent.";
} else if (englishSavvy === 'Low') {
    languageInstructions = `Mix ${nativeLanguage} and English naturally. 
    Example: "Chala baagundi! This feature is useful kada?"`;
} else {
    languageInstructions = `Primarily English with occasional ${nativeLanguage} words.`;
}
```

#### 2. PersonaExtractor Service
**File**: `backend/services/personaExtractor.js`

**Purpose**: Extracts persona data from transcripts and documents.

**Key Methods**:
```javascript
class PersonaExtractor {
    async extractPersonas(transcript) {
        // Two-stage LLM pipeline:
        // 1. Analysis: Extract structured data
        // 2. Synthesis: Generate comprehensive personas
    }
    
    async analyzeTranscript(transcript) {
        // Uses GPT-4o to analyze transcript content
    }
    
    async synthesizePersonas(analysis) {
        // Generates rich persona data from analysis
    }
}
```

#### 3. BehaviorEngine Service
**File**: `backend/services/behaviorEngine.js`

**Purpose**: Post-processes AI responses to add human-like behaviors.

**Key Features**:
- Filler word insertion
- Self-corrections
- Sentence length adjustment
- Vocabulary filtering
- Response timing simulation

#### 4. AvatarService
**File**: `backend/services/avatarService.js`

**Purpose**: Manages avatar generation and fallback mechanisms.

**Key Methods**:
```javascript
class AvatarService {
    static generateAvatarUrl(name, options = {}) {
        // Generates avatar URLs with fallbacks
    }
    
    static getFallbackAvatar(name) {
        // UI-Avatars API fallback
    }
}
```

---

## 🎨 Frontend Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── AgentGrid.jsx    # Agent grid display
│   │   ├── AgentChat.jsx    # Individual chat
│   │   ├── GroupChat.jsx    # Group chat interface
│   │   ├── EnhancedDetailedPersonaCard.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── AIAgents.jsx
│   │   ├── AgentLibrary.jsx
│   │   ├── GroupChatPage.jsx
│   │   ├── DetailedPersonas.jsx
│   │   ├── ChatArchive.jsx
│   │   └── ...
│   ├── stores/              # State management
│   │   └── chatStore.js     # Zustand store
│   ├── utils/               # Utility functions
│   │   ├── api.js          # API client
│   │   └── avatar.js       # Avatar utilities
│   ├── design-system/       # Design system components
│   └── App.js              # Main app component
├── public/                  # Static assets
└── package.json
```

### State Management (Zustand)

#### Chat Store Structure
**File**: `frontend/src/stores/chatStore.js`

```javascript
const useChatStore = create((set, get) => ({
    // Single-agent chat state
    chatHistory: [],
    currentAgentId: null,
    isLoading: false,
    error: null,
    uiContext: null,
    
    // Group chat state
    activeGroupId: null,
    activeGroupAgents: [],
    groupChatHistory: [],
    groupPurpose: '',
    
    // Session management
    chatSessions: {},
    groupSessions: {},
    
    // Actions
    sendMessage: async (content, ui_path = null) => { /* ... */ },
    uploadUI: async (file, agentId) => { /* ... */ },
    startGroupChatSession: (agents, purpose) => { /* ... */ },
    endGroupChatSession: () => { /* ... */ },
    generateSummary: async (chatHistory, purpose, agents) => { /* ... */ },
    
    // Persistence
    saveChatHistory: () => { /* localStorage operations */ },
    loadChatHistory: (agentId) => { /* localStorage operations */ },
}));
```

### Key Components

#### 1. AgentGrid Component
**File**: `frontend/src/components/AgentGrid.jsx`

**Purpose**: Displays agents in a responsive grid with filtering.

**Key Features**:
- Responsive grid layout
- Filter by tech savviness, English level, domain
- Search functionality
- Avatar handling with fallbacks
- Click to start chat

#### 2. GroupChat Component
**File**: `frontend/src/components/GroupChat.jsx`

**Purpose**: Manages multi-agent conversations.

**Key Features**:
- Real-time message streaming
- Image upload and display
- Message persistence
- Summary generation
- Session management

#### 3. EnhancedDetailedPersonaCard Component
**File**: `frontend/src/components/EnhancedDetailedPersonaCard.jsx`

**Purpose**: Displays comprehensive persona information in magazine style.

**Key Features**:
- 51-field data display
- Professional card layout
- Responsive design
- Avatar integration
- Action buttons

---

## 🤖 AI Integration

### OpenAI GPT-4o Integration

#### Chat Generation
```javascript
// Backend: backend/routes/aiChat.js
async function generateEnhancedResponse(context, query, ui_path) {
    const messages = [
        { role: "system", content: context },
        { role: "user", content: query }
    ];
    
    // Vision API integration for image analysis
    if (ui_path) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        
        messages.push({
            role: "user",
            content: [
                { type: "text", text: query },
                { 
                    type: "image_url", 
                    image_url: {
                        url: `data:image/png;base64,${base64Image}`,
                        detail: "high"
                    }
                }
            ]
        });
    }
    
    const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
    });
    
    return response.choices[0].message.content;
}
```

#### Persona Generation Pipeline
```javascript
// Two-stage LLM pipeline for persona extraction
async function extractPersonas(transcript) {
    // Stage 1: Analysis
    const analysis = await analyzeTranscript(transcript);
    
    // Stage 2: Synthesis
    const personas = await synthesizePersonas(analysis);
    
    return personas;
}
```

### Anthropic Claude Integration
- Secondary LLM for persona generation
- Fallback for OpenAI API failures
- Alternative perspective generation

### Vision API Usage
- **Image Analysis**: Detailed UI feedback with pixel-level analysis
- **Context Awareness**: Agents remember uploaded images
- **Design Critique**: Specific suggestions for UI improvements

---

## 🎨 UI/UX Design System

### Design Principles
1. **Professional Aesthetics**: Magazine-style layouts
2. **Accessibility**: ARIA labels, keyboard navigation
3. **Responsive Design**: Mobile-first approach
4. **Consistent Spacing**: 8px grid system
5. **Modern Interactions**: Smooth animations and transitions

### Color Palette
```css
/* Primary Colors */
--indigo-50: #eef2ff;
--indigo-500: #6366f1;
--indigo-600: #4f46e5;
--indigo-700: #4338ca;

/* Secondary Colors */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;

/* Accent Colors */
--green-500: #10b981;  /* Success */
--red-500: #ef4444;    /* Error */
--yellow-500: #f59e0b; /* Warning */
--blue-500: #3b82f6;   /* Info */
```

### Typography Scale
```css
/* Font Sizes */
text-xs: 0.75rem;     /* 12px */
text-sm: 0.875rem;    /* 14px */
text-base: 1rem;      /* 16px */
text-lg: 1.125rem;    /* 18px */
text-xl: 1.25rem;     /* 20px */
text-2xl: 1.5rem;     /* 24px */
text-3xl: 1.875rem;   /* 30px */
text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
font-normal: 400;
font-medium: 500;
font-semibold: 600;
font-bold: 700;
```

### Component Library

#### Button Variants
```jsx
// Primary Button
<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
    Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-slate-300 text-slate-700">
    Secondary Action
</Button>

// Ghost Button
<Button variant="ghost" className="text-slate-600 hover:bg-slate-100">
    Ghost Action
</Button>
```

#### Card Components
```jsx
// Standard Card
<Card className="bg-white rounded-2xl shadow-xl border border-white/60 backdrop-blur-lg">
    <CardContent>
        {/* Content */}
    </CardContent>
</Card>

// Gradient Card
<Card className="bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-500">
    <CardContent>
        {/* Content */}
    </CardContent>
</Card>
```

### Layout Patterns

#### Grid System
```jsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {/* Grid Items */}
</div>

// Flexbox Layouts
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    {/* Flex Items */}
</div>
```

#### Modal Patterns
```jsx
// Standard Modal
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Content */}
    </div>
</div>
```

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
```

### Agent Management
```
GET    /api/agents/v5                    # Get all agents
GET    /api/agents/v5/:id               # Get specific agent
POST   /api/agents/v5                   # Create new agent
PUT    /api/agents/v5/:id               # Update agent
DELETE /api/agents/v5/:id               # Delete agent
POST   /api/agent/generate              # Generate agent from transcript
```

### Chat Endpoints
```
POST /api/ai/generate                   # Generate AI response
POST /api/ai/upload-ui                  # Upload UI image
POST /api/ai/generate-summary           # Generate chat summary
POST /api/ai/clear-history              # Clear chat history
GET  /api/ai/history/:agentId           # Get chat history
```

### Enhanced Chat
```
POST /api/enhanced-chat/personas        # Get personas for chat
POST /api/enhanced-chat/generate        # Enhanced chat generation
POST /api/enhanced-chat/upload          # Upload with context
```

### File Upload
```
POST /api/transcript-upload             # Upload transcript files
POST /api/upload                        # General file upload
```

### Analytics & Feedback
```
GET  /api/analytics/sessions            # Get session analytics
POST /api/design-feedback               # Submit design feedback
GET  /api/design-feedback/:id           # Get feedback details
```

### Utility Endpoints
```
GET  /api/debug/agents                  # Debug agent data
POST /api/generate/test                 # Test generation
```

---

## 🚀 Key Features Implementation

### 1. Persona Generation from Transcripts

#### Process Flow
1. **File Upload**: User uploads transcript (CSV, TXT, PDF, DOCX)
2. **Content Extraction**: Parse and extract text content
3. **AI Analysis**: GPT-4o analyzes content for persona data
4. **Persona Synthesis**: Generate comprehensive persona profiles
5. **Database Storage**: Save personas with 51-field schema
6. **Prompt Generation**: Create master system prompts

#### Implementation
```javascript
// backend/routes/transcriptUpload.js
router.post('/transcript-upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const content = await extractContent(file);
        
        const personas = await PersonaExtractor.extractPersonas(content);
        
        for (const persona of personas) {
            await db.query(
                'INSERT INTO ai_agents (name, demographics, ...) VALUES ($1, $2, ...)',
                [persona.name, JSON.stringify(persona.demographics), ...]
            );
        }
        
        res.json({ success: true, personas: personas.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 2. Language Mixing System

#### Implementation Logic
```javascript
// backend/services/promptBuilder.js
function buildLanguageInstructions(persona) {
    const englishSavvy = persona.english_savvy || 'Medium';
    const nativeLanguage = persona.native_language || 'Telugu';
    
    if (englishSavvy === 'Advanced' || englishSavvy === 'High') {
        return "LANGUAGE: Speak ONLY in English. You are fluent and comfortable with English.";
    } else if (englishSavvy === 'Low' || englishSavvy === 'Basic') {
        return `LANGUAGE: Mix ${nativeLanguage} and English naturally. 
        Use ${nativeLanguage} words frequently, especially for common expressions, emotions, and cultural references. 
        Example: "Chala baagundi! This feature is very useful kada?"`;
    } else {
        return `LANGUAGE: Primarily English with occasional ${nativeLanguage} words for emphasis. 
        Example: "This is good, kani I need more details."`;
    }
}
```

### 3. Group Chat System

#### Architecture
```javascript
// frontend/src/stores/chatStore.js
const useChatStore = create((set, get) => ({
    // Group chat state
    activeGroupId: null,
    activeGroupAgents: [],
    groupChatHistory: [],
    groupPurpose: '',
    
    // Group chat actions
    startGroupChatSession: (agents, purpose) => {
        const groupId = `group_${Date.now()}`;
        set({
            activeGroupId: groupId,
            activeGroupAgents: agents,
            groupChatHistory: [],
            groupPurpose: purpose,
        });
        
        // Persist to localStorage
        localStorage.setItem(`group_chat_${groupId}`, JSON.stringify({
            agents, purpose, messages: [], startedAt: new Date().toISOString()
        }));
        
        return groupId;
    },
    
    sendGroupMessage: async (content) => {
        const { activeGroupAgents, groupChatHistory } = get();
        
        // Send to each agent
        const responses = await Promise.all(
            activeGroupAgents.map(agent => 
                api.post('/api/ai/generate', {
                    agentId: agent.id,
                    message: content,
                    chatHistory: groupChatHistory
                })
            )
        );
        
        // Add responses to chat history
        responses.forEach((response, index) => {
            get().appendGroupMessage({
                type: 'agent',
                agent: activeGroupAgents[index],
                content: response.data.response,
                timestamp: new Date().toISOString()
            });
        });
    }
}));
```

### 4. Chat Archive & Summary System

#### Implementation
```javascript
// backend/routes/aiChat.js
router.post('/generate-summary', async (req, res) => {
    const { chatHistory, chatPurpose, agents } = req.body;
    
    const summaryPrompt = `# GROUP CHAT SUMMARY
    
    You are analyzing a group discussion between multiple personas about: "${chatPurpose}"
    
    ## PARTICIPANTS:
    ${agents.map(a => `- ${a.name} (${a.occupation})`).join('\n')}
    
    ## CONVERSATION (${chatHistory.length} messages):
    ${chatHistory.map(msg => {
        if (msg.type === 'user') return `User: ${msg.content}`;
        if (msg.type === 'agent') return `${msg.agent?.name}: ${msg.content}`;
        return `System: ${msg.content}`;
    }).join('\n\n')}
    
    ## SUMMARY REQUIREMENTS:
    Provide a concise 3-4 sentence summary covering:
    1. Main topics discussed
    2. Key insights from each persona
    3. Consensus or disagreements
    4. Actionable recommendations`;
    
    const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a professional meeting summarizer." },
            { role: "user", content: summaryPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
    });
    
    res.json({
        success: true,
        summary: response.choices[0].message.content,
        messageCount: chatHistory.length,
        timestamp: new Date().toISOString()
    });
});
```

### 5. Avatar Management System

#### Implementation
```javascript
// frontend/src/utils/avatar.js
export const getAvatarSrc = (agent) => {
    // Primary: Use agent's avatar_url if it's a valid HTTP URL
    if (agent.avatar_url && agent.avatar_url.startsWith('http')) {
        return agent.avatar_url;
    }
    
    // Secondary: If avatar_url is a relative path, prepend server URL
    if (agent.avatar_url && agent.avatar_url.startsWith('/')) {
        return `http://localhost:9001${agent.avatar_url}`;
    }
    
    // Fallback: Generate avatar using UI-Avatars API
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Persona')}&background=random&color=fff&size=200`;
};

export const handleAvatarError = (e, agentName = 'Persona') => {
    console.log('Avatar failed to load, falling back to initials');
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=random&color=fff&size=200`;
};
```

---

## 🚀 Deployment & Environment

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sirius_db
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Server Configuration
PORT=9001
NODE_ENV=production
JWT_SECRET=your-jwt-secret

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:9001/api
REACT_APP_WS_URL=ws://localhost:9001

# Environment
REACT_APP_ENV=production
```

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 9001

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sirius_db
      POSTGRES_USER: username
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://username:password@postgres:5432/sirius_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "9001:9001"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /uploads/ {
        proxy_pass http://backend:9001;
    }
}
```

---

## 🔧 Development Workflow

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git

### Setup Instructions

#### 1. Clone Repository
```bash
git clone https://github.com/arunmaroon/avinci-main.git
cd avinci-main
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 4. Database Setup
```bash
# Create database
createdb sirius_db

# Run migrations
psql sirius_db < migrations/001_initial_schema.sql
psql sirius_db < migrations/002_enhanced_schema.sql
psql sirius_db < migrations/003_chat_sessions.sql
```

### Development Commands

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
npm run migrate      # Run database migrations
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run linter
```

### Code Structure Guidelines

#### Backend
- **Routes**: Handle HTTP requests and responses
- **Services**: Business logic and external API calls
- **Models**: Database operations and data validation
- **Middleware**: Request processing and authentication

#### Frontend
- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Stores**: State management with Zustand
- **Utils**: Helper functions and API clients

---

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U username -d sirius_db

# Reset database
dropdb sirius_db && createdb sirius_db
```

#### 2. Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
sudo journalctl -u redis
```

#### 3. AI API Issues
```bash
# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Check API key validity
node -e "console.log(process.env.OPENAI_API_KEY ? 'Key exists' : 'Key missing')"
```

#### 4. Frontend Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
echo $REACT_APP_API_URL
```

#### 5. File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/

# Check file size limits
# Backend: Check multer limits
# Frontend: Check file size validation
```

### Performance Optimization

#### Backend
- **Database Indexing**: Add indexes on frequently queried columns
- **Redis Caching**: Cache frequently accessed data
- **Connection Pooling**: Use connection pooling for database
- **Rate Limiting**: Implement rate limiting for API endpoints

#### Frontend
- **Code Splitting**: Implement lazy loading for routes
- **Image Optimization**: Optimize avatar images
- **Bundle Analysis**: Analyze bundle size and optimize
- **Caching**: Implement proper caching strategies

### Monitoring & Logging

#### Backend Logging
```javascript
// backend/middleware/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console()
    ]
});

module.exports = logger;
```

#### Frontend Error Handling
```javascript
// frontend/src/utils/errorHandler.js
export const handleError = (error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
        // Sentry or similar service
    }
    
    // Show user-friendly message
    toast.error('Something went wrong. Please try again.');
};
```

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - Project overview and quick start
- `PROJECT_STRUCTURE.md` - Detailed project structure
- `QUICK_START.md` - Development setup guide
- `DEV_ENVIRONMENT.md` - Environment configuration
- `CLEANUP_SUMMARY.md` - Project cleanup documentation

### Scripts Directory
- `scripts/create-sample-agents.js` - Generate sample agents
- `scripts/create_indian_personas.js` - Create Indian personas
- `scripts/test-enhanced-agent.js` - Test agent functionality
- `scripts/update_agent_behaviors.js` - Update agent behaviors

### Tests Directory
- `tests/` - Legacy test files and examples
- `backend/tests/` - Backend test suites
- `frontend/tests/` - Frontend test suites

---

## 🎯 Conclusion

Sirius v2.04 is a comprehensive AI-powered UX research platform that combines advanced AI capabilities with modern web technologies. The platform's architecture is designed for scalability, maintainability, and extensibility.

### Key Strengths
- **Comprehensive Persona System**: 51-field data model with cultural authenticity
- **Advanced AI Integration**: GPT-4o Vision for detailed UI analysis
- **Modern Tech Stack**: React 18, Node.js, PostgreSQL, Redis
- **Professional UI/UX**: Magazine-style design with accessibility focus
- **Scalable Architecture**: Microservices-ready with proper separation of concerns

### Future Enhancements
- **Real-time Collaboration**: WebSocket integration for live collaboration
- **Advanced Analytics**: Detailed usage analytics and insights
- **Mobile App**: React Native mobile application
- **API Marketplace**: Third-party integrations and plugins
- **Enterprise Features**: SSO, advanced permissions, team management

This documentation provides a complete blueprint for understanding, maintaining, and extending the Sirius platform. The modular architecture and comprehensive feature set make it suitable for various UX research and design feedback use cases.

---

**Last Updated**: December 2024  
**Version**: Sirius v2.04  
**Maintainer**: Development Team
