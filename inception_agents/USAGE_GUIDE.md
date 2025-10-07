# Inception Agents v2 - Usage Guide

## 🚀 Quick Start

### 1. Installation

```bash
cd inception_agents
pip install -r requirements.txt
```

### 2. Set Up API Key

```bash
# Option 1: Environment variable
export OPENAI_API_KEY="your-key-here"

# Option 2: Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env
```

### 3. Run the Application

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

---

## 📖 Step-by-Step Guide

### Step 1: Upload Transcripts

1. Click **"Browse files"** in the sidebar
2. Select one or more transcript files (PDF or TXT)
3. Click **"🎬 Generate Agents"**
4. Wait for persona extraction and agent creation

**Tips:**
- Upload multiple transcripts to create a diverse agent pool
- Use real user interview transcripts for authentic personas
- See `sample_transcript.txt` for format reference

### Step 2: Select an Agent

1. Choose an agent from the **"Active Agent"** dropdown
2. Click **"🎭 Persona Preview"** to see their profile
3. Review their goals, pain points, and UI preferences

### Step 3: Chat with the Agent

**On-Transcript Questions** (about their experiences):
```
You: "Tell me about your experience with Money View"
Agent: "Money View... [sighs] the app kept lagging when I needed Rs. 50k..."
```

**Off-Transcript Questions** (hypothetical):
```
You: "Do you understand EMI?"
Agent: "Yeah, when I took that 18-month Shriram loan at 11%, the EMI was..."
```

### Step 4: Get UI Feedback

1. Click **"Upload UI design for feedback"**
2. Select an image file (PNG, JPG, PDF)
3. Type your question: *"What do you think about this loan form?"*
4. Click **"📤 Send"**

The agent will:
- View the UI design using GPT-4 vision
- Provide human-like critique
- Tie feedback to their pain points and experiences

**Example Feedback:**
> "Ok, looking at this form—it's asking for company details right at the start. Big problem for me as self-employed! I'd probably quit the app like I almost did with that other one. Why not ask this after showing if I'm even eligible?"

### Step 5: Analyze Insights

1. Click **"📊 Analyze Feedback"**
2. Review the feedback summary table
3. Explore common themes visualization
4. Click **"💾 Export Session"** to download JSON

---

## 🎯 Use Cases

### Fintech UX Testing

**Scenario:** Testing a new loan application flow

1. Upload transcripts from 10 real users (self-employed, salaried, various tech levels)
2. Generate 10 agents
3. Share 3 design variations
4. Compare feedback across personas
5. Identify common friction points

**Expected Insights:**
- Self-employed users frustrated by "company details" fields
- Less tech-savvy users need clearer eligibility criteria
- All users sensitive to app performance/lagging

### Design Iteration

**Scenario:** Iterating on a specific screen

1. Select agent with relevant pain points
2. Upload initial design
3. Get feedback
4. Refine design based on critique
5. Upload new version
6. Compare responses

### Research Validation

**Scenario:** Verify if design addresses user needs

1. Review persona's transcript pain points
2. Share your solution design
3. Check if agent acknowledges improvements
4. Identify remaining gaps

---

## 💡 Tips for Best Results

### Creating Better Transcripts

- **Include specific incidents:** "Money View lagged for 2 hours during peak time"
- **Capture emotions:** Frustration, confusion, delight
- **Record UI mentions:** App names, specific features, pain points
- **Note preferences:** "I prefer digital over offline"
- **Include quotes:** Memorable phrases in user's voice

### Asking Better Questions

**Good:**
- "What's your reaction to this form asking company details upfront?"
- "Would you use an app that looks like this?"
- "What would make you quit this flow?"

**Less Effective:**
- "Is this good?" (too vague)
- "Rate this design 1-10" (not human-like)
- "What color should this button be?" (too granular for research personas)

### Interpreting Feedback

