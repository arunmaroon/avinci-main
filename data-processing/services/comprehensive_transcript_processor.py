"""
Comprehensive Transcript Processor for Rich AI Agent Persona Generation
Uses GPT-4o to extract detailed personas with 50+ fields
"""

import os
import json
import re
from typing import List, Dict, Any, Optional
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
import logging
from datetime import datetime

from services.comprehensive_persona_models import ComprehensivePersona

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComprehensiveTranscriptProcessor:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,
            max_tokens=4096
        )
        self.parser = PydanticOutputParser(pydantic_object=ComprehensivePersona)
        
    def extract_personas_from_transcript(self, transcript: str, source_file: str = "") -> List[Dict[str, Any]]:
        """
        Extract comprehensive personas from transcript
        """
        try:
            # Count respondents
            persona_count = self._count_respondents(transcript)
            logger.info(f"Identified {persona_count} respondent(s) in transcript")
            
            personas = []
            
            if persona_count == 1:
                persona = self._extract_single_persona(transcript, source_file)
                if persona:
                    personas.append(persona)
            else:
                for i in range(persona_count):
                    persona = self._extract_persona_by_index(transcript, i, source_file)
                    if persona:
                        personas.append(persona)
            
            return personas
            
        except Exception as e:
            logger.error(f"Error extracting personas: {str(e)}")
            return []
    
    def _count_respondents(self, transcript: str) -> int:
        """Count number of respondents in transcript"""
        try:
            prompt = f"""
            Count how many RESPONDENTS are being interviewed in this transcript.
            
            IMPORTANT:
            - "Moderator:", "Interviewer:", "Researcher:" = Person asking questions (DO NOT COUNT)
            - "Respondent:", participant names = Users being interviewed (COUNT THESE)
            
            Only count respondents, not the moderator.
            
            Transcript: {transcript[:2000]}...
            
            Return ONLY a number (1, 2, 3, etc.).
            """
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            count = int(re.findall(r'\d+', response.content)[0]) if re.findall(r'\d+', response.content) else 1
            return count
            
        except Exception as e:
            logger.error(f"Error counting respondents: {str(e)}")
            return 1
    
    def _extract_single_persona(self, transcript: str, source_file: str) -> Optional[Dict[str, Any]]:
        """Extract comprehensive persona from single-respondent transcript"""
        try:
            format_instructions = self.parser.get_format_instructions()
            
            prompt = f"""
Extract a COMPREHENSIVE persona from this user research transcript with ALL available details.

🎯 CRITICAL INSTRUCTIONS:
1. **Source Identification**:
   - "Moderator:" = Researcher asking questions (IGNORE their statements)
   - "Respondent:" = User being interviewed (EXTRACT ALL their information)
   - Extract ONLY from Respondent's answers, use Moderator for context only

2. **Extraction Guidelines**:
   - Extract EXACT information from Respondent's words
   - For location: Split into city and state (e.g., "Bangalore" → city: "Bangalore", state: "Karnataka")
   - For profession: Include occupation AND detailed background (income, work history, transitions)
   - For quotes: Use EXACT quotes from Respondent only
   - Infer missing details logically from context

3. **Rich Data Extraction**:
   - **Personality**: Extract traits from communication style (frank, practical, humorous, etc.)
   - **Values**: Identify what they care about (transparency, discipline, etc.)
   - **Motivations**: What drives them (independence, security, etc.)
   - **Hobbies**: All leisure activities mentioned
   - **Goals**: Split into short-term (weeks/months) and long-term (years)
   - **Pain Points**: General frustrations AND UI/UX specific issues
   - **Financial Profile**: ALL apps, banks, cards with limits if mentioned, payment habits
   - **Communication**: Tone and vocabulary level (e.g., "conversational Hinglish")
   - **Emotional Profile**: Triggers, responses, overall tone
   - **Social Context**: Family dynamics, friends, community values
   - **Cultural Background**: Heritage, beliefs, digital vs traditional preferences
   - **Daily Routine**: Morning, afternoon, evening activities
   - **Decision Making**: Style (calculated, impulsive) and influences
   - **Life Events**: Significant events with years and impact
   - **Tech Profile**: Tech savviness level and English proficiency
   - **Behavioral Patterns**: Habits and weekly/monthly routines
   - **Relational Dynamics**: How they interact with family, friends, professionals
   - **Cognitive Biases**: Loss aversion, confirmation bias, etc. observed in transcript
   - **Sensory Preferences**: Preferred and disliked modalities (visual, audio, etc.)
   - **Humor Style**: Type and level of humor used
   - **Conflict Resolution**: How they handle disputes
   - **Learning Style**: How they prefer to learn (self-taught, courses, etc.)
   - **Ethical Stance**: Financial ethics, scam sensitivity
   - **Interaction Preferences**: Preferred channels (app chat, phone), response time expectations
   - **Trust Factors**: What builds/breaks trust for them
   - **Motivational Triggers**: Positive (cashback, low rates) and negative (fees, rejections)

4. **Examples**:
   - Respondent: "I'm Abdul, 24, from Bangalore" → name: "Abdul", age: 24, location: {{city: "Bangalore", state: "Karnataka"}}
   - Respondent: "I use PhonePe daily" → financial_profile.fintech_preferences.apps: ["PhonePe"]
   - Respondent: "Hidden charges annoy me" → pain_points.general: ["hidden charges"]
   - Respondent: "I make 30k/month, volatile" → profession.background: "Income ~30k/month (volatile)"

📄 TRANSCRIPT:
{transcript}

🔧 OUTPUT FORMAT:
{format_instructions}

Return a complete JSON object with ALL extracted fields.
"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            persona_data = self.parser.parse(response.content)
            
            # Convert to dict and enhance
            persona_dict = persona_data.dict()
            persona_dict['source_meta']['source_file'] = source_file
            persona_dict['source_meta']['timestamps'] = [datetime.utcnow().isoformat()]
            persona_dict['source_meta']['confidence_score'] = self._calculate_confidence_score(persona_dict)
            
            return persona_dict
            
        except Exception as e:
            logger.error(f"Error extracting single persona: {str(e)}")
            logger.error(f"Error details: {repr(e)}")
            return None
    
    def _extract_persona_by_index(self, transcript: str, index: int, source_file: str) -> Optional[Dict[str, Any]]:
        """Extract specific persona from multi-respondent transcript"""
        try:
            format_instructions = self.parser.get_format_instructions()
            
            prompt = f"""
