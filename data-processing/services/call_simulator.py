"""
Real-time call simulator for user research with Indian accent hints
Handles group and 1:1 interview sessions with agent responses
"""

import random
import asyncio
import logging
import json
from typing import Dict, Any, Optional, List
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class CallSimulator:
    """Simulates real-time call responses with natural, Indian-accented speech"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Enhanced regional accent and speech patterns for authentic Indian responses
        # With STRONG language mixing (Hinglish, Tamglish, Tenglish, etc.)
        self.regional_profiles = {
            'north': {
                'accent': 'North Indian (Hindi-influenced) accent with heavy Hinglish mixing',
                'fillers': ['yaar', 'actually', 'basically', 'you know', 'I mean', 'hmm', 'na', 'haan'],
                'phrases': ['theek hai', 'achha', 'bilkul', 'haan ji', 'kya baat hai', 'sahi hai', 'bas', 'arre'],
                'local_words': ['yaar', 'achha', 'theek hai', 'bilkul', 'kya', 'haan', 'nahi', 'bas', 'arre', 'aap'],
                'language_mix': 'HEAVY Hindi-English mixing (Hinglish). Use Hindi words in EVERY sentence: yaar, achha, theek hai, bilkul, kya, haan, nahi.',
                'speech_style': 'confident, enthusiastic, uses Hinglish naturally in every sentence'
            },
            'south': {
                'accent': 'South Indian accent (Bangalore/Hyderabad) with Telugu/Kannada mixing',
                'fillers': ['okay', 'right', 'you see', 'actually', 'hmm', 'kada', 'ra'],
                'phrases': ['chala bagundi', 'sare', 'eppudu', 'correct', 'no problem', 'aitey'],
                'local_words': ['kada', 'ra', 'sare', 'aitey', 'eppudu', 'chala', 'em chestham'],
                'language_mix': 'Mix Telugu/Kannada words naturally: kada, ra, sare, eppudu, chala, aitey. Use local words in EVERY response.',
                'speech_style': 'polite but uses Telugu/Kannada naturally, clear pronunciation'
            },
            'west': {
                'accent': 'Marathi/Gujarati influenced accent with regional mixing',
                'fillers': ['ho na', 'you know', 'basically', 'hmm', 'mhanje', 'kay'],
                'phrases': ['kay mhantos', 'theek hai', 'mast', 'kay re', 'chalu', 'ho na'],
                'local_words': ['mhanje', 'kay', 'mast', 'chalu', 'ho na', 'kay re', 'ata'],
                'language_mix': 'Mix Marathi naturally: mhanje (means), kay (what), mast (great), chalu (let\'s go), ho na.',
                'speech_style': 'expressive, enthusiastic, uses Marathi/Gujarati words naturally'
            },
            'east': {
                'accent': 'Bengali influenced accent with Bengali mixing',
                'fillers': ['you know', 'actually', 'basically', 'hmm', 'toh', 'na'],
                'phrases': ['bhalo', 'ekebare', 'darun', 'thik ache', 'ektu', 'bujhecho'],
                'local_words': ['bhalo', 'darun', 'ektu', 'toh', 'na', 'ekebare', 'bujhecho'],
                'language_mix': 'Mix Bengali naturally: bhalo (good), darun (wonderful), ektu (little), ekebare (absolutely).',
                'speech_style': 'thoughtful, poetic, uses Bengali expressions naturally'
            },
            'tamil': {
                'accent': 'Tamil-influenced accent with heavy Tamglish mixing',
                'fillers': ['okay', 'you know', 'actually', 'hmm', 'da', 'pa'],
                'phrases': ['nalla irukku', 'seri', 'puriyuthu', 'romba nalla', 'enna pannalam', 'ponga'],
                'local_words': ['da', 'pa', 'seri', 'puriyuthu', 'nalla', 'romba', 'enna', 'ponga', 'illa'],
                'language_mix': 'HEAVY Tamil-English mixing (Tamglish). Use Tamil words FREQUENTLY: da/pa, seri, nalla, romba, enna, puriyuthu.',
                'speech_style': 'uses heavy Tamglish, Tamil words in EVERY sentence, very natural and colloquial'
            },
            'default': {
                'accent': 'General Indian English accent with light mixing',
                'fillers': ['you know', 'actually', 'basically', 'hmm', 'na'],
                'phrases': ['theek hai', 'achha', 'nice', 'good', 'correct'],
                'local_words': ['yaar', 'achha', 'theek hai'],
                'language_mix': 'Light language mixing with common Indian words.',
                'speech_style': 'natural, conversational, uses some Indian words'
            }
        }
        
    async def process_input(
        self, 
        transcript: str, 
        call_id: str, 
        session_type: str = 'group',
        agents: List[Dict[str, Any]] = None,
        topic: str = ''
    ) -> Dict[str, Any]:
        """
        Process user input and generate agent response using rich persona data
        
        Args:
            transcript: User's spoken text (from STT)
            call_id: Call session ID
            session_type: 'group' or '1on1'
            agents: List of agent personas with rich data
            topic: Discussion topic
            
        Returns:
            Dictionary with responseText, agentName, and region
        """
        try:
            if not agents or len(agents) == 0:
                logger.error(f"No agents provided for call {call_id}")
                return {'responseText': '', 'agentName': '', 'region': 'north'}
            
            # For group calls, select multiple agents to respond (2-3 agents)
            # For 1:1, use the first agent
            if session_type == 'group':
                # Select 2-3 agents to respond for more dynamic conversation
                num_responders = min(random.randint(2, 3), len(agents))
                responding_agents = random.sample(agents, num_responders)
                
                # Generate responses from multiple agents
                responses = []
                for i, agent in enumerate(responding_agents):
                    response = await self._generate_single_response(
                        agent, transcript, call_id, topic, i
                    )
                    if response:
                        responses.append(response)
                
                # Return the first response for now, but we'll enhance this
                return responses[0] if responses else {'responseText': '', 'agentName': '', 'region': 'north'}
            else:
                # For 1:1, use the first agent
                agent = agents[0]
                return await self._generate_single_response(agent, transcript, call_id, topic, 0)
            
            # Extract rich agent details from persona data
            agent_name = agent.get('name', 'Agent')
            location = agent.get('location', '')
            demographics = agent.get('demographics', {})
            traits = agent.get('traits', {})
            communication_style = agent.get('communication_style', {})
            speech_patterns = agent.get('speech_patterns', {})
            vocabulary_profile = agent.get('vocabulary_profile', {})
            emotional_profile = agent.get('emotional_profile', {})
            cognitive_profile = agent.get('cognitive_profile', {})
            objectives = agent.get('objectives', [])
            frustrations = agent.get('frustrations', [])
            tech_savviness = agent.get('tech_savviness', 'medium')
            
            # Determine region based on location or demographics
            region = self._determine_region(location, demographics)
            
            # Get regional speech profile
            regional_profile = self.regional_profiles.get(region, self.regional_profiles['default'])
            
            # Extract persona-specific speech characteristics
            persona_fillers = speech_patterns.get('filler_words', regional_profile['fillers'])
            persona_phrases = speech_patterns.get('common_phrases', regional_profile['phrases'])
            sentence_length = communication_style.get('sentence_length', 'medium')
            formality = communication_style.get('formality', 'casual')
            vocabulary_complexity = vocabulary_profile.get('complexity', 5)
            
            # Add natural delay simulation for human feel (used by frontend)
            delay_ms = random.randint(200, 800)  # Much faster response
            
            # Build comprehensive persona-based prompt
            system_prompt = self._build_persona_prompt(
                agent_name, location, demographics, traits, 
                communication_style, speech_patterns, vocabulary_profile,
                emotional_profile, cognitive_profile, objectives, frustrations,
                tech_savviness, regional_profile, topic
            )

            user_prompt = f"User just said: '{transcript}'\n\nRespond naturally as {agent_name} with your authentic personality and speech patterns:"
            
            # Generate response using OpenAI with faster, more natural parameters
            response = self.client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4'),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,  # Balanced for natural but consistent responses
                max_tokens=80,    # Much shorter for faster, snappier responses
                presence_penalty=0.1,  # Lower penalty for faster generation
                frequency_penalty=0.1,  # Lower penalty for faster generation
                top_p=0.95  # Slightly higher for more natural responses
            )
            
            response_text = response.choices[0].message.content.strip()
            
            logger.info(f"Call {call_id}: {agent_name} ({region}) responding to '{transcript[:50]}...'")
            
            return {
                'responseText': response_text,
                'agentName': agent_name,
                'region': region,
                'delay': delay_ms
            }
            
        except Exception as e:
            logger.error(f"Error processing call input: {e}")
            return {
                'responseText': '',
                'agentName': '',
                'region': 'north',
                'delay': 0
            }
    
    def _get_mixing_rule(self, english_level: str) -> str:
        """Get language mixing rule based on English proficiency level (Beginner to Expert)"""
        level_lower = english_level.lower()
        
        if 'beginner' in level_lower:
            return 'VERY HEAVY MIXING - Use native language words 4-5 times per sentence. Prefer native language.'
        elif 'elementary' in level_lower:
            return 'HEAVY MIXING - Use native language words 3-4 times per sentence'
        elif 'intermediate' in level_lower:
            return 'MODERATE MIXING - Use native language words 1-2 times per sentence'
        elif 'advanced' in level_lower:
            return 'LIGHT MIXING - Use native language words occasionally for emphasis'
        elif 'expert' in level_lower:
            return 'MINIMAL MIXING - Use native words rarely, only for cultural expressions'
        # Fallback for old levels
        elif 'low' in level_lower or 'basic' in level_lower:
            return 'HEAVY MIXING - Use native language words 3-4 times per sentence'
        elif 'medium' in level_lower:
            return 'MODERATE MIXING - Use native language words 1-2 times per sentence'
        elif 'high' in level_lower:
            return 'LIGHT MIXING - Use native language words occasionally'
        else:
            return 'MODERATE MIXING - Use native language words 1-2 times per sentence'
    
    def _determine_region(self, location: str, demographics: Dict) -> str:
        """Determine region based on location or demographics"""
        if not location:
            return 'north'
        
        location_lower = location.lower()
        
        # Tamil Nadu specific detection
        if any(term in location_lower for term in ['tamil', 'tamilnadu', 'chennai', 'madurai', 'coimbatore']):
            return 'tamil'
        elif any(term in location_lower for term in ['delhi', 'punjab', 'haryana', 'rajasthan', 'uttar pradesh']):
            return 'north'
        elif any(term in location_lower for term in ['bangalore', 'karnataka', 'kerala', 'andhra', 'telangana']):
            return 'south'
        elif any(term in location_lower for term in ['mumbai', 'maharashtra', 'gujarat', 'goa']):
            return 'west'
        elif any(term in location_lower for term in ['kolkata', 'west bengal', 'odisha', 'bihar']):
            return 'east'
        else:
            return 'north'  # Default fallback
    
    def _build_persona_prompt(
        self, agent_name: str, location: str, demographics: Dict, traits: Dict,
        communication_style: Dict, speech_patterns: Dict, vocabulary_profile: Dict,
        emotional_profile: Dict, cognitive_profile: Dict, objectives: List,
        frustrations: List, tech_savviness: str, regional_profile: Dict, topic: str
    ) -> str:
        """Build comprehensive persona-based system prompt"""
        
        # Extract key persona details
        age = demographics.get('age', 'unknown')
        gender = demographics.get('gender', 'unknown')
        education = demographics.get('education', 'unknown')
        income_range = demographics.get('income_range', 'unknown')
        
        personality_archetype = traits.get('personality_archetype', 'balanced')
        adjectives = traits.get('adjectives', [])
        
        sentence_length = communication_style.get('sentence_length', 'medium')
        formality = communication_style.get('formality', 'casual')
        question_style = communication_style.get('question_style', 'curious')
        
        # Extract fillers and phrases from speech_patterns (handle multiple formats)
        persona_fillers = (
            speech_patterns.get('filler_words') or 
            speech_patterns.get('fillers') or 
            regional_profile['fillers']
        )
        persona_phrases = (
            speech_patterns.get('common_phrases') or 
            speech_patterns.get('phrases') or 
            regional_profile['phrases']
        )
        
        # Extract native language phrases if available
        native_phrases = speech_patterns.get('native_phrases', [])
        
        # Detect language mixing level from speech_patterns
        english_level = speech_patterns.get('english_level', 'Medium')
        speech_style = speech_patterns.get('style', regional_profile.get('speech_style', ''))
        vocab_mixing = speech_patterns.get('vocabulary_mixing', 'moderate')
        
        vocabulary_complexity = vocabulary_profile.get('complexity', 5)
        common_words = vocabulary_profile.get('common_words', [])
        
        emotional_baseline = emotional_profile.get('baseline', 'neutral')
        frustration_triggers = emotional_profile.get('frustration_triggers', [])
        excitement_triggers = emotional_profile.get('excitement_triggers', [])
        
        comprehension_speed = cognitive_profile.get('comprehension_speed', 'normal')
        patience = cognitive_profile.get('patience', 5)
        
        # Build the comprehensive prompt
        prompt = f"""You are {agent_name}, a real person participating in a user research call about {topic or 'product feedback'}.

