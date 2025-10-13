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
        user=os.getenv('DB_USER', 'postgres'),
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
        
        # Fetch agent personas
        cursor.execute(
            """
            SELECT 
                id, name, persona, demographics, background, 
                psychological_profile, behavioral_traits
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
        
        # Convert agents to dictionaries with region info
        agent_list = []
        for agent in agents:
            demographics = agent.get('demographics', {})
            region = 'north'  # Default
            
            # Extract region from demographics
            if demographics and isinstance(demographics, dict):
                location = demographics.get('location', '')
                if any(city in location for city in ['Delhi', 'Chandigarh', 'Jaipur', 'Lucknow']):
                    region = 'north'
                elif any(city in location for city in ['Mumbai', 'Pune', 'Ahmedabad']):
                    region = 'west'
                elif any(city in location for city in ['Bangalore', 'Chennai', 'Hyderabad']):
                    region = 'south'
                elif any(city in location for city in ['Kolkata', 'Bhubaneswar']):
                    region = 'east'
            
            agent_list.append({
                'name': agent['name'],
                'persona': agent.get('persona', ''),
                'background': agent.get('background', ''),
                'region': region,
                'psychological_profile': agent.get('psychological_profile', {}),
                'behavioral_traits': agent.get('behavioral_traits', {})
            })
        
        # Process input and generate response
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
        
        cursor.execute(
            "SELECT id, name, persona, demographics, background FROM ai_agents WHERE id = ANY(%s)",
            (agent_ids,)
        )
        agents = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        agent_list = [
            {
                'name': a['name'],
                'persona': a.get('persona', ''),
                'background': a.get('background', ''),
                'region': 'north'  # Simplified for now
            }
            for a in agents
        ]
        
        # Generate multiple responses with overlaps
        responses = await call_simulator.simulate_group_overlap(
            transcript=request.transcript,
            call_id=request.callId,
            agents=agent_list,
            topic=topic
        )
        
        return {"responses": responses}
        
    except Exception as e:
        logger.error(f"Error processing group overlap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

