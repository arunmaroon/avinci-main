"""
FastAPI server for Avinci data processing with real-time call support
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

from services.call_simulator import CallSimulator

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Avinci Data Processing API", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
call_simulator = CallSimulator()

# Database connection
def get_db_connection():
    """Get PostgreSQL database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'avinci'),
        user=os.getenv('DB_USER', 'avinci_admin'),
        password=os.getenv('DB_PASSWORD', 'postgres')
    )

# Request/Response models
class ProcessInputRequest(BaseModel):
    transcript: str
    callId: str
    type: str = 'group'  # 'group' or '1on1'

class ProcessInputResponse(BaseModel):
    responseText: str
    agentName: str
    region: str
    delay: int = 0

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Avinci Data Processing",
        "status": "running",
        "version": "2.0",
        "features": ["call_simulation", "indian_accents"]
    }

@app.post("/process-input", response_model=ProcessInputResponse)
async def process_call_input(request: ProcessInputRequest):
    """
    Process user speech input and generate agent response
    
    - Fetches call details and agents from database
    - Generates contextual response using agent personas
    - Returns response text with region for TTS accent selection
    """
    try:
        # Fetch call details from database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get call details
        cursor.execute(
            "SELECT agent_ids, topic, status FROM voice_calls WHERE id = %s",
            (request.callId,)
        )
        call = cursor.fetchone()
        
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        if call['status'] != 'open':
            raise HTTPException(status_code=400, detail="Call is not active")
        
        agent_ids = call['agent_ids']
        topic = call['topic'] or 'general discussion'
        
        # Fetch agent personas with ALL rich persona data
        cursor.execute(
            """
            SELECT 
                id, name, location, age, gender, education, income_range,
                background, demographics, personality, traits, behaviors,
                objectives, needs, fears, apprehensions, motivations, frustrations,
                domain_literacy, tech_savviness, communication_style, speech_patterns,
                vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                background_story, system_prompt, master_system_prompt,
                key_quotes, cultural_background, social_context
            FROM ai_agents 
            WHERE id = ANY(%s)
            """,
            (agent_ids,)
        )
        agents = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not agents:
            raise HTTPException(status_code=404, detail="No agents found for this call")
        
        # Convert agents to dictionaries with ALL persona data for authentic responses
        agent_list = []
        for agent in agents:
            location = agent.get('location', '')
            demographics = agent.get('demographics', {})
            
            agent_list.append({
                'name': agent['name'],
                'location': location,
                'demographics': demographics or {
                    'age': agent.get('age'),
                    'gender': agent.get('gender'),
                    'education': agent.get('education'),
                    'income_range': agent.get('income_range')
                },
                'traits': agent.get('traits', {}),
                'behaviors': agent.get('behaviors', {}),
                'communication_style': agent.get('communication_style', {}),
                'speech_patterns': agent.get('speech_patterns', {}),
                'vocabulary_profile': agent.get('vocabulary_profile', {}),
                'emotional_profile': agent.get('emotional_profile', {}),
                'cognitive_profile': agent.get('cognitive_profile', {}),
                'objectives': agent.get('objectives', []),
                'needs': agent.get('needs', []),
                'fears': agent.get('fears', []),
                'apprehensions': agent.get('apprehensions', []),
                'motivations': agent.get('motivations', []),
                'frustrations': agent.get('frustrations', []),
                'tech_savviness': agent.get('tech_savviness', 'medium'),
                'domain_literacy': agent.get('domain_literacy', {}),
                'knowledge_bounds': agent.get('knowledge_bounds', {}),
                'background_story': agent.get('background_story', ''),
                'system_prompt': agent.get('master_system_prompt') or agent.get('system_prompt', ''),
                'cultural_background': agent.get('cultural_background', {}),
                'social_context': agent.get('social_context', {}),
                'key_quotes': agent.get('key_quotes', [])
            })
        
        # Process input and generate response
        if request.type == 'group':
            # For group calls, generate multiple responses with overlaps
            results = await call_simulator.simulate_group_overlap(
                transcript=request.transcript,
                call_id=request.callId,
                agents=agent_list,
                topic=topic
            )
            # Return the first response for now, but log all responses
            if results:
                logger.info(f"Group call generated {len(results)} responses")
                for i, res in enumerate(results):
                    logger.info(f"Response {i+1}: {res.get('agentName', 'Unknown')} - {res.get('responseText', '')[:50]}...")
                result = results[0]
            else:
                result = {'responseText': '', 'agentName': '', 'region': 'north'}
        else:
            # For 1:1 calls, single response
            result = await call_simulator.process_input(
                transcript=request.transcript,
                call_id=request.callId,
                session_type=request.type,
                agents=agent_list,
                topic=topic
            )
        
        return ProcessInputResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing input: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-group-overlap")
