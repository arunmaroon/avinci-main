# 🚀 Inception Agents v2 - 5-Minute Quickstart

Get from zero to running in 5 minutes!

---

## ⚡ Ultra-Fast Setup

### Step 1: Install (30 seconds)

```bash
cd inception_agents
pip install -r requirements.txt
```

### Step 2: Configure (10 seconds)

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

### Step 3: Launch (5 seconds)

```bash
streamlit run app.py
```

**Done!** App opens at http://localhost:8501

---

## 🎯 First Test (2 minutes)

### 1. Generate Your First Agent

1. Click **"Browse files"** in sidebar
2. Select `sample_transcript.txt`
3. Click **"🎬 Generate Agents"**
4. Wait ~30 seconds

### 2. Chat with Abdul

```
You: "Tell me about your Money View experience"

Abdul: "Money View... [sighs] the app kept lagging when I needed 
Rs. 50,000 for equipment. Took almost 2 hours because it kept 
freezing during peak hours around 7 PM. I was so close to giving up!"
```

### 3. Get UI Feedback

1. Click **"Upload UI design for feedback"**
2. Select `images/mock_loan_form.png`
3. Type: `"What do you think about this loan form?"`
4. Click **"📤 Send"**

**Abdul responds:**
> "This form asks company details—big problem for self-employed like me! 
> I'd probably quit the app. Why not check eligibility first?"

---

## 🎨 Test All 4 Mock UIs

| Image | What It Tests | Expected Feedback |
|-------|--------------|------------------|
| `mock_loan_form.png` | Company field | "Bad for self-employed!" |
| `eligibility_screen.png` | Purpose upfront | "Show eligibility first!" |
| `loading_screen.png` | Wait time | "Reminds me of Money View lag" |
| `fee_transparency_screen.png` | Clear fees | "Exactly what I want!" |

---

## 💡 Quick Tips

### Get Better Responses

**Good questions:**
- "How would you feel about this form?"
- "What would make you quit this app?"
- "Does this remind you of Money View?"

**Less effective:**
- "Is this good?" (too vague)
- "Rate 1-10" (not human-like)

### Create Your Own Agent

1. Record a user interview (or use existing transcript)
2. Save as PDF or TXT
3. Upload to app
4. Include: name, job, pain points, app experiences

**Example structure:**
```
Interviewer: Tell me about yourself.
User: I'm Sarah, 28, salaried employee at TCS...

Interviewer: What loan apps have you used?
User: I tried MoneyTap but the verification took 3 days...
```

---

## 🔥 Power User Shortcuts

### Batch Process

```bash
# Upload multiple transcripts at once
# Select 5-10 files → Generate → All agents created
```

### Export for Analysis

```bash
# Click "💾 Export Session"
# Get JSON with all feedback
# Import to Excel/Tableau for reports
```

### Scale to 100s

```bash
# Agents automatically saved to agents.db
# Load existing agents from sidebar
# No need to regenerate each session
```

---

## 🐛 Common Issues (30-second fixes)

### "OpenAI API Key Required"

```bash
export OPENAI_API_KEY="sk-..."
# Or enter in app sidebar
```

### "Module not found"

```bash
pip install -r requirements.txt
```

### "Port already in use"

```bash
streamlit run app.py --server.port=8502
```

### Vision API not working?

- Check OpenAI account tier (needs GPT-4 vision)
- Or: Agent falls back to text-based critique automatically

---

## 📖 Next Steps

**Learn more:**
- `README.md` - Full features overview
- `USAGE_GUIDE.md` - Detailed instructions
- `PROJECT_SUMMARY.md` - Technical architecture

**Deploy:**
- `DEPLOYMENT.md` - Production deployment guide

**Customize:**
- Edit `utils.py` to tune persona extraction
- Modify `app.py` to change UI layout

---

## 🎓 Example Workflows

### Workflow 1: Quick UI Test (5 minutes)

```
1. Upload transcript → Generate agent (2 min)
2. Share 3 design variations (1 min)
3. Compare feedback (1 min)
4. Export insights (30 sec)
5. Share with team (30 sec)
```

### Workflow 2: Deep UX Research (30 minutes)

```
1. Upload 10 transcripts → Generate 10 agents (5 min)
2. Select diverse personas (self-employed, salaried, etc.) (2 min)
3. Test 5 screens with each agent (15 min)
4. Analyze theme clusters (5 min)
5. Create report (3 min)
```

### Workflow 3: Design Iteration (ongoing)

```
Week 1: Test initial design
Week 2: Address feedback, test v2
Week 3: Compare responses
Week 4: Ship validated design
```

---

## 💬 Example Conversations

### On-Transcript (Based on Interview)

```
You: "What frustrated you most about loan apps?"
Abdul: "The lagging! Money View froze for 2 hours during my Rs. 50k 
application. And asking company details when I'm self-employed—
that's just useless."
```

### Off-Transcript (Extrapolation)

```
You: "Do you understand EMI calculations?"
Abdul: "Yes, absolutely. When I took that 18-month Shriram loan at 
11%, my EMI was around Rs. 3,000/month. Way more transparent than 
credit card hidden charges."
```

### UI Feedback (Vision-Powered)

```
You: "Feedback on this loan form?" [uploads image]
Abdul: "Looking at this—company details field at the top is a problem 
for self-employed like me. Also, all these fields might cause lag. 
Show eligibility first, then ask details!"
```

---

## 🏆 Success Checklist

- [ ] App runs without errors
- [ ] Abdul agent generated from sample transcript
- [ ] Chat works (on-transcript questions)
- [ ] UI feedback works (mock_loan_form.png)
- [ ] Analytics shows feedback themes
- [ ] Session exports to JSON

**All checked?** You're ready to use Inception Agents v2! 🎉

---

## 🚀 Ready for More?

**Scale up:**
- Process 20+ transcripts
- Create diverse agent pool
- Run comprehensive UX testing

**Integrate:**
- Map to `/api/agent` in your backend
- Connect to Sirius platform
- Build custom analytics pipeline

**Customize:**
- Add new agent tools
- Implement group chats
- Support video prototypes

---

**Need help?** Check:
- `USAGE_GUIDE.md` - Detailed walkthrough
- `integration_test.py` - Run full test suite
- `DEPLOYMENT.md` - Production setup

---

Built with empathy 🧠💙 | v2.0 | Ready in 5 minutes
