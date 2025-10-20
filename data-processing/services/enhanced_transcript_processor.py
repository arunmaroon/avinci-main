"""
Enhanced Transcript Processor for AI Agent Persona Generation
Uses LangChain and LangGraph for sophisticated persona extraction
"""

import os
import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FintechPreferences(BaseModel):
    apps: List[str] = Field(default_factory=list, description="Financial apps used")
    banks: List[str] = Field(default_factory=list, description="Banks used")
    payment_habits: List[str] = Field(default_factory=list, description="Payment preferences")
    credit_cards: List[str] = Field(default_factory=list, description="Credit cards used")

class EmotionalProfile(BaseModel):
    triggers: List[str] = Field(default_factory=list, description="Emotional triggers")
    responses: List[str] = Field(default_factory=list, description="Emotional responses")
    tone: str = Field(default="neutral", description="Overall emotional tone")

class SocialContext(BaseModel):
    family: str = Field(default="", description="Family situation")
    friends: str = Field(default="", description="Social circle")
    community_values: List[str] = Field(default_factory=list, description="Community values")

class CulturalBackground(BaseModel):
    heritage: str = Field(default="", description="Cultural heritage")
    beliefs: List[str] = Field(default_factory=list, description="Religious/cultural beliefs")
    traditions: List[str] = Field(default_factory=list, description="Cultural traditions")

class LifeEvent(BaseModel):
    event: str = Field(description="Life event description")
    year: int = Field(description="Year of event")
    impact: str = Field(description="Impact on person")

class DecisionMaking(BaseModel):
    style: str = Field(default="analytical", description="Decision making style")
    influences: List[str] = Field(default_factory=list, description="Key influences")

class EnhancedPersona(BaseModel):
    # Basic Information
    name: str = Field(description="Full name")
    age: int = Field(description="Age in years")
    gender: str = Field(description="Gender identity")
    occupation: str = Field(description="Primary occupation")
    location: str = Field(description="City, State format (e.g., Bangalore, Karnataka)")
    
    # Background
    background: str = Field(default="", description="Professional background")
    personality: List[str] = Field(default_factory=list, description="Personality traits")
    hobbies: List[str] = Field(default_factory=list, description="Hobbies and interests")
    
    # Financial Profile
    fintech_preferences: FintechPreferences = Field(default_factory=FintechPreferences)
    
    # Pain Points
    pain_points: List[str] = Field(default_factory=list, description="General pain points")
    ui_pain_points: List[str] = Field(default_factory=list, description="UI/UX pain points")
    
    # Communication
    key_quotes: List[str] = Field(default_factory=list, description="Key quotes from transcript")
    
    # Goals and Motivation
    goals: List[str] = Field(default_factory=list, description="Life and career goals")
    motivations: List[str] = Field(default_factory=list, description="Core motivations")
    values: List[str] = Field(default_factory=list, description="Core values")
    
    # Emotional Profile
    emotional_profile: EmotionalProfile = Field(default_factory=EmotionalProfile)
    
    # Social Context
    social_context: SocialContext = Field(default_factory=SocialContext)
    
    # Cultural Background
    cultural_background: CulturalBackground = Field(default_factory=CulturalBackground)
    
    # Daily Life
    daily_routine: List[str] = Field(default_factory=list, description="Daily routine patterns")
    
    # Decision Making
    decision_making: DecisionMaking = Field(default_factory=DecisionMaking)
    
    # Life Events
    life_events: List[LifeEvent] = Field(default_factory=list, description="Significant life events")
    
    # Technical Profile
    tech_savviness: str = Field(default="intermediate", description="Technology comfort level")
    english_level: str = Field(default="intermediate", description="English proficiency")
    
    # Source Information
    source_file: str = Field(default="", description="Source transcript file")
    confidence_score: float = Field(default=0.0, description="Extraction confidence (0-1)")

