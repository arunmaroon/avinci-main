# Agent Library Integration Fix

## Problem
User Research page was showing "No agents found" despite having 51 agents in the database.

## Root Cause
1. **Wrong table reference**: Code was trying to import from non-existent `models/agents.js`
2. **Wrong endpoint**: Frontend was trying multiple generic agent endpoints instead of database-backed endpoint
3. **Table mismatch**: Agents are stored in `ai_agents` table, not `agents` table

## Solution Implemented

### 1. Created Dedicated Research Agents Endpoint
**File**: `backend/routes/agentsForResearch.js`
- Queries `ai_agents` table directly
- Returns all 51 active agents
- Formats data specifically for User Research UI
- Includes all necessary fields: name, role, personality, quotes, etc.

### 2. Fixed Backend Sessions Route
**File**: `backend/routes/sessions.js`
- Added `getAllAgents()` function to query `ai_agents` table
- Fixed agent data mapping to use correct database fields
- Enhanced response generation using real agent personalities and expertise
- Fixed template literal syntax error

### 3. Updated Frontend to Use New Endpoint
**File**: `frontend/src/pages/UserResearch.jsx`
- Changed to use `/api/research-agents` endpoint
- Added better error messages
- Improved logging for debugging
- Shows all 51 agents from database

### 4. Added Route to Server
**File**: `backend/server.js`
- Registered `/api/research-agents` route
- Positioned before sessions route for proper loading order

## Database Structure
Agents are stored in `ai_agents` table with columns:
- `id` (UUID)
- `name` (VARCHAR)
- `occupation` (as role)
- `age`, `gender`, `location`
- `personality` (JSONB)
- `goals`, `pain_points`, `motivations` (arrays)
- `sample_quote`, `tone`, `background_story`
- `is_active` (boolean filter)

## API Endpoints

### GET /api/research-agents
Returns all active agents formatted for research:
```json
{
  "success": true,
  "count": 51,
  "agents": [
    {
      "id": "uuid",
      "name": "Agent Name",
      "role": "Occupation",
      "avatar": "AN",
      "age": 30,
      "personality": ["trait1", "trait2"],
      "goals": ["goal1"],
      "sample_quote": "Quote"
    }
  ]
}
```

### POST /api/sessions/create
Uses real agent data from `ai_agents` table:
```json
{
  "type": "group" | "1on1",
  "agentIds": ["uuid1", "uuid2"],
  "topic": "Research topic"
}
```

## Verification

```bash
# Test endpoint
curl http://localhost:9001/api/research-agents

# Should return:
# {"success":true,"count":51,"agents":[...]}
```

## Benefits
✅ All 51 agents now available for User Research  
✅ Real agent personalities used in simulations  
✅ Authentic responses based on agent expertise  
✅ Direct database queries (no mock data)  
✅ Proper error handling and logging  

## Files Modified
1. `backend/routes/agentsForResearch.js` - NEW
2. `backend/routes/sessions.js` - FIXED
3. `backend/server.js` - UPDATED
4. `frontend/src/pages/UserResearch.jsx` - UPDATED
5. `USER_RESEARCH_INTEGRATION.md` - DOCUMENTATION
6. `AGENTS_INTEGRATION_FIX.md` - THIS FILE

---

## Update: Fixed Sessions Table Type Mismatch (2025-10-14)

### Problem
Sessions table was using `INTEGER[]` for `agent_ids` but `ai_agents` table uses `UUID` for `id` column, causing type mismatch errors when creating sessions.

### Solution
1. Updated migration `003_create_sessions_table.sql` to use `UUID[]` instead of `INTEGER[]` for `agent_ids`
2. Dropped and recreated sessions table with correct UUID[] type
3. Verified table schema matches agent ID types

### Database Fix
```sql
-- Updated schema
agent_ids UUID[] NOT NULL  -- Changed from INTEGER[]
```

---

## Update: Fixed Image Upload Response in Audio Calls (2025-10-14)

### Problem
Image uploads in audio calls were not being included in agent responses. While the image uploaded successfully, the `ui_path` was not being sent with speech requests, so agents couldn't analyze the uploaded images.

### Root Cause
1. Audio Call uploads image and stores path in `uploadedImagePath` state
2. But when processing speech via `/api/call/process-speech`, the `ui_path` was NOT included in the request
3. Backend didn't accept or forward `ui_path` to data-processing service
4. Group Chat had working implementation that was not replicated in Audio Call

### Solution Implemented

#### Backend Changes (`backend/routes/calls.js`)
1. Updated `/api/call/process-speech` endpoint to accept `ui_path` parameter
2. Load `ui_path` from database (stored during upload) as fallback
3. Pass `ui_path` to data-processing service for both group and 1:1 calls
4. Updated group overlap endpoint call to include `ui_path`
5. Updated fallback single response calls to include `ui_path`

```javascript
// Extract ui_path from request
const { audio, callId, type, transcript, ui_path } = req.body;

// Get ui_path from database as fallback
const callRow = await pool.query('SELECT agent_ids, ui_path FROM voice_calls WHERE id = $1', [callId]);
const effectiveUiPath = ui_path || ui_path_from_call;

// Pass to data-processing
await axios.post('/process-group-overlap', { 
  transcript, callId, type, agentIds, 
  ui_path: effectiveUiPath 
});
```

#### Frontend Changes (`frontend/src/pages/AudioCall.jsx`)
1. Include `uploadedImagePath` in speech processing requests
2. Updated both transcript-direct and audio-processing paths
3. Consistent with Group Chat implementation

```javascript
// Send with ui_path
await axios.post('/api/call/process-speech', {
  callId,
  type,
  transcript: speechTranscript,
  ui_path: uploadedImagePath  // Now included!
});
```

### How It Works Now
1. User uploads image → stored in `uploadedImagePath` state + database
2. User speaks → transcript captured
3. Frontend sends transcript + `ui_path` to backend
4. Backend forwards `ui_path` to data-processing service
5. Agents receive image context and provide relevant feedback
6. Same flow as working Group Chat implementation

---

**Status**: ✅ FIXED - All 51 agents now loading correctly  
**Database**: ✅ FIXED - Sessions table type mismatch resolved  
**Audio Call Images**: ✅ FIXED - Image upload responses now working  
**Verified**: Backend returning 51 agents from `ai_agents` table  
**Version**: Sirius 2.07



