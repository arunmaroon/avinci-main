"""
Inception Agents v2 - Main Streamlit Application
AI Tool for User Research Sims with UI Feedback
"""

import streamlit as st
import json
import os
import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import base64

from utils import (
    PersonaExtractor,
    AgentGenerator,
    extract_text_from_pdf,
    save_uploaded_file
)

# Page config
st.set_page_config(
    page_title="Inception Agents v2",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if "agents" not in st.session_state:
    st.session_state.agents = {}
if "current_agent" not in st.session_state:
    st.session_state.current_agent = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "personas" not in st.session_state:
    st.session_state.personas = {}
if "shared_ui" not in st.session_state:
    st.session_state.shared_ui = None
if "feedback_log" not in st.session_state:
    st.session_state.feedback_log = []


# Database setup
def init_database():
    """Initialize SQLite database for scaling to 100s of agents"""
    conn = sqlite3.connect("agents.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ui_agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            persona_json TEXT NOT NULL,
            transcript_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_ui_feedback TEXT,
            feedback_count INTEGER DEFAULT 0
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id INTEGER,
            user_query TEXT,
            agent_response TEXT,
            image_path TEXT,
            tied_trait TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES ui_agents(id)
        )
    """)
    
    conn.commit()
    conn.close()


def save_agent_to_db(name: str, persona: Dict, transcript: str):
    """Save agent to database"""
    conn = sqlite3.connect("agents.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO ui_agents (name, persona_json, transcript_text)
        VALUES (?, ?, ?)
    """, (name, json.dumps(persona), transcript))
    
    conn.commit()
    agent_id = cursor.lastrowid
    conn.close()
    return agent_id


def load_agents_from_db() -> List[Dict]:
    """Load all agents from database"""
    conn = sqlite3.connect("agents.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, persona_json, created_at FROM ui_agents ORDER BY created_at DESC")
    agents = []
    for row in cursor.fetchall():
        agents.append({
            "id": row[0],
            "name": row[1],
            "persona": json.loads(row[2]),
            "created_at": row[3]
        })
    
    conn.close()
    return agents