class EnhancedTranscriptProcessor:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,
            max_tokens=4000
        )
        self.parser = PydanticOutputParser(pydantic_object=EnhancedPersona)
        
    def extract_personas_from_transcript(self, transcript: str, source_file: str = "") -> List[Dict[str, Any]]:
        """
        Extract multiple personas from a single transcript
        """
        try:
            # First, identify how many distinct personas are in the transcript
            persona_count_prompt = f"""
            Analyze this user research transcript and identify how many RESPONDENTS are being interviewed.
            
            IMPORTANT: 
            - "Moderator:", "Interviewer:", or "Researcher:" = The person asking questions (DO NOT COUNT)
            - "Respondent:", participant names, or people answering = Users to extract (COUNT THESE)
            
            Look for:
            - Different respondent names mentioned
            - Different respondent speaking patterns
            - Different respondent backgrounds/occupations
            - Multiple people being interviewed
            
            Only count the RESPONDENTS/USERS being interviewed, NOT the moderator/interviewer.
            
            Transcript: {transcript[:2000]}...
            
            Return only a number (e.g., 1, 2, 3) representing the count of distinct RESPONDENTS.
            If there's one moderator and one respondent, return 1.
            """
            
            count_response = self.llm.invoke([HumanMessage(content=persona_count_prompt)])
            persona_count = int(re.findall(r'\d+', count_response.content)[0]) if re.findall(r'\d+', count_response.content) else 1
            
            logger.info(f"Identified {persona_count} personas in transcript")
            
            personas = []
            
            if persona_count == 1:
                # Single persona - extract directly
                persona = self._extract_single_persona(transcript, source_file)
                if persona:
                    personas.append(persona)
            else:
                # Multiple personas - split transcript and extract each
                for i in range(persona_count):
                    persona = self._extract_persona_by_index(transcript, i, source_file)
                    if persona:
                        personas.append(persona)
            
            return personas
            
        except Exception as e:
            logger.error(f"Error extracting personas: {str(e)}")
            return []
    
    def _extract_single_persona(self, transcript: str, source_file: str) -> Optional[Dict[str, Any]]:
        """Extract a single persona from transcript"""
        try:
            prompt = PromptTemplate(
                template="""
                Extract a comprehensive persona from this user research transcript with exact details.
                
                IMPORTANT: This transcript follows a research interview format:
                - "Moderator:" is the researcher asking questions (IGNORE their statements)
                - "Respondent:" is the user being interviewed (EXTRACT ALL their information)
                
                You must ONLY extract information from the Respondent's answers. 
                The Moderator's questions should be used for context but NOT as persona data.
                
                Instructions:
                1. Extract ALL available information ONLY from the Respondent's responses
                2. For location, include city and state (e.g., "Bangalore, Karnataka")
                3. For quotes, use exact quotes ONLY from the Respondent (not Moderator)
                4. Infer missing information logically based on Respondent's context
                5. For fintech preferences, extract any apps, banks, payment methods the Respondent mentions
                6. For pain points, extract both general and UI-specific issues the Respondent mentions
                7. For cultural background, infer from Respondent's name, location, and cultural references
                8. For emotional profile, analyze the Respondent's tone and emotional expressions
                9. For life events, extract any significant events the Respondent mentions with years
                10. For personality, analyze the Respondent's communication style, word choices, and attitudes
                
                Example extraction:
                Respondent: "My name is Abdul, I live in Bangalore" → name: "Abdul", location: "Bangalore, Karnataka"
                Respondent: "I use PhonePe for payments" → fintech_preferences.apps: ["PhonePe"]
                Respondent: "Hidden charges are a big problem" → pain_points: ["hidden charges"]
                
                If the transcript doesn't use "Moderator:" and "Respondent:" labels, then:
                - Look for "Interviewer:", "Researcher:", or similar as the questioner
                - Extract from all other speakers who are answering questions
                
                Transcript: {transcript}
                
                {format_instructions}
                """,
                input_variables=["transcript"],
                partial_variables={"format_instructions": self.parser.get_format_instructions()}
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt.format(transcript=transcript))])
            persona_data = self.parser.parse(response.content)
            
            # Add source file and calculate confidence
            persona_dict = persona_data.dict()
            persona_dict['source_file'] = source_file
            persona_dict['confidence_score'] = self._calculate_confidence_score(persona_dict)
            
            return persona_dict
            
        except Exception as e:
            logger.error(f"Error extracting single persona: {str(e)}")
            return None
    
    def _extract_persona_by_index(self, transcript: str, index: int, source_file: str) -> Optional[Dict[str, Any]]:
        """Extract a specific persona by index from multi-persona transcript"""
        try:
            prompt = PromptTemplate(
                template="""
                Extract RESPONDENT #{persona_index} from this multi-respondent research transcript.
                
                IMPORTANT: This transcript follows a research interview format:
                - "Moderator:", "Interviewer:", or "Researcher:" = The person asking questions (IGNORE)
                - "Respondent:" or individual names = The users being interviewed (EXTRACT)
                
                Instructions:
                1. Focus only on the {persona_index}th distinct RESPONDENT (not the moderator)
                2. Extract ALL available information ONLY from this respondent's answers
                3. For location, include city and state (e.g., "Bangalore, Karnataka")
                4. For quotes, use exact quotes ONLY from this respondent
                5. Infer missing information logically based on this respondent's context
                6. For personality, analyze this respondent's communication style and attitudes
                
                Transcript: {transcript}
                
                {format_instructions}
                """,
                input_variables=["transcript", "persona_index"],
                partial_variables={"format_instructions": self.parser.get_format_instructions()}
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt.format(
                transcript=transcript, 
                persona_index=index + 1
            ))])
            persona_data = self.parser.parse(response.content)
            
            # Add source file and calculate confidence
            persona_dict = persona_data.dict()
            persona_dict['source_file'] = source_file
            persona_dict['confidence_score'] = self._calculate_confidence_score(persona_dict)
            
            return persona_dict
            
        except Exception as e:
            logger.error(f"Error extracting persona {index}: {str(e)}")
            return None
    
    def _calculate_confidence_score(self, persona_dict: Dict[str, Any]) -> float:
        """Calculate confidence score based on information completeness"""
        try:
            # Key fields that should be present for high confidence
            key_fields = ['name', 'age', 'occupation', 'location', 'personality', 'pain_points']
            present_fields = sum(1 for field in key_fields if persona_dict.get(field))
            
            # Base score from key fields
            base_score = present_fields / len(key_fields)
            
            # Bonus for detailed information
            bonus = 0
            if len(persona_dict.get('key_quotes', [])) >= 3:
                bonus += 0.1
            if len(persona_dict.get('pain_points', [])) >= 2:
                bonus += 0.1
            if persona_dict.get('fintech_preferences', {}).get('apps'):
                bonus += 0.1
            if persona_dict.get('cultural_background', {}).get('heritage'):
                bonus += 0.1
            
            confidence = min(1.0, base_score + bonus)
            return round(confidence, 2)
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {str(e)}")
            return 0.5

