# 📖 Transcript to Rich Persona Guide

## How Sirius v2.02 Transforms Your Transcripts into AI Agents

This guide explains how to use interview transcripts, research documents, or user conversations to generate **detailed, behaviorally-accurate AI personas** with our two-stage AI pipeline.

---

## 🎯 What You Can Upload

### Supported File Formats
- **📄 Text Files** (`.txt`) - Plain text transcripts
- **📊 Excel Files** (`.xlsx`, `.xls`) - Structured data or conversation logs
- **📋 CSV Files** (`.csv`) - Tabular transcript data
- **📝 Word Documents** (`.docx`, `.doc`) - Interview transcripts
- **🔧 Data Files** (`.json`) - Structured persona data
- **📄 Other Formats** (`.rtf`, `.odt`, `.md`, `.html`) - Various document types

### File Size Limit
- Maximum **10 MB** per file
- Maximum **50 MB** total upload

---

## 🔄 The Two-Stage AI Pipeline

### Stage 1: Behavioral Analysis 🧠
**Model**: GPT-4o at temperature 0.2 (precise extraction)

The AI analyzes your transcript to extract:

#### **Speech Patterns**
- Sentence length (short/medium/long)
- Formality level (1-10 scale)
- Filler words ("um", "like", "you know", "basically")
- Common phrases and expressions
- Self-correction frequency
- Question style (direct/indirect/clarifying)

#### **Vocabulary Profile**
- Complexity level (1-10)
- Avoided technical words
- Commonly used words and expressions

#### **Emotional Profile**
- Baseline mood (positive/neutral/negative/anxious/enthusiastic)
- Frustration triggers (specific words/topics)
- Excitement triggers (things they love)

#### **Cognitive Profile**
- Comprehension speed (slow/medium/fast)
- Patience level (1-10)

#### **Behavioral Signals**
- **Objectives**: What they're trying to achieve
- **Needs**: What they require to succeed
- **Fears**: Deep concerns and anxieties
- **Apprehensions**: Surface-level worries
- **Knowledge Bounds**: What they know confidently, partially, or not at all

#### **Real Quotes**
- Extracts 3-5 authentic quotes from the transcript

---

### Stage 2: Persona Synthesis 🎭
**Model**: GPT-4o at temperature 0.5 (creative synthesis)

The AI creates:

#### **Complete Persona Object** (51 database fields)
```json
{
  "name": "Authentic name or generated",
  "occupation": "Job title from context",
  "location": "City, State",
  "demographics": {
    "age": 28,
    "gender": "extracted or inferred",
    "education": "from transcript",
    "income_range": "inferred from context"
  },
  "traits": {
    "personality": ["detail-oriented", "empathetic"],
    "work_style": ["collaborative", "methodical"]
  },
  "communication_style": {
    "formality": "casual-professional",
    "preferred_tone": "friendly yet informative",
    "response_length": "medium"
  },
  "speech_patterns": {
    "filler_words": ["um", "like", "you know"],
    "common_phrases": ["I think", "basically"],
    "sentence_structure": "conversational"
  },
  "emotional_profile": {
    "baseline": "positive",
    "frustration_triggers": ["confusing UI", "slow loading"],
    "excitement_triggers": ["clean design", "easy workflow"]
  },
  "knowledge_bounds": {
    "confident": ["mobile apps", "social media"],
    "partial": ["design principles", "UX best practices"],
    "unknown": ["technical implementation", "backend systems"]
  },
  "tech_savviness": "high",
  "domain_literacy": "medium",
  "objectives": ["find quick solutions", "avoid complex workflows"],
  "needs": ["clear instructions", "visual feedback"],
  "fears": ["making mistakes", "losing data"],
  "apprehensions": ["new interfaces", "complicated settings"],
  "motivations": ["efficiency", "simplicity"],
  "frustrations": ["hidden features", "unclear error messages"]
}
```

#### **Master System Prompt** (2-3K characters)
A comprehensive AI instruction that captures:
- Exact speaking style and vocabulary constraints
- Emotional baseline and triggers
- Knowledge boundaries and confidence levels
- Decision-making patterns
- Behavioral tendencies
- Cultural and demographic context

---

## 📝 How to Prepare Your Transcript

### ✅ Best Format: Conversation Style

Your transcript should look like this:

