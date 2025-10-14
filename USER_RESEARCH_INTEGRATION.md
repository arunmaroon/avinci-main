# User Research Integration - Agent Library Connection

## Overview
The User Research system now fully integrates with the Agent Library, allowing users to select real agents from their generated agent collection for simulated research sessions.

## Features Implemented

### 1. **Agent Library Integration**
- ✅ Fetches all agents from Agent Library (via API and localStorage)
- ✅ Supports multiple API endpoints (v5, legacy, localStorage fallback)
- ✅ Displays agent name, role, and avatar in selection UI
- ✅ Shows helpful message when no agents are available
- ✅ "Generate More Agents" button for quick navigation

### 2. **Backend Integration**
- ✅ Uses `getAllAgents()` function from agents model
- ✅ Maps agent IDs to real agent data with full persona information
- ✅ Enhanced simulation responses using agent personality, expertise, and quotes
- ✅ Graceful fallback when database is unavailable

### 3. **Enhanced Agent Display**
- ✅ Two-line chip design showing agent name and role
- ✅ Color-coded avatars for visual distinction
- ✅ Selected agents preview section
- ✅ Real-time validation for agent selection limits

### 4. **Session Simulation**
The simulator now uses real agent data:
- **Personality traits**: Influences response style
- **Expertise/Role**: Mentioned in responses for context
- **Key quotes**: Integrated into conversation naturally
- **Preferences**: Used for topic-specific insights

## How It Works

### Frontend Flow
1. User navigates to User Research page (`/user-research`)
2. System fetches agents from multiple sources:
   - Primary: `/api/agents/v5` endpoint
   - Fallback: `/api/agents` legacy endpoint
   - Final fallback: localStorage `generated_agents`
3. Agents displayed as selectable chips with name + role
4. User selects agents (1 for interview, 2-5 for group)
5. User enters topic and creates session
6. System navigates to session call page with real-time transcript

### Backend Flow
1. Receives session creation request with agent IDs
2. Fetches complete agent data from Agent Library
3. Extracts persona information (personality, quotes, expertise)
4. Generates human-like conversation using agent characteristics
5. Returns session log with timestamped messages

## API Integration

### Endpoints Used
```javascript
// Fetch agents
GET /api/agents/v5        // Primary endpoint
GET /api/agents           // Fallback endpoint
localStorage.getItem('generated_agents')  // Final fallback

// Session management
POST /api/sessions/create  // Create session with real agents
GET /api/sessions/:id      // Retrieve session transcript
GET /api/sessions          // List all sessions
```

### Data Flow
```
Agent Library → User Research → Session Simulator → Transcript Display
     ↓              ↓                  ↓                    ↓
  Database      Selection UI      Agent Personas      Chat Display
```

## Example Usage

### 1. Generate Agents (if needed)
Navigate to "Generate Agents" page and create AI agents with:
- Names and roles
- Personality traits
- Expertise areas
- Key phrases/quotes

### 2. Create Research Session
1. Go to "User Research" page
2. Select session type (Group or 1:1)
3. Pick agents from your Agent Library
4. Enter research topic
5. Click "Start Session"

### 3. View Results
- Real-time playback mode (2 seconds per message)
- Export transcript as text file
- View session metrics (duration, message count)
- Analyze conversation insights

## Technical Details

### Agent Data Structure
```javascript
{
  id: Number,
  name: String,
  role: String,
  personality: Array<String>,
  key_quotes: Array<String>,
  expertise: String,
  preferences: Object
}
```

### Session Log Format
```javascript
{
  id: Number,
  type: 'group' | '1on1',
  agent_ids: Array<Number>,
  topic: String,
  log_json: Array<{
    speaker: String,
    text: String,
    action: String,
    timestamp: String
  }>,
  duration_minutes: Number,
  created_at: Timestamp
}
```

## Benefits

1. **No Mock Data**: Real agents from your library
2. **Authentic Responses**: Uses agent personality and expertise
3. **Consistent Characters**: Same agents across multiple sessions
4. **Easy Scaling**: Add more agents to library anytime
5. **Rich Insights**: Leverages agent knowledge and traits

## Future Enhancements

- [ ] Integrate GPT-4o for more realistic responses
- [ ] Add vector embeddings for context-aware conversations
- [ ] Implement session analytics and insights extraction
- [ ] Support for custom moderator personas
- [ ] Session templates for common research scenarios
- [ ] Multi-language support for global research

## Troubleshooting

### No Agents Showing?
1. Check if agents exist in Agent Library
2. Generate new agents from "Generate Agents" page
3. Verify backend API is running on port 9001
4. Check browser console for error messages

### Session Not Creating?
1. Ensure at least one agent is selected
2. Enter a valid topic (non-empty)
3. Check agent count limits (1 for 1:1, 2-5 for group)
4. Verify backend connection

### Agents Not Loading in Simulator?
1. Check agent data structure in database
2. Verify `getAllAgents()` function is working
3. Review backend logs for errors
4. Confirm agent IDs match between frontend and backend

---

**Version**: Sirius 2.06  
**Last Updated**: 2025-10-13  
**Status**: ✅ Fully Integrated