Extract RESPONDENT #{index + 1} from this multi-respondent research transcript.

IMPORTANT:
- "Moderator:" = Researcher (IGNORE)
- "Respondent:" or names = Users (EXTRACT #{index + 1} only)

Focus ONLY on respondent #{index + 1}. Extract ALL their information as comprehensively as possible.

Transcript: {transcript}

{format_instructions}
"""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            persona_data = self.parser.parse(response.content)
            
            persona_dict = persona_data.dict()
            persona_dict['source_meta']['source_file'] = source_file
            persona_dict['source_meta']['timestamps'] = [datetime.utcnow().isoformat()]
            persona_dict['source_meta']['confidence_score'] = self._calculate_confidence_score(persona_dict)
            
            return persona_dict
            
        except Exception as e:
            logger.error(f"Error extracting persona {index}: {str(e)}")
            return None
    
    def _calculate_confidence_score(self, persona_dict: Dict[str, Any]) -> float:
        """Calculate confidence score based on completeness"""
        try:
            # Critical fields that should be present
            critical_fields = ['name', 'age', 'gender', 'location', 'profession']
            critical_present = sum(1 for field in critical_fields if persona_dict.get(field))
            critical_score = critical_present / len(critical_fields)
            
            # Rich data fields
            rich_fields = [
                'personality', 'goals', 'pain_points', 'financial_profile',
                'communication_style', 'emotional_profile', 'social_context',
                'cultural_background', 'daily_routine', 'decision_making',
                'life_events', 'key_quotes', 'behavioral_patterns'
            ]
            rich_present = sum(1 for field in rich_fields if persona_dict.get(field) and persona_dict[field])
            rich_score = rich_present / len(rich_fields)
            
            # Weighted final score (70% critical, 30% rich)
            final_score = (critical_score * 0.7) + (rich_score * 0.3)
            return round(final_score, 2)
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5

def process_transcripts_comprehensive(transcripts: List[str], source_files: List[str] = None) -> Dict[str, Any]:
    """
    Main function to process transcripts and extract comprehensive personas
    """
    try:
        if source_files is None:
            source_files = [f"transcript_{i+1}.txt" for i in range(len(transcripts))]
        
        processor = ComprehensiveTranscriptProcessor()
        all_personas = []
        
        for i, transcript in enumerate(transcripts):
            logger.info(f"Processing transcript {i+1}/{len(transcripts)}")
            
            if not transcript.strip():
                logger.warning(f"Empty transcript {i+1}, skipping")
                continue
            
            source_file = source_files[i] if i < len(source_files) else f"transcript_{i+1}.txt"
            personas = processor.extract_personas_from_transcript(transcript, source_file)
            all_personas.extend(personas)
        
        logger.info(f"Successfully extracted {len(all_personas)} personas from {len(transcripts)} transcripts")
        
        return {
            "success": True,
            "personas": all_personas,
            "total_transcripts": len(transcripts),
            "total_personas": len(all_personas)
        }
        
    except Exception as e:
        logger.error(f"Error processing transcripts: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "personas": [],
            "total_transcripts": len(transcripts),
            "total_personas": 0
        }