def save_feedback_to_db(agent_id: int, query: str, response: str, image_path: str = "", tied_trait: str = ""):
    """Save feedback to database for analytics"""
    conn = sqlite3.connect("agents.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO feedback_history (agent_id, user_query, agent_response, image_path, tied_trait)
        VALUES (?, ?, ?, ?, ?)
    """, (agent_id, query, response, image_path, tied_trait))
    
    # Update agent's last feedback
    cursor.execute("""
        UPDATE ui_agents 
        SET last_ui_feedback = ?, feedback_count = feedback_count + 1
        WHERE id = ?
    """, (response, agent_id))
    
    conn.commit()
    conn.close()


# Main UI
st.title("🧠 Inception Agents v2")
st.markdown("**AI Tool for User Research Sims with UI Feedback** | Built with empathy for Arun Murugesan")

st.markdown("---")

# Initialize database
init_database()

# Sidebar: Transcript Upload & Agent Generation
st.sidebar.title("🚀 Agent Generation")

# API Key input
api_key = st.sidebar.text_input(
    "OpenAI API Key",
    type="password",
    value=os.getenv("OPENAI_API_KEY", ""),
    help="Required for agent generation and UI feedback"
)

if not api_key:
    st.sidebar.warning("⚠️ Please enter your OpenAI API key to continue")
    st.info("👋 Welcome! To get started, enter your OpenAI API key in the sidebar, then upload a user interview transcript to create AI agents.")
    st.stop()

# Store API key
os.environ["OPENAI_API_KEY"] = api_key

st.sidebar.markdown("### Upload Transcript")
uploaded_files = st.sidebar.file_uploader(
    "Upload user interview transcript(s)",
    type=["pdf", "txt"],
    accept_multiple_files=True,
    help="Upload PDF or text files containing user interview transcripts"
)

# Batch processing
if uploaded_files:
    st.sidebar.markdown(f"📄 **{len(uploaded_files)} file(s) uploaded**")
    
    if st.sidebar.button("🎬 Generate Agents", type="primary"):
        progress_bar = st.sidebar.progress(0)
        status_text = st.sidebar.empty()
        
        for idx, uploaded_file in enumerate(uploaded_files):
            status_text.text(f"Processing {uploaded_file.name}...")
            
            # Extract text
            if uploaded_file.type == "application/pdf":
                transcript_text = extract_text_from_pdf(uploaded_file)
            else:
                transcript_text = uploaded_file.read().decode("utf-8")
            
            # Extract persona
            extractor = PersonaExtractor(api_key)
            persona = extractor.extract_persona(transcript_text)
            
            # Generate agent
            agent_name = persona.get("name", f"Agent_{idx+1}")
            agent = AgentGenerator(api_key, persona, transcript_text)
            
            # Save to session and database
            st.session_state.agents[agent_name] = {
                "agent": agent,
                "persona": persona,
                "transcript": transcript_text
            }
            st.session_state.personas[agent_name] = persona
            
            # Save to database
            agent_id = save_agent_to_db(agent_name, persona, transcript_text)
            st.session_state.agents[agent_name]["db_id"] = agent_id
            
            progress_bar.progress((idx + 1) / len(uploaded_files))
        
        status_text.text("✅ All agents generated!")
        st.sidebar.success(f"🎉 Generated {len(uploaded_files)} agent(s)!")
        st.rerun()

# Load existing agents from database
if not st.session_state.agents:
    db_agents = load_agents_from_db()
    if db_agents:
        st.sidebar.markdown("### 📚 Existing Agents")
        for agent_info in db_agents[:5]:  # Show last 5
            if st.sidebar.button(f"Load {agent_info['name']}", key=f"load_{agent_info['id']}"):
                # Recreate agent from database
                persona = agent_info["persona"]
                # Note: transcript not loaded to save memory, agents work without it for UI feedback
                agent = AgentGenerator(api_key, persona, "")
                st.session_state.agents[agent_info["name"]] = {
                    "agent": agent,
                    "persona": persona,
                    "transcript": "",
                    "db_id": agent_info["id"]
                }
                st.session_state.current_agent = agent_info["name"]
                st.rerun()

# Agent selection
if st.session_state.agents:
    st.sidebar.markdown("### 👤 Select Agent")
    agent_names = list(st.session_state.agents.keys())
    current_agent_name = st.sidebar.selectbox(
        "Active Agent",
        agent_names,
        index=agent_names.index(st.session_state.current_agent) if st.session_state.current_agent in agent_names else 0
    )
    st.session_state.current_agent = current_agent_name
    
    # Show persona preview
    with st.sidebar.expander("🎭 Persona Preview"):
        persona = st.session_state.personas[current_agent_name]
        st.markdown(f"**Name:** {persona.get('name', 'Unknown')}")
        st.markdown(f"**Age:** {persona.get('age', 'Unknown')}")
        st.markdown(f"**Occupation:** {persona.get('occupation', 'Unknown')}")
        st.markdown(f"**Style:** {persona.get('communication_style', 'casual')}")
        
        if persona.get('ui_pain_points'):
            st.markdown("**UI Pain Points:**")
            for pain in persona.get('ui_pain_points', [])[:3]:
                st.markdown(f"- {pain}")

# Main content area
if not st.session_state.agents:
    st.info("👈 Upload a transcript in the sidebar to generate your first agent!")
    
    # Show example
    with st.expander("📖 How It Works"):
        st.markdown("""
        ### Inception Agents v2 - Quick Guide
        
        **1. Upload Transcripts** 
        - Upload PDF/text files of user interview transcripts
        - System extracts authentic personas with demographics, goals, pain points, and UI preferences
        
        **2. Generate Agents**
        - AI creates agents that embody each persona
        - Agents remember transcript context and have UI feedback capabilities
        
        **3. Chat & Get UI Feedback**
        - Ask agents about their experiences (on-transcript)
        - Explore hypothetical scenarios (off-transcript)
        - **Share UI designs** via image upload
        - Get human-like critiques tied to persona traits
        
        **4. Analyze Insights**
        - Export chat history and feedback
        - Cluster common themes
        - Generate reports for UX teams
        
        ---
        
        **Example Use Case:**
        Upload Abdul's transcript (self-employed, frustrated with loan apps) → Generate agent → Share loan form UI → Get feedback: *"This asks company details upfront—big problem for self-employed like me, I'd quit!"*
        """)

else:
    # Chat interface
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown(f"### 💬 Chat with {st.session_state.current_agent}")
        
        # Chat history display
        chat_container = st.container()
        with chat_container:
            for msg in st.session_state.chat_history:
                if msg["role"] == "user":
                    st.markdown(f"**You:** {msg['content']}")
                else:
                    st.markdown(f"**{msg['agent']}:** {msg['content']}")
                
                # Show image if present
                if msg.get("image_path"):
                    try:
                        st.image(msg["image_path"], caption="Shared UI Design", width=400)
                    except:
                        st.caption(f"[Image: {msg['image_path']}]")
                
                st.markdown("---")
        
        # Chat input
        st.markdown("### 🎨 Share UI Design (Optional)")
        ui_upload = st.file_uploader(
            "Upload UI design for feedback",
            type=["png", "jpg", "jpeg", "pdf", "gif"],
            key="ui_upload",
            help="Share wireframes, mockups, or screenshots for agent critique"
        )
        
        if ui_upload:
            # Save uploaded UI
            ui_path = save_uploaded_file(ui_upload, "images")
            st.session_state.shared_ui = ui_path
            st.success(f"✅ UI design shared: {ui_upload.name}")
            
            # Show preview
            if ui_upload.type.startswith("image"):
                st.image(ui_path, caption="Preview", width=300)
        
        st.markdown("### ✍️ Your Message")
        user_input = st.text_area(
            "Ask a question or request UI feedback",
            placeholder="Example: 'What do you think about this loan application form?' or 'Do you understand EMI?'",
            key="user_input",
            height=100
        )
        
        col_send, col_clear = st.columns([1, 1])
        with col_send:
            send_btn = st.button("📤 Send", type="primary", use_container_width=True)
        with col_clear:
            clear_btn = st.button("🗑️ Clear Chat", use_container_width=True)
        
        if clear_btn:
            st.session_state.chat_history = []
            st.session_state.shared_ui = None
            st.rerun()
        
        if send_btn and user_input:
            # Get current agent
            current_agent_data = st.session_state.agents[st.session_state.current_agent]
            agent = current_agent_data["agent"]
            
            # Add user message to history
            user_msg = {"role": "user", "content": user_input}
            if st.session_state.shared_ui:
                user_msg["image_path"] = st.session_state.shared_ui
            st.session_state.chat_history.append(user_msg)
            
            # Get agent response
            with st.spinner(f"{st.session_state.current_agent} is thinking..."):
                response = agent.chat(
                    user_input,
                    image_path=st.session_state.shared_ui if st.session_state.shared_ui else None
                )
            
            # Add agent response to history
            agent_msg = {
                "role": "agent",
                "agent": st.session_state.current_agent,
                "content": response
            }
            if st.session_state.shared_ui:
                agent_msg["image_path"] = st.session_state.shared_ui
            st.session_state.chat_history.append(agent_msg)
            
            # Save to database
            if "db_id" in current_agent_data:
                # Identify tied trait (simple keyword matching)
                tied_trait = ""
                persona = current_agent_data["persona"]
                if any(keyword in response.lower() for keyword in ["lag", "slow", "speed", "performance"]):
                    tied_trait = "ui_pain_points: lagging"
                elif any(keyword in response.lower() for keyword in ["company details", "unnecessary", "irrelevant"]):
                    tied_trait = "ui_pain_points: unnecessary questions"
                elif any(keyword in response.lower() for keyword in ["hidden", "fees", "transparent"]):
                    tied_trait = "ui_pain_points: transparency"
                
                save_feedback_to_db(
                    current_agent_data["db_id"],
                    user_input,
                    response,
                    st.session_state.shared_ui or "",
                    tied_trait
                )
                
                # Log for analytics
                st.session_state.feedback_log.append({
                    "agent": st.session_state.current_agent,
                    "query": user_input,
                    "response": response,
                    "tied_trait": tied_trait,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Clear shared UI after response
            st.session_state.shared_ui = None
            
            st.rerun()
    
    with col2:
        st.markdown("### 📊 Agent Info")
        
        persona = st.session_state.personas[st.session_state.current_agent]
        
        st.markdown(f"**👤 {persona.get('name', 'Unknown')}**")
        st.markdown(f"*{persona.get('age', '')} | {persona.get('occupation', '')}*")
        
        st.markdown("#### 🎯 Goals")
        for goal in persona.get('goals', [])[:3]:
            st.markdown(f"- {goal}")
        
        st.markdown("#### 😤 Pain Points")
        for pain in persona.get('pain_points', [])[:3]:
            st.markdown(f"- {pain}")
        
        st.markdown("#### 🖼️ UI Preferences")
        for pref in persona.get('ui_preferences', [])[:3]:
            st.markdown(f"- {pref}")
        
        st.markdown("#### 🚨 UI Pain Points")
        for pain in persona.get('ui_pain_points', [])[:3]:
            st.markdown(f"- {pain}")
        
        if persona.get('key_quotes'):
            st.markdown("#### 💬 Key Quotes")
            for quote in persona.get('key_quotes', [])[:2]:
                st.markdown(f"> \"{quote}\"")

# Analytics Section
st.markdown("---")
st.markdown("## 📈 Analytics & Insights")

col_analytics1, col_analytics2 = st.columns(2)

with col_analytics1:
    if st.button("📊 Analyze Feedback", type="secondary"):
        if st.session_state.feedback_log:
            df = pd.DataFrame(st.session_state.feedback_log)
            
            st.markdown("### Feedback Summary")
            st.dataframe(df[["agent", "query", "tied_trait", "timestamp"]], use_container_width=True)
            
            # Theme clustering
            st.markdown("### 🔍 Common Themes")
            theme_counts = df["tied_trait"].value_counts()
            st.bar_chart(theme_counts)
            
        else:
            st.info("No feedback logged yet. Chat with agents and share UI designs to generate insights!")

with col_analytics2:
    if st.button("💾 Export Session", type="secondary"):
        if st.session_state.chat_history:
            # Create export data
            export_data = {
                "agent": st.session_state.current_agent,
                "persona": st.session_state.personas[st.session_state.current_agent],
                "chat_history": st.session_state.chat_history,
                "feedback_log": st.session_state.feedback_log,
                "exported_at": datetime.now().isoformat()
            }
            
            # Convert to JSON
            json_str = json.dumps(export_data, indent=2)
            
            # Create download
            st.download_button(
                label="📥 Download JSON",
                data=json_str,
                file_name=f"inception_agents_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
            st.success("✅ Session ready for export!")
        else:
            st.info("No chat history to export yet.")

# Footer
st.markdown("---")
st.markdown("**Inception Agents v2** | Built with empathy for real users 🧠💙 | [View on GitHub](#)")
st.caption("💡 Tip: Upload multiple transcripts to create a diverse agent pool for comprehensive UX testing!")