async def process_group_overlap(request: ProcessInputRequest):
    """
    Generate multiple agent responses with natural overlaps
    For rich group dynamics
    """
    try:
        # Fetch call and agents (similar to process-input)
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            "SELECT agent_ids, topic FROM voice_calls WHERE id = %s",
            (request.callId,)
        )
        call = cursor.fetchone()
        
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        agent_ids = call['agent_ids']
        topic = call['topic'] or 'general discussion'
        
        # Fetch ALL rich persona data (same as process-input)
        cursor.execute(
            """
            SELECT 
                id, name, location, age, gender, education, income_range,
                background, demographics, personality, traits, behaviors,
                objectives, needs, fears, apprehensions, motivations, frustrations,
                domain_literacy, tech_savviness, communication_style, speech_patterns,
                vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                background_story, system_prompt, master_system_prompt,
                key_quotes, cultural_background, social_context
            FROM ai_agents 
            WHERE id = ANY(%s)
            """,
            (agent_ids,)
        )
        agents = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Convert agents to dictionaries with ALL persona data for authentic responses
        agent_list = []
        for agent in agents:
            location = agent.get('location', '')
            demographics = agent.get('demographics', {})
            
            agent_list.append({
                'name': agent['name'],
                'location': location,
                'demographics': demographics or {
                    'age': agent.get('age'),
                    'gender': agent.get('gender'),
                    'education': agent.get('education'),
                    'income_range': agent.get('income_range')
                },
                'traits': agent.get('traits', {}),
                'behaviors': agent.get('behaviors', {}),
                'communication_style': agent.get('communication_style', {}),
                'speech_patterns': agent.get('speech_patterns', {}),
                'vocabulary_profile': agent.get('vocabulary_profile', {}),
                'emotional_profile': agent.get('emotional_profile', {}),
                'cognitive_profile': agent.get('cognitive_profile', {}),
                'objectives': agent.get('objectives', []),
                'needs': agent.get('needs', []),
                'fears': agent.get('fears', []),
                'apprehensions': agent.get('apprehensions', []),
                'motivations': agent.get('motivations', []),
                'frustrations': agent.get('frustrations', []),
                'tech_savviness': agent.get('tech_savviness', 'medium'),
                'domain_literacy': agent.get('domain_literacy', {}),
                'knowledge_bounds': agent.get('knowledge_bounds', {}),
                'background_story': agent.get('background_story', ''),
                'system_prompt': agent.get('master_system_prompt') or agent.get('system_prompt', ''),
                'cultural_background': agent.get('cultural_background', {}),
                'social_context': agent.get('social_context', {}),
                'key_quotes': agent.get('key_quotes', [])
            })
        
        # Generate multiple responses with overlaps
        responses = await call_simulator.simulate_group_overlap(
            transcript=request.transcript,
            call_id=request.callId,
            agents=agent_list,
            topic=topic
        )
        
        # Return responses directly as array
        return responses
        
    except Exception as e:
        logger.error(f"Error processing group overlap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