def process_transcripts(transcripts: List[str], source_files: List[str] = None) -> Dict[str, Any]:
    """
    Main function to process multiple transcripts and extract personas
    """
    try:
        if source_files is None:
            source_files = [f"transcript_{i+1}.txt" for i in range(len(transcripts))]
        
        processor = EnhancedTranscriptProcessor()
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

if __name__ == "__main__":
    # Test with sample transcript using Moderator/Respondent format
    sample_transcript = """
    User Research Interview - Day Trader
    
    Moderator: Hi, thanks for joining us today. Can you tell us about yourself?
    
    Respondent: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore. I work as a day trader, mostly dealing with stocks and crypto.
    
    Moderator: What financial apps do you use?
    
    Respondent: I use PhonePe for payments, Zerodha for trading, and I have accounts with HDFC and ICICI banks. I also use Slice Pay sometimes, but the hidden charges are a big problem.
    
    Moderator: What are your main pain points with current financial tools?
    
    Respondent: The biggest issue is hidden charges. You think you're getting a good deal, but then there are all these fees. Also, the UI is often confusing - too many buttons and options. I prefer simple, clean interfaces.
    
    Moderator: What motivates you in your work?
    
    Respondent: I want to be financially independent by 30. My family has always struggled with money, so I'm determined to break that cycle. I also enjoy the challenge of trading - it's like a puzzle every day.
    """
    
    result = process_transcripts([sample_transcript], ["abdul_interview.txt"])
    print(json.dumps(result, indent=2))
