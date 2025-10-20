"""
Data Processing API
FastAPI endpoints for data processing operations
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from services.comprehensive_transcript_processor import process_transcripts_comprehensive

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Avinci Data Processing API", version="1.0.0")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK", "service": "Data Processing API", "version": "1.0.0"}

class TranscriptRequest(BaseModel):
    transcripts: List[str]
    source_files: Optional[List[str]] = None

class TranscriptResponse(BaseModel):
    success: bool
    personas: List[Dict[str, Any]]
    total_transcripts: int
    total_personas: int
    error: Optional[str] = None

@app.post("/process-transcripts", response_model=TranscriptResponse)
async def process_transcripts_endpoint(request: TranscriptRequest):
    """
    Process transcripts and extract comprehensive AI personas with 50+ fields
    """
    try:
        logger.info(f"Processing {len(request.transcripts)} transcripts with comprehensive extraction")
        
        result = process_transcripts_comprehensive(
            transcripts=request.transcripts,
            source_files=request.source_files
        )
        
        return TranscriptResponse(
            success=result["success"],
            personas=result["personas"],
            total_transcripts=result["total_transcripts"],
            total_personas=result["total_personas"],
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error processing transcripts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "data-processing"}

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {"message": "Avinci Data Processing API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