```
M: Hello, can you tell me about your experience with our app?
R: Yeah, so, um, I've been using it for about 3 months now. It's pretty good overall.

M: What do you like most about it?
R: I really like how simple it is. Like, I don't have to think too much, you know? Everything is where I expect it to be.

M: Have you faced any challenges?
R: Well, sometimes the search doesn't work the way I want. Like, if I misspell something, it just shows nothing instead of suggesting corrections.

M: That's helpful feedback. How often do you use the app?
R: Pretty much daily. I check it in the morning for updates and then throughout the day.

M: What would make it better for you?
R: Honestly? Just faster loading times. When I'm on the go, I don't want to wait, you know? Also, maybe a dark mode? My eyes get tired at night.
```

**Key Elements:**
- `M:` = Moderator/Interviewer
- `R:` = Respondent/Participant
- Natural conversation flow
- Include filler words and natural speech patterns
- Capture emotional tone ("I really like", "honestly", "frustrating")

---

### ✅ Alternative Format: Structured Data

For CSV/Excel files:

| name | transcript | age | occupation | location |
|------|-----------|-----|------------|----------|
| Priya | M: Tell me about... R: So basically... | 28 | Product Manager | Mumbai, Maharashtra |

**Supported Column Names:**
- **Transcript**: `transcript`, `text`, `content`, `raw_text`
- **Identity**: `name`, `participant`, `user`
- **Demographics**: `age`, `gender`, `role`, `title`, `position`, `company`, `organization`, `location`, `city`, `education`, `income`

---

### ✅ For Your Google Doc Example

Based on the document you shared, here's how to convert it:

#### Option 1: Export as Plain Text (.txt)
1. Open your Google Doc
2. File → Download → Plain Text (.txt)
3. Upload to Sirius

#### Option 2: Copy-Paste into a TXT File
1. Copy all content from Google Doc
2. Create a new `.txt` file
3. Paste the content
4. Upload to Sirius

#### Option 3: Export as Word Document (.docx)
1. File → Download → Microsoft Word (.docx)
2. Upload to Sirius

The system will automatically:
- Extract conversation turns (M: / R: format)
- Identify behavioral patterns
- Generate a complete persona

---

## 🚀 Step-by-Step Upload Process

### 1. Navigate to "Generate Agents"
Click the **"Generate Agents"** tab in the sidebar

### 2. Upload Your Transcript
- **Drag & drop** your file into the upload area, OR
- **Click** the upload area to browse files

### 3. Configure Settings (Optional)
- **Number of Agents**: Choose 1-10 (default: 5)
  - For a single transcript, select **1** agent

### 4. Click "Generate AI Agents"
The system will:
- ✅ Upload your file
- ✅ Parse the content
- ✅ Run Stage 1 analysis (30-60 seconds)
- ✅ Run Stage 2 synthesis (30-60 seconds)
- ✅ Generate avatar
- ✅ Create master system prompt
- ✅ Save to database

### 5. View Your Generated Agent
Navigate to:
- **"Agent Library"** to see all agents
- **"Detailed Personas"** to view complete profile
- **"Chat"** to start conversations

---

## 🎨 What Gets Generated

### Rich Persona Card
Professional, UXPressia-style card showing:
- Name, photo, location, occupation
- Demographics (age, education, family)
- Personality traits and behaviors
- Goals, needs, frustrations
- Tech savviness and domain knowledge
- Motivations and fears
- Real quotes from transcript

### Chat-Ready AI Agent
- Responds in character with authentic speech patterns
- Uses learned vocabulary and filler words
- Shows appropriate emotional responses
- Respects knowledge boundaries
- Exhibits consistent behavior across conversations

### Master System Prompt
A comprehensive AI instruction containing:
- Complete behavioral profile
- Speech pattern rules
- Vocabulary constraints
- Emotional triggers
- Knowledge boundaries
- Decision-making patterns

---

## 💡 Pro Tips

### For Best Results:

1. **Include Natural Speech**
   - Keep filler words ("um", "like", "you know")
   - Keep self-corrections ("I mean", "actually")
   - Keep emotional expressions ("I love", "frustrating")

2. **Conversation Length**
   - Minimum: **300 words** for basic persona
   - Ideal: **1000-2000 words** for rich persona
   - Maximum: **10,000 words** (will be truncated)

3. **Multiple Personas**
   - Upload multiple transcript files separately
   - Each file generates one persona
   - Or use CSV/Excel with multiple rows

4. **Demographic Hints**
   - Include demographic info in transcript context
   - Example: "As a 28-year-old software engineer..."
   - Or use structured data format (CSV/Excel)

---

## 🔍 Example: Your Google Doc Transcript

If your transcript looks like this:

