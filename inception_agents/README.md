# Inception Agents v2 - AI Tool for User Research Sims with UI Feedback

Created for Arun Murugesan | Built with empathy, no-judgment style

## 🚀 What's New in v2

**UI Feedback Layer**: Share UI designs (images/wireframes) in chat and get human-like feedback from AI agents based on real user personas extracted from transcripts.

- **Upload Transcripts**: Extract authentic personas from user interviews
- **Generate Agents**: Create AI agents that embody real user experiences, pain points, and preferences
- **Chat On & Off-Transcript**: Ask agents about their experiences or hypothetical scenarios
- **UI Critique**: Share design mockups/wireframes—agents critique like real users, tying feedback to their transcript experiences
  - Example: Abdul sees a loan form asking company details → "Big problem for self-employed like me, I'd quit the app!"
  - Ties to transcript themes: lagging apps, unnecessary questions, transparency issues

## 🎯 Vision

Enable fintech and UX teams to test designs with AI agents that simulate real users:
- Empathetic, authentic responses based on actual user research
- Practical UI feedback tied to user pain points
- Scale to 100s of personas for comprehensive testing
- No fluff, human-like critiques (e.g., "This form is too long—I'd lose patience like with Money View's lag")

## 🛠️ Tech Stack

Built on v1 foundation with enhancements:
- **Python 3.11+** - Core language
- **Streamlit** - Interactive web interface
- **LangChain/LangGraph** - AI agent orchestration
- **OpenAI GPT-4** - Language model (with vision support for UI feedback)
- **FAISS** - Vector storage for transcript retrieval
- **PyPDF2** - PDF transcript processing
- **Pillow** - Image handling for UI previews
- **SQLite** - Storage for scaling to 100s of agents
- **Pandas** - Analytics for feedback insights

## 📋 Prerequisites

```bash
# Install Python dependencies
pip install streamlit langchain langchain-openai langchain-community faiss-cpu pypdf2 pillow pandas openai

# Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"
```

For real vision capabilities, ensure your OpenAI API key supports `gpt-4-vision-preview` or `gpt-4o`.

## 🚀 Quick Start

```bash
# Navigate to project directory
cd inception_agents

# Run the Streamlit app
streamlit run app.py
```

## 📖 How It Works

### 1. Upload Transcripts
- Upload PDF or text transcripts of user interviews
- System extracts personas with demographics, pain points, goals, and UI preferences

### 2. Generate Agents
- AI creates agents embodying each persona
- Agents have memory of transcript context and UI biases

### 3. Chat & Get UI Feedback
- Ask agents about their experiences (on-transcript)
- Explore hypothetical scenarios (off-transcript, e.g., "Do you understand EMI?")
- **Share UI designs** via image upload
- Get human-like critiques tied to persona traits:
  - UI preferences: short processes, digital-first, transparency
  - Pain points: lagging apps, hidden fees, irrelevant forms

### 4. Analyze Insights
- Export chat history and UI feedback
- Cluster common themes (e.g., "lagging" complaints)
- Generate CSV reports for UX teams

## 📁 Project Structure

```
inception_agents/
├── app.py                  # Main Streamlit application
├── utils.py                # PersonaExtractor, AgentGenerator, ImageFeedbackTool
├── images/                 # Uploaded UI designs for critique
├── agents.db               # SQLite storage for scaling (100s of agents)
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🎨 Example Use Cases

### Fintech Testing
- Share loan application UI with agents extracted from Money View/Shriram Finance user transcripts
- Get feedback like: "This eligibility screen asks purpose early—unnecessary! Ask after approval like I said in my interview."

### UX Iteration
- Upload 5 wireframe variations
- Compare agent feedback across personas (self-employed vs. salaried, tech-savvy vs. traditional)
- Identify common friction points before building

### Research Validation
- Verify if design addresses transcript pain points
- Ensure UI aligns with user mental models

## 🔗 Integration with Sirius

Can be mapped to `/api/agent` endpoint for programmatic access:
- POST transcript → GET persona
- POST image + agent_id → GET critique JSON

## 🌟 Key Features

✅ **Authentic Personas** - Extracted from real user transcripts
✅ **Human-like Feedback** - Empathetic, practical, no AI jargon
✅ **UI Context Awareness** - Agents view designs and critique in character
✅ **Scalable** - Store 100s of agents in SQLite
✅ **Analytics** - Cluster feedback themes, export insights
✅ **Flexible Chat** - On-transcript memories + off-transcript extrapolation

## 🚦 Next Steps

- **Multi-agent group chats** - Simulate focus group discussions
- **Video prototype feedback** - Support video/animation critiques
- **Real-time collaboration** - Share sessions with team members
- **Advanced analytics** - Sentiment analysis, heatmap of UI critique areas

---

**Built with empathy for real users** 🧠💙

Version 2.0 | Enhanced with UI Feedback Layer