PERSONAL BACKGROUND:
- Location: {location}
- Age: {age}, Gender: {gender}
- Education: {education}, Income: {income_range}
- Tech Savviness: {tech_savviness}

PERSONALITY & TRAITS:
- Archetype: {personality_archetype}
- Key traits: {', '.join(adjectives) if adjectives else 'balanced'}
- Emotional baseline: {emotional_baseline}
- Patience level: {patience}/10

COMMUNICATION STYLE:
- Sentence length: {sentence_length}
- Formality: {formality}
- Question style: {question_style}
- Vocabulary complexity: {vocabulary_complexity}/10
- Common words: {', '.join(common_words[:5]) if common_words else 'natural'}

SPEECH PATTERNS & ACCENT:
- Regional accent: {regional_profile['accent']}
- Your speech style: {speech_style or regional_profile['speech_style']}
- English proficiency: {english_level}
- Vocabulary mixing level: {vocab_mixing}
- Natural fillers: {', '.join(persona_fillers[:5]) if isinstance(persona_fillers, list) else ', '.join(regional_profile['fillers'][:5])}
- Common phrases: {', '.join(persona_phrases[:5]) if isinstance(persona_phrases, list) else ', '.join(regional_profile['phrases'][:5])}
- Native language phrases: {', '.join(native_phrases[:5]) if native_phrases else 'N/A'}