- **Tie to traits:** If agent mentions "lag," check their `ui_pain_points`
- **Look for patterns:** Multiple agents citing same issue = priority
- **Context matters:** Self-employed vs. salaried users have different needs
- **Authenticity check:** Responses should feel human, not generic

---

## 🔧 Advanced Features

### Scaling to 100s of Agents

Agents are automatically saved to `agents.db`. To load existing agents:

1. Click agent name in **"📚 Existing Agents"** sidebar
2. Agent reloads from database
3. Continue chatting where you left off

### Batch Processing

Upload multiple transcripts at once:

```python
# All files processed sequentially
# Progress bar shows status
# Agents saved to database automatically
```

### Analytics Export

JSON export includes:
- Agent persona details
- Full chat history
- UI feedback log with timestamps
- Tied traits for each response

Use for:
- Creating reports for UX teams
- Clustering themes with external tools
- Longitudinal testing (compare feedback over time)

---

## 🐛 Troubleshooting

### "OpenAI API Key Required"

**Solution:** Enter your API key in the sidebar or set environment variable

```bash
export OPENAI_API_KEY="sk-..."
```

### Agent Responses Feel Generic

**Causes:**
- Transcript too short/vague
- Persona extraction didn't capture enough detail
- Off-transcript question too far from user's experience

**Solutions:**
- Use longer, more detailed transcripts
- Include specific incidents and emotions
- Ask questions closer to user's domain (fintech, not cooking)

### UI Feedback Not Working

**Possible Issues:**
1. Image format not supported → Try PNG/JPG
2. Vision API not available → Check OpenAI account tier
3. Image too large → Resize to < 2MB

**Fallback:** Agent will provide text-based critique based on persona

### App Crashes on Upload

**Common Causes:**
- PDF encryption/protection
- Memory issues with large files
- Corrupted file

**Solutions:**
- Try plain text version
- Split large files
- Check file integrity

---

## 📊 Example Workflow

### Real-World Example: Money View Redesign

**Context:** Redesigning loan application for self-employed users

**Step 1: Gather Data**
- Upload 5 transcripts from self-employed users
- Upload 3 transcripts from salaried users

**Step 2: Generate Agents**
- 8 agents created (Abdul, Priya, Raj, etc.)

**Step 3: Test Current Design**
- Share existing Money View screens
- Collect feedback from all agents
- **Insight:** 4/5 self-employed agents frustrated by "company details"

**Step 4: Create Alternative**
- Design new flow with "employment type" selector
- Self-employed path skips company questions

**Step 5: Validate**
- Share new design with same agents
- **Result:** Self-employed agents respond positively
- Export data for stakeholder presentation

**Step 6: Iterate**
- Address remaining issues (eligibility clarity)
- Final round of validation
- Ship with confidence!

---

## 🌟 Pro Tips

1. **Mix personas:** Test with diverse users (tech-savvy, traditional, various employment types)
2. **Compare responses:** Same question to multiple agents reveals patterns
3. **Use expanders:** Keep persona previews open to remember context
4. **Export frequently:** Save sessions after each major design iteration
5. **Trust the agents:** If multiple personas cite same issue, it's real

---

## 🔗 Integration

### API Access (Future)

Map to `/api/agent` for programmatic use:

```bash
POST /api/agent/extract_persona
POST /api/agent/chat
POST /api/agent/ui_feedback
```

### Sirius Integration

Can be integrated with the existing Sirius platform:
- Share OpenAI API key
- Map routes to backend
- Store agents in PostgreSQL instead of SQLite

---

## 📞 Support

**Issues?**
- Check USAGE_GUIDE.md (this file)
- Review sample_transcript.txt for format
- Test with mock_loan_form.png

**Feature Requests:**
- Multi-agent group chats
- Video prototype feedback
- Real-time collaboration

---

Built with empathy for real users 🧠💙

Version 2.0 | Enhanced with UI Feedback Layer
