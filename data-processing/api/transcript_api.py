"""
FastAPI endpoints for transcript-to-persona mapping
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env at startup
load_dotenv()

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.transcript_mapper import map_transcripts

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Avinci Transcript Mapping API",
    description="Map user transcripts to comprehensive persona JSON",
    version="0.3.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9000", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranscriptMapRequest(BaseModel):
    """Request model for transcript mapping"""
    transcripts: List[str] = Field(..., description="List of transcript strings to process")
    source_files: Optional[List[str]] = Field(default=None, description="Optional list of source file names")


class TranscriptMapResponse(BaseModel):
    """Response model for transcript mapping"""
    personas: List[Dict[str, Any]] = Field(..., description="List of extracted personas")
    success: bool = Field(default=True)
    count: int = Field(..., description="Number of personas extracted")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Avinci Transcript Mapping API",
        "version": "0.3.0",
        "status": "online"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/map-transcripts", response_model=TranscriptMapResponse)
async def map_transcripts_endpoint(request: TranscriptMapRequest):
    """
    Map transcripts to persona JSONs
    
    Args:
        request: TranscriptMapRequest with list of transcripts
        
    Returns:
        TranscriptMapResponse with extracted personas
    """
    try:
        logger.info(f"Received request to map {len(request.transcripts)} transcripts")
        
        # Validate input
        if not request.transcripts:
            raise HTTPException(status_code=400, detail="No transcripts provided")
        
        if len(request.transcripts) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 transcripts per request")
        
        # Map transcripts
        personas = map_transcripts(request.transcripts)
        
        # Update source_meta with provided file names if available
        if request.source_files and len(request.source_files) == len(personas):
            for idx, persona in enumerate(personas):
                if "source_meta" in persona:
                    persona["source_meta"]["source_file"] = request.source_files[idx]
        
        logger.info(f"Successfully mapped {len(personas)} personas")
        
        return TranscriptMapResponse(
            personas=personas,
            success=True,
            count=len(personas)
        )
        
    except Exception as e:
        logger.error(f"Error mapping transcripts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing transcripts: {str(e)}")


@app.post("/process-transcripts")
async def process_transcripts_endpoint(
    transcripts: List[str] = Body(..., embed=True)
):
    """
    Legacy endpoint for backward compatibility
    
    Args:
        transcripts: List of transcript strings
        
    Returns:
        Dict with personas list
    """
    try:
        logger.info(f"Processing {len(transcripts)} transcripts (legacy endpoint)")
        
        personas = map_transcripts(transcripts)
        
        return {
            "success": True,
            "personas": personas,
            "count": len(personas)
        }
        
    except Exception as e:
        logger.error(f"Error processing transcripts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("DATA_PROCESSING_PORT", "8001"))
    
    logger.info(f"Starting Avinci Transcript Mapping API on port {port}")
    
    uvicorn.run(
        "transcript_api:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

