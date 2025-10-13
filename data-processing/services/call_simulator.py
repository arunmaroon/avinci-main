"""
Real-time call simulator for user research with Indian accent hints
Handles group and 1:1 interview sessions with agent responses
"""

import random
import asyncio
import logging
from typing import Dict, Any, Optional, List
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class CallSimulator:
    """Simulates real-time call responses with natural, Indian-accented speech"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Regional accent hints for more authentic responses
        self.accent_hints = {
            'north': 'Speak with a subtle North Indian (Hindi-influenced) accent, using words like "yaar", "actually", "basically"',
            'south': 'Speak with a subtle South Indian accent, clear pronunciation, slightly formal but friendly',
            'west': 'Speak with a Marathi/Gujarati influenced accent, confident and expressive',
            'east': 'Speak with a Bengali influenced accent, poetic and thoughtful',
            'default': 'Speak naturally with an Indian English accent'
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
        Process user input and generate agent response
        
        Args:
            transcript: User's spoken text (from STT)
            call_id: Call session ID
            session_type: 'group' or '1on1'
            agents: List of agent personas
            topic: Discussion topic
            
        Returns:
            Dictionary with responseText, agentName, and region
        """
        try:
            if not agents or len(agents) == 0:
                logger.error(f"No agents provided for call {call_id}")
                return {'responseText': '', 'agentName': '', 'region': 'north'}
            
            # For group calls, randomly select an agent to respond
            # Add natural variation (not every agent responds to everything)
            if session_type == 'group':
                # 70% chance any given agent responds
                responding_agents = [a for a in agents if random.random() < 0.7]
                if not responding_agents:
                    responding_agents = [random.choice(agents)]
                
                agent = random.choice(responding_agents)
            else:
                # For 1:1, use the first agent
                agent = agents[0]
            
            # Extract agent details
            agent_name = agent.get('name', 'Agent')
            agent_persona = agent.get('persona', '')
            agent_background = agent.get('background', '')
            region = agent.get('region', 'north')
            
            # Add natural delay simulation for human feel (used by frontend)
            delay_ms = random.randint(500, 2000)
            
            # Build prompt for natural Indian-English response
            accent_hint = self.accent_hints.get(region, self.accent_hints['default'])
            
            system_prompt = f"""You are {agent_name}, participating in a user research call about {topic or 'product feedback'}.

Persona: {agent_persona}
Background: {agent_background}

Instructions:
- Respond naturally in Indian English with conversational style
- {accent_hint}
- Keep responses concise (2-3 sentences) like in a real conversation
- Use casual fillers like "hmm", "you know", "I think", "actually"
- Be authentic and human, not robotic
- Reference your background and experiences when relevant
- For group calls: sometimes agree/disagree with implied previous speakers"""

            user_prompt = f"User just said: '{transcript}'\n\nRespond naturally as {agent_name}:"
            
            # Generate response using OpenAI
            response = self.client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4'),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,  # Higher temperature for more natural variation
                max_tokens=150
            )
            
            response_text = response.choices[0].message.content.strip()
            
            logger.info(f"Call {call_id}: {agent_name} responding to '{transcript[:50]}...'")
            
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