```
M: How do you currently handle your finances?
R: Um, honestly, I'm not great at it. I mostly just use my banking app to check my balance. I know I should budget more, but like, it's overwhelming, you know?

M: What makes it overwhelming?
R: There are so many apps and tools. I tried one once, but it wanted me to connect my bank account, and I was worried about security. Plus, it had all these categories and settings... I just gave up.

M: What would make it easier?
R: Something simple. Like, just tell me if I'm spending too much. I don't need fancy charts. Maybe just a notification like "Hey, you're spending a lot on food this week."
```

The AI will generate:

**Persona Attributes:**
- **Name**: Rahul / Priya (generated)
- **Age**: 25-30 (inferred)
- **Tech Savviness**: Medium (uses apps but cautious)
- **Domain Knowledge**: Low (finance/budgeting)
- **Speech Pattern**: Casual, uses filler words
- **Emotional Profile**: Anxious about complexity
- **Frustrations**: Overwhelming interfaces, security concerns
- **Needs**: Simple, clear, automated solutions
- **Apprehensions**: Connecting bank accounts, complex settings

**Master System Prompt** will include:
- Use conversational language with "um", "like", "you know"
- Express uncertainty about technical details
- Show concern about security
- Prefer simple explanations over complex features
- Avoid financial jargon

---

## 🎯 Real-World Example

### Input: User Research Transcript
```
M: Tell me about your morning routine.
R: So, I wake up around 6:30, and the first thing I do is check my phone. Not proud of it, but like, I need to see if there are any urgent emails or messages. Then I usually scroll through Instagram for a bit while I'm still in bed.

M: What apps do you check?
R: Mainly WhatsApp for work group messages, then Gmail, and Instagram. Sometimes Twitter, but I'm trying to use that less because it's just... negative, you know?

M: How do you feel about notifications?
R: Love-hate relationship. I need them for work stuff, but they're also super distracting. I've turned off most app notifications, but I keep email and WhatsApp on because I don't want to miss anything important.
```

### Output: Generated AI Persona
- **Name**: Ananya Sharma
- **Age**: 27
- **Occupation**: Marketing Manager
- **Location**: Bangalore, Karnataka
- **Tech Savviness**: High
- **Communication Style**: Casual-professional
- **Filler Words**: "like", "you know", "super"
- **Emotional Baseline**: Positive but slightly anxious
- **Frustrations**: Notification overload, social media negativity
- **Needs**: Work-life balance, focus time
- **Behaviors**: Early adopter, phone-dependent, FOMO-driven

When you chat with this persona, they will:
- Use casual language with "like" and "you know"
- Show awareness of tech but conflicted feelings
- Express concerns about distraction and negativity
- Respond based on their stated app preferences

---

## ❓ FAQ

### Q: Can I upload multiple transcripts at once?
**A**: Yes! Upload a CSV/Excel file with multiple rows, each containing a transcript.

### Q: What if my transcript doesn't have M:/R: format?
**A**: The AI is smart enough to extract behavioral signals from any conversational text. The M:/R: format just helps with clarity.

### Q: How accurate are the generated personas?
**A**: Very accurate! The two-stage pipeline (analysis → synthesis) ensures behavioral fidelity. The persona will speak, think, and respond exactly like the original transcript.

### Q: Can I edit the persona after generation?
**A**: Currently, personas are immutable after generation. For changes, upload a new transcript.

### Q: What happens to my transcript after upload?
**A**: The file is processed and then immediately deleted from the server. Only the extracted persona data is stored.

### Q: Can I use interview recordings?
**A**: You'll need to transcribe audio/video first. Use services like Otter.ai, Rev.com, or Google's Speech-to-Text.

---

## 🎓 Next Steps

1. **Prepare your transcript** using one of the formats above
2. **Navigate to "Generate Agents"** in Sirius
3. **Upload your file** and generate your AI persona
4. **View in "Detailed Personas"** to see the complete profile
5. **Start chatting** to interact with your realistic AI agent
6. **Use in Group Chat** for multi-agent conversations

---

## 📚 Additional Resources

- **Sample Transcripts**: See `/sample_transcripts.csv` for examples
- **Backend Documentation**: See `/ENHANCED_PERSONA_SYSTEM.md` for technical details
- **API Endpoints**: Use `/transcript-upload` for programmatic access

---

## 🤝 Support

If you encounter any issues or have questions:
1. Check the **Generation Status** modal for detailed logs
2. Ensure your transcript is at least 300 words
3. Verify file format and size limits
4. Review the sample transcripts for formatting examples

---

**Made with ❤️ by Sirius v2.02 - Enhanced AI Intelligence Platform**

