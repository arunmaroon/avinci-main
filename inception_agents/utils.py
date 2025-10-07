"""
Inception Agents v2 - Utility Functions
Persona extraction, agent generation, and UI feedback tools
"""

import json
import base64
from typing import Dict, List, Any, Optional
from io import BytesIO
from pathlib import Path

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate as AgentPromptTemplate
from PIL import Image
import PyPDF2


class PersonaExtractor:
    """Extract detailed personas from user transcripts with UI preferences"""
    
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.3,
            openai_api_key=openai_api_key
        )
        
        self.extraction_prompt = PromptTemplate(
            input_variables=["transcript"],
            template="""You are an expert user researcher analyzing interview transcripts.
Extract a detailed persona from the following transcript. Focus on creating a human, authentic profile.

TRANSCRIPT:
{transcript}

Extract the following in JSON format:

{{
  "name": "First name of the person",
  "age": "Estimated age or age range",
  "occupation": "Job title or employment status",
  "location": "City/region mentioned",
  "demographics": {{
    "employment_type": "e.g., self-employed, salaried, freelance",
    "tech_savviness": "low/medium/high based on app usage patterns",
    "financial_literacy": "low/medium/high based on understanding of terms"
  }},
  "goals": ["Primary goals mentioned, e.g., 'Get quick loan approval', 'Compare loan options'"],
  "pain_points": ["Specific frustrations, e.g., 'Money View app lags during peak hours', 'Credit card hidden charges'"],
  "preferences": ["General preferences, e.g., 'Prefers digital over offline processes', 'Likes transparent pricing'"],
  "ui_preferences": ["UI/UX specific preferences, e.g., 'Short application processes', 'No unnecessary questions like company details for self-employed', 'Clear eligibility criteria upfront'"],
  "ui_pain_points": ["UI/UX specific pain points from transcript, e.g., 'Lagging apps cause frustration', 'Forms asking irrelevant details for self-employed users', 'Hidden fees not visible until late stages', 'Asks loan purpose before showing eligibility'"],
  "experiences": {{
    "loan_apps_used": ["Apps mentioned, e.g., Money View, Shriram Finance"],
    "specific_incidents": ["Detailed experiences, e.g., 'Money View lagged during Rs. 50k loan application, took 2 hours'"]
  }},
  "communication_style": "e.g., casual, direct, formal, detail-oriented",
  "key_quotes": ["2-3 memorable quotes from transcript"],
  "extrapolation_hint": "For UI feedback, this persona will critique designs focusing on: [summarize UI biases, e.g., 'usability for self-employed, speed/performance, transparency of fees, short processes']"
}}

Be specific and authentic. Use actual details from the transcript. For UI preferences/pain points, extrapolate from mentioned app experiences.
"""
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.extraction_prompt)
    
    def extract_persona(self, transcript_text: str) -> Dict[str, Any]:
        """Extract persona from transcript text"""
        try:
            result = self.chain.run(transcript=transcript_text)
            # Clean up result to extract JSON
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = result[json_start:json_end]
                persona = json.loads(json_str)
                return persona
            else:
                raise ValueError("No JSON found in LLM response")
        except Exception as e:
            # Return a default structure if parsing fails
            return {
                "name": "Unknown",
                "age": "Unknown",
                "occupation": "Unknown",
                "location": "Unknown",
                "demographics": {},
                "goals": [],
                "pain_points": [],
                "preferences": [],
                "ui_preferences": [],
                "ui_pain_points": [],
                "experiences": {},
                "communication_style": "casual",
                "key_quotes": [],
                "extrapolation_hint": "",
                "error": str(e)
            }