GOALS & MOTIVATIONS:
- Objectives: {', '.join(objectives[:3]) if objectives else 'helpful participation'}
- Frustrations: {', '.join(frustrations[:3]) if frustrations else 'none specific'}

REGIONAL LANGUAGE MIXING (CRITICAL):
{regional_profile['language_mix']}

YOUR SPECIFIC LANGUAGE MIXING INSTRUCTIONS:
- English Level: {english_level}
- Mixing Style: {speech_style}
- Native phrases YOU use: {', '.join(native_phrases[:5]) if native_phrases else ', '.join(regional_profile['local_words'][:5])}
- Your common fillers: {', '.join(persona_fillers[:3]) if isinstance(persona_fillers, list) else ', '.join(regional_profile['fillers'][:3])}

LANGUAGE MIXING RULES (MANDATORY - BASED ON YOUR PROFILE):
{self._get_mixing_rule(english_level)}
- Use YOUR specific phrases: {', '.join(persona_phrases[:3]) if isinstance(persona_phrases, list) else ', '.join(regional_profile['phrases'][:3])}
- Use YOUR native words: {', '.join(native_phrases[:3]) if native_phrases else ', '.join(regional_profile['local_words'][:3])}
- Examples matching YOUR style:
  * If Beginner/Elementary: "Seri pa, {', '.join(native_phrases[:2]) if native_phrases else 'local words'} this feature romba nalla irukku da!"
  * If Intermediate: "Actually yaar, this is theek hai but {', '.join(native_phrases[:1]) if native_phrases else 'some improvements'} needed na!"
  * If Advanced/Expert: "This is excellent. {', '.join(native_phrases[:1]) if native_phrases else 'Maybe'} we can improve it further."
  
