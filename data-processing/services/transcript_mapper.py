"""
Transcript-to-Persona Mapping Service
Maps user transcripts to comprehensive persona JSON with exact detail extraction
"""

import json
import os
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TranscriptMapper:
    """Maps transcripts to comprehensive persona JSON structures"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with OpenAI API key"""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.0,  # Exact extraction, no creativity
            max_tokens=4000,
            openai_api_key=self.api_key
        )
    
    def map_transcripts(self, transcripts: List[str]) -> List[Dict[str, Any]]:
        """
        Map multiple transcripts to persona JSONs
        
        Args:
            transcripts: List of transcript strings
            
        Returns:
            List of persona dictionaries
        """
        personas = []
        
        for idx, transcript in enumerate(transcripts):
            logger.info(f"Processing transcript {idx + 1}/{len(transcripts)}")
            try:
                persona = self._map_single_transcript(transcript, idx)
                personas.append(persona)
            except Exception as e:
                logger.error(f"Error processing transcript {idx + 1}: {str(e)}")
                # Return error persona
                personas.append({
                    "error": str(e),
                    "transcript_index": idx,
                    "source_meta": {
                        "source_file": f"transcript_{idx}.txt",
                        "confidence_score": 0.0,
                        "timestamps": []
                    }
                })
        
        return personas
    
    def _map_single_transcript(self, transcript: str, index: int) -> Dict[str, Any]:
        """Map a single transcript to persona JSON"""
        
        system_prompt = """You are a persona extraction engine. Extract EXACT details from user research transcripts.

CRITICAL RULES:
1. Extract ONLY from "Respondent:" answers (IGNORE "Moderator:" questions)
2. Use EXACT information as stated - NO inference or generation
3. For missing data, use null or empty arrays []
4. Map to the exact JSON structure provided
5. Extract location details: If "Bangalore" is mentioned, map to city: "Bangalore", state: "Karnataka"
6. Extract identity: name, age, gender from exact statements
7. Extract profession: occupation and detailed background/summary
8. Capture personality traits, values, motivations from their language
9. Identify hobbies, goals (short/long term), pain points from statements
10. Extract financial profile: apps used, banks, payment habits, credit cards mentioned
11. Analyze communication style: tone (formal/casual), vocabulary level
12. Extract emotional triggers and responses
13. Capture social context: family, friends, community values mentioned
14. Extract cultural background: heritage, beliefs, traditions
15. Map daily routine as a list of activities
16. Identify decision-making style and influences
17. Extract life events with year and impact
18. Determine tech savviness and English proficiency level
19. Capture exact key quotes from respondent
20. Assign confidence score (0-1) based on data completeness"""

        user_prompt = f"""Map this transcript to the JSON data structure below. Use EXACT details only.

DATA STRUCTURE:
{{
  "identity": {{"name": string, "age": integer, "gender": string}},
  "location": {{"city": string, "state": string}},
  "profession": {{"occupation": string, "background": string}},
  "personality": {{
    "personality_traits": [string],
    "values": [string],
    "motivations": [string]
  }},
  "hobbies": [string],
  "goals": {{"short_term": [string], "long_term": [string]}},
  "pain_points": {{"general": [string], "ui": [string]}},
  "financial_profile": {{
    "fintech_preferences": {{
      "apps": [string],
      "banks": [string],
      "payment_habits": [string],
      "credit_cards": [string]
    }}
  }},
  "communication_style": {{"tone": string, "vocabulary_level": string}},
  "emotional_profile": {{"triggers": [string], "responses": [string], "tone": string}},
  "social_context": {{"family": string, "friends": string, "community_values": [string]}},
  "cultural_background": {{"heritage": string, "beliefs": [string], "traditions": [string]}},
  "daily_routine": [string],
  "decision_making": {{"style": string, "influences": [string]}},
  "life_events": [{{"event": string, "year": integer, "impact": string}}],
  "tech_profile": {{"tech_savviness": string, "english_level": string, "domain_savvy": string}},
  "key_quotes": [string],
  "source_meta": {{
    "source_file": "transcript_{index}.txt",
    "confidence_score": number,
    "timestamps": [string]
  }}
}}

EXAMPLES:
- "My name is Abdul, I live in Bangalore" → identity.name: "Abdul", location.city: "Bangalore", location.state: "Karnataka"
- "I use PhonePe and Paytm daily" → financial_profile.fintech_preferences.apps: ["PhonePe", "Paytm"]
- "I'm 24 years old" → identity.age: 24

TRANSCRIPT:
{transcript}

Return ONLY valid JSON matching the structure above. No markdown, no explanation."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = self.llm.invoke(messages)
        persona_json_str = response.content.strip()
        
        # Remove markdown code blocks if present
        if persona_json_str.startswith('```'):
            persona_json_str = persona_json_str.split('```')[1]
            if persona_json_str.startswith('json'):
                persona_json_str = persona_json_str[4:]
            persona_json_str = persona_json_str.strip()
        
        # Parse JSON
        try:
            persona = json.loads(persona_json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response was: {persona_json_str[:500]}")
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
        
        # Validate and set defaults
        persona = self._validate_persona(persona, index)
        
        return persona
    
    def _validate_persona(self, persona: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Validate persona structure and set defaults for missing fields"""
        
        # Ensure all required top-level fields exist
        defaults = {
            "identity": {"name": "Unknown", "age": None, "gender": None},
            "location": {"city": None, "state": None},
            "profession": {"occupation": None, "background": ""},
            "personality": {"personality_traits": [], "values": [], "motivations": []},
            "hobbies": [],
            "goals": {"short_term": [], "long_term": []},
            "pain_points": {"general": [], "ui": []},
            "financial_profile": {
                "fintech_preferences": {
                    "apps": [],
                    "banks": [],
                    "payment_habits": [],
                    "credit_cards": []
                }
            },
            "communication_style": {"tone": None, "vocabulary_level": None},
            "emotional_profile": {"triggers": [], "responses": [], "tone": None},
            "social_context": {"family": None, "friends": None, "community_values": []},
            "cultural_background": {"heritage": None, "beliefs": [], "traditions": []},
            "daily_routine": [],
            "decision_making": {"style": None, "influences": []},
            "life_events": [],
            "tech_profile": {"tech_savviness": "medium", "english_level": "intermediate", "domain_savvy": "intermediate"},
            "key_quotes": [],
            "source_meta": {
                "source_file": f"transcript_{index}.txt",
                "confidence_score": 0.5,
                "timestamps": []
            }
        }
        
        # Merge with defaults
        for key, default_value in defaults.items():
            if key not in persona:
                persona[key] = default_value
            elif isinstance(default_value, dict):
                for subkey, subdefault in default_value.items():
                    if subkey not in persona[key]:
                        persona[key][subkey] = subdefault
        
        return persona


def map_transcripts(transcripts: List[str], api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Convenience function to map transcripts
    
    Args:
        transcripts: List of transcript strings
        api_key: Optional OpenAI API key (uses env var if not provided)
        
    Returns:
        List of persona dictionaries
    """
    mapper = TranscriptMapper(api_key=api_key)
    return mapper.map_transcripts(transcripts)


if __name__ == "__main__":
    # Test with sample transcript
    sample_transcript = """
    Moderator: Tell me about yourself?
    Respondent: My name is Abdul Yasser, I'm 24 years old. I live in Bangalore, Karnataka. I work as a software engineer.
    
    Moderator: What apps do you use?
    Respondent: I use PhonePe and Paytm daily for payments. I also use HDFC Bank app.
    
    Moderator: What are your goals?
    Respondent: I want to save money for a car in the next year. Long term, I want to start my own tech startup.
    """
    
    result = map_transcripts([sample_transcript])
    print(json.dumps(result[0], indent=2))