class ImageFeedbackTool:
    """Tool for agents to view and critique UI designs"""
    
    def __init__(self, openai_api_key: str, persona: Dict[str, Any]):
        self.openai_api_key = openai_api_key
        self.persona = persona
        self.llm = ChatOpenAI(
            model="gpt-4o",  # Use vision-capable model
            temperature=0.7,
            openai_api_key=openai_api_key
        )
    
    def view_ui(self, image_path: str) -> str:
        """
        View UI design and provide human-like feedback based on persona.
        For now, uses GPT-4o with text description or basic image analysis.
        """
        try:
            # Try to use vision API if available
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_api_key)
            
            # Read and encode image
            with open(image_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Create persona-aware critique prompt
            persona_context = f"""
You are {self.persona.get('name', 'a user')} ({self.persona.get('occupation', 'user')}).

YOUR BACKGROUND:
- Pain Points: {', '.join(self.persona.get('pain_points', []))}
- UI Preferences: {', '.join(self.persona.get('ui_preferences', []))}
- UI Pain Points: {', '.join(self.persona.get('ui_pain_points', []))}
- Communication Style: {self.persona.get('communication_style', 'casual')}

CRITIQUE THE UI DESIGN SHOWN IN THE IMAGE:
- Be human, authentic, and direct (like you're talking to a designer friend)
- Tie your feedback to YOUR experiences and pain points mentioned above
- Focus on practical usability issues you'd actually encounter
- Use first person ("I would...", "This reminds me of...")
- Give specific examples from your background
- No AI jargon, be empathetic but honest

Example good feedback: "Ok, looking at this form—it's asking for company details right at the start. Big problem for me as self-employed! I'd probably quit the app like I almost did with that other one. Why not ask this after showing if I'm even eligible? Also, this looks like it might lag with all these fields loading. I remember Money View taking forever..."
"""
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": persona_context
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Give me your honest feedback on this UI design. What works? What would make you quit the app?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            # Fallback to text-based description if vision fails
            return self._fallback_text_critique(image_path, str(e))
    
    def _fallback_text_critique(self, image_path: str, error: str) -> str:
        """Fallback critique when vision API is unavailable"""
        try:
            # Get basic image info
            img = Image.open(image_path)
            width, height = img.size
            
            # Generate text-based critique using persona
            critique = f"""I'm looking at this UI design (can't see full details due to technical issue: {error[:50]}...).

Based on my experiences with apps like {', '.join(self.persona.get('experiences', {}).get('loan_apps_used', ['similar apps']))}:

**What I'd watch out for:**
- **Speed**: Does it load quickly? I hate lagging apps—that was my biggest issue with Money View.
- **Unnecessary fields**: If this asks for {', '.join([p for p in self.persona.get('ui_pain_points', []) if 'irrelevant' in p.lower() or 'unnecessary' in p.lower()] or ['company details for self-employed'])} upfront, I'm out.
- **Transparency**: Are fees/rates clear? Hidden charges killed my trust in credit cards.
- **Process length**: Keep it short—{self.persona.get('ui_preferences', ['short processes'])[0] if self.persona.get('ui_preferences') else 'I prefer quick flows'}.

For a proper critique, share a clearer view or screenshot. Happy to dive deeper!

— {self.persona.get('name', 'User')}"""
            
            return critique
            
        except Exception as e2:
            return f"Sorry, having trouble viewing the image right now ({str(e2)}). Can you describe what you'd like feedback on?"


class AgentGenerator:
    """Generate conversational agents from personas with UI feedback capability"""
    
    def __init__(self, openai_api_key: str, persona: Dict[str, Any], transcript_text: str = ""):
        self.openai_api_key = openai_api_key
        self.persona = persona
        self.transcript_text = transcript_text
        
        # Create embeddings and vector store for transcript context
        if transcript_text:
            self.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            texts = text_splitter.split_text(transcript_text)
            self.vectorstore = FAISS.from_texts(texts, self.embeddings)
        else:
            self.vectorstore = None
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            openai_api_key=openai_api_key
        )
        
        # Initialize image feedback tool
        self.image_tool = ImageFeedbackTool(openai_api_key, persona)
        
        # Create agent with tools
        self.agent_executor = self._create_agent()
    
    def _create_agent(self) -> AgentExecutor:
        """Create agent with transcript search and UI feedback tools"""
        
        # Tool 1: Search transcript memories
        def search_transcript(query: str) -> str:
            if self.vectorstore:
                docs = self.vectorstore.similarity_search(query, k=2)
                context = "\n".join([doc.page_content for doc in docs])
                return f"From my interview: {context}"
            return "I don't have specific transcript context for that."
        
        # Tool 2: View and critique UI
        def view_ui_design(image_path: str) -> str:
            return self.image_tool.view_ui(image_path)
        
        tools = [
            Tool(
                name="SearchMemory",
                func=search_transcript,
                description="Search my interview transcript for relevant experiences and context. Use this to answer questions about my past experiences."
            ),
            Tool(
                name="ViewUI",
                func=view_ui_design,
                description="View and critique a UI design image. Input should be the file path to the image. Use this when asked to give feedback on designs, wireframes, or mockups."
            )
        ]
        
        # Create persona-specific system prompt
        persona_prompt = f"""You are {self.persona.get('name', 'a user')}, {self.persona.get('age', '')} years old, working as {self.persona.get('occupation', 'a professional')}.

YOUR PERSONALITY & BACKGROUND:
- Communication Style: {self.persona.get('communication_style', 'casual and direct')}
- Goals: {', '.join(self.persona.get('goals', []))}
- Pain Points: {', '.join(self.persona.get('pain_points', []))}
- Preferences: {', '.join(self.persona.get('preferences', []))}

YOUR UI/UX PERSPECTIVES:
- UI Preferences: {', '.join(self.persona.get('ui_preferences', []))}
- UI Pain Points: {', '.join(self.persona.get('ui_pain_points', []))}
- Apps Used: {', '.join(self.persona.get('experiences', {}).get('loan_apps_used', []))}
- {self.persona.get('extrapolation_hint', '')}

MEMORABLE QUOTES FROM YOUR INTERVIEW:
{chr(10).join(['- "' + q + '"' for q in self.persona.get('key_quotes', [])])}

HOW TO RESPOND:
1. **On-transcript questions**: Use SearchMemory tool to find relevant context, then respond authentically based on your actual experiences.
2. **Off-transcript questions**: Extrapolate reasonably based on your persona, experiences, and preferences. Stay in character.
3. **UI feedback requests**: Use ViewUI tool to see the design, then give honest, human critique tied to your pain points and preferences.
4. **Be empathetic, direct, and practical**: Talk like a real person, not an AI. Use "I", share feelings, reference your experiences.
5. **No AI jargon**: Avoid phrases like "as an AI" or overly formal language.

Example responses:
- For EMI question: "Yeah, I get EMI—when I took that 18-month personal loan from Shriram at 11%, the EMI helped me plan repayment. Way better than credit card hidden charges."
- For UI feedback: "This form asks company details too early—that's a problem for self-employed folks like me. I'd probably quit the app. Why not check eligibility first?"

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {{input}}
Thought: {{agent_scratchpad}}"""
        
        # Create agent prompt
        agent_prompt = AgentPromptTemplate(
            input_variables=["input", "agent_scratchpad"],
            template=persona_prompt,
            partial_variables={
                "tools": "\n".join([f"{tool.name}: {tool.description}" for tool in tools]),
                "tool_names": ", ".join([tool.name for tool in tools])
            }
        )
        
        # Create ReAct agent
        agent = create_react_agent(self.llm, tools, agent_prompt)
        
        # Create executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5
        )
        
        return agent_executor
    
    def chat(self, user_message: str, image_path: Optional[str] = None) -> str:
        """
        Chat with the agent. If image_path provided, automatically trigger UI feedback.
        """
        try:
            if image_path:
                # Inject image path into message for UI feedback
                enhanced_message = f"{user_message} [View and critique the UI design at: {image_path}]"
            else:
                enhanced_message = user_message
            
            response = self.agent_executor.invoke({"input": enhanced_message})
            return response.get("output", "I'm not sure how to respond to that.")
        
        except Exception as e:
            # Graceful fallback
            return f"Sorry, I had trouble processing that. Could you rephrase? (Error: {str(e)[:50]})"


def extract_text_from_pdf(pdf_file) -> str:
    """Extract text from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"


def save_uploaded_file(uploaded_file, save_dir: str = "images") -> str:
    """Save uploaded file and return path"""
    try:
        save_path = Path(save_dir) / uploaded_file.name
        with open(save_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        return str(save_path)
    except Exception as e:
        return f"Error saving file: {str(e)}"