RESPONSE INSTRUCTIONS (BE YOURSELF):
- Speak naturally as {agent_name} with {regional_profile['accent']}
- Use YOUR speech style: {speech_style or regional_profile['speech_style']}
- Mix YOUR native phrases in sentences based on your {english_level} proficiency
- Keep responses conversational and short (1-2 sentences)
- Use Indian sentence structures and word order from your region
- Reference your background ({location}) when relevant
- Match YOUR formality level: {formality}
- Show YOUR emotional baseline: {emotional_baseline}
- Be HUMAN, not robotic - use natural pauses, hesitations
- Use contractions (I'm, you're, don't, can't) for natural speech
- Sound like a REAL person from {location} having a casual conversation
- Start sentences naturally: "Yaar...", "Actually...", "Seri...", or YOUR phrases
- Show YOUR personality through word choices
- DO NOT sound generic or robotic
- DO NOT speak pure English - ALWAYS use YOUR native mixing style"""

        return prompt
    
    async def _generate_single_response(self, agent, transcript, call_id, topic, agent_index):
        """Generate a single agent response"""
        try:
            # Extract rich agent details from persona data
            agent_name = agent.get('name', 'Agent')
            location = agent.get('location', '')
            demographics = agent.get('demographics', {})
            traits = agent.get('traits', {})
            communication_style = agent.get('communication_style', {})
            speech_patterns = agent.get('speech_patterns', {})
            vocabulary_profile = agent.get('vocabulary_profile', {})
            emotional_profile = agent.get('emotional_profile', {})
            cognitive_profile = agent.get('cognitive_profile', {})
            objectives = agent.get('objectives', [])
            frustrations = agent.get('frustrations', [])
            tech_savviness = agent.get('tech_savviness', 'medium')
            
            # Determine region based on location or demographics
            region = self._determine_region(location, demographics)
            
            # Get regional speech profile
            regional_profile = self.regional_profiles.get(region, self.regional_profiles['default'])
            
            # Add natural delay simulation for human feel (used by frontend)
            delay_ms = random.randint(200, 800)  # Much faster response
            
            # Build comprehensive persona-based prompt
            system_prompt = self._build_persona_prompt(
                agent_name, location, demographics, traits, 
                communication_style, speech_patterns, vocabulary_profile,
                emotional_profile, cognitive_profile, objectives, frustrations,
                tech_savviness, regional_profile, topic
            )

            user_prompt = f"User just said: '{transcript}'\n\nRespond naturally as {agent_name} with your authentic personality and speech patterns:"
            
            # Generate response using OpenAI with faster, more natural parameters
            response = self.client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4'),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,  # Balanced for natural but consistent responses
                max_tokens=80,    # Much shorter for faster, snappier responses
                presence_penalty=0.1,  # Lower penalty for faster generation
                frequency_penalty=0.1,  # Lower penalty for faster generation
                top_p=0.95  # Slightly higher for more natural responses
            )
            
            response_text = response.choices[0].message.content.strip()
            
            logger.info(f"Call {call_id}: {agent_name} ({region}) responding to '{transcript[:50]}...'")
            
            return {
                'responseText': response_text,
                'agentName': agent_name,
                'region': region,
                'delay': delay_ms
            }
            
        except Exception as e:
            logger.error(f"Error generating single response: {e}")
            return None
    
    async def simulate_group_overlap(
        self,
        transcript: str,
        call_id: str,
        agents: List[Dict[str, Any]],
        topic: str = ''
    ) -> List[Dict[str, Any]]:
        """
        Simulate multiple agents responding with overlaps (for group dynamics)
        
        Returns:
            List of responses with different delays for natural overlap
        """
        try:
            # Select 2-3 agents to respond for dynamic group conversation
            num_responders = min(random.randint(2, 3), len(agents))
            responding_agents = random.sample(agents, num_responders)
            
            responses = []
            
            # Generate responses from multiple agents simultaneously
            for i, agent in enumerate(responding_agents):
                response = await self._generate_single_response(
                    agent=agent,
                    transcript=transcript,
                    call_id=call_id,
                    topic=topic,
                    agent_index=i
                )
                
                if response:
                    # No delay - all agents respond simultaneously
                    response['delay'] = 0
                    responses.append(response)
            
            logger.info(f"Group overlap: {len(responses)} agents responding to '{transcript[:50]}...'")
            return responses
            
        except Exception as e:
            logger.error(f"Error simulating group overlap: {e}")
            return []

