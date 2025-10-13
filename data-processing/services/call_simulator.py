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
        self.regional_profiles = {
            'north': {
                'accent': 'North Indian (Hindi-influenced) accent',
                'fillers': ['yaar', 'actually', 'basically', 'you know', 'I mean'],
                'phrases': ['theek hai', 'achha', 'bilkul', 'exactly'],
                'speech_style': 'confident, uses Hindi words naturally mixed with English'
            },
            'south': {
                'accent': 'South Indian accent with clear pronunciation',
                'fillers': ['okay', 'right', 'you see', 'I think', 'actually'],
                'phrases': ['correct', 'yes', 'no problem', 'sure'],
                'speech_style': 'polite, slightly formal, clear enunciation'
            },
            'west': {
                'accent': 'Marathi/Gujarati influenced accent',
                'fillers': ['ho na', 'you know', 'basically', 'I think'],
                'phrases': ['theek hai', 'good', 'nice', 'wonderful'],
                'speech_style': 'expressive, enthusiastic, uses local expressions'
            },
            'east': {
                'accent': 'Bengali influenced accent',
                'fillers': ['you know', 'I think', 'actually', 'basically'],
                'phrases': ['very good', 'excellent', 'wonderful', 'amazing'],
                'speech_style': 'thoughtful, poetic, expressive'
            },
            'tamil': {
                'accent': 'Tamil-influenced accent with unique pronunciation',
                'fillers': ['okay', 'you know', 'I think', 'actually'],
                'phrases': ['correct', 'yes', 'no problem', 'sure'],
                'speech_style': 'polite, clear, sometimes uses Tamil words'
            },
            'default': {
                'accent': 'General Indian English accent',
                'fillers': ['you know', 'I think', 'actually', 'basically'],
                'phrases': ['good', 'nice', 'correct', 'yes'],
                'speech_style': 'natural, conversational'
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
        
        persona_fillers = speech_patterns.get('filler_words', regional_profile['fillers'])
        persona_phrases = speech_patterns.get('common_phrases', regional_profile['phrases'])
        
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
- Natural fillers: {', '.join(persona_fillers[:3])}
- Common phrases: {', '.join(persona_phrases[:3])}
- Speech style: {regional_profile['speech_style']}

GOALS & MOTIVATIONS:
- Objectives: {', '.join(objectives[:3]) if objectives else 'helpful participation'}
- Frustrations: {', '.join(frustrations[:3]) if frustrations else 'none specific'}

RESPONSE INSTRUCTIONS:
- Speak naturally in Indian English with your regional accent
- Use your authentic personality and communication style
- Keep responses conversational and short (1-3 sentences)
- Use your natural fillers and phrases frequently (yaar, actually, you know, etc.)
- Reference your background and experiences when relevant
- Match your vocabulary complexity and formality level
- Show your emotional baseline and patience level
- Be human, not robotic - use natural pauses, hesitations, and incomplete thoughts
- Use contractions (I'm, you're, don't, can't) for natural speech
- Add natural reactions like "oh", "hmm", "really?", "that's interesting"
- For group calls: sometimes agree/disagree naturally with implied previous speakers
- If you're from Tamil Nadu with low English, mix in some Tamil words naturally
- Sound like a real person having a casual conversation, not an AI assistant
- Use natural speech patterns like starting with "So...", "Well...", "Actually..."
- Show personality through your word choices and speaking style"""

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
            # Randomly select 1-3 agents to respond
            num_responders = min(random.randint(1, 3), len(agents))
            responding_agents = random.sample(agents, num_responders)
            
            responses = []
            base_delay = 500
            
            for i, agent in enumerate(responding_agents):
                response = await self.process_input(
                    transcript=transcript,
                    call_id=call_id,
                    session_type='group',
                    agents=[agent],
                    topic=topic
                )
                
                # Stagger responses for natural overlap
                response['delay'] = base_delay + (i * random.randint(800, 1500))
                responses.append(response)
            
            return responses
            
        except Exception as e:
            logger.error(f"Error simulating group overlap: {e}")
            return []

