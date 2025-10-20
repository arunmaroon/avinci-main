# Transcript Format Guide for AI Agent Generation

## Overview
This guide explains the proper transcript format for generating AI agent personas from user research interviews.

## ✅ Correct Format: Moderator/Respondent

The AI system is now optimized to understand user research transcripts with the following roles:

### **Moderator** (Researcher/Interviewer)
- The person conducting the research
- Asks questions to understand the user
- **Their statements are NOT extracted as persona data**
- Used only for context

### **Respondent** (User/Participant)
- The person being interviewed
- Provides information about themselves
- **All their responses are extracted to create the AI persona**
- This is the person who becomes the AI agent

## Example Format

```
User Research Interview - [Topic]

Moderator: Hi, thanks for joining us today. Can you tell us about your role?

Respondent: Hi! I'm Sarah Chen, a product manager at TechCorp in Mumbai. I've been here for about 3 years and I'm 32 years old.

Moderator: What are your main pain points with current tools?

Respondent: The biggest issue is that our tools don't integrate well. We're constantly switching between platforms, and it's really inefficient.

Moderator: How do you handle user feedback?

Respondent: We use in-app surveys and analytics tools. But it's scattered across different platforms.

Moderator: What would your ideal solution look like?

Respondent: Something that brings everything together in one place. And it needs to be mobile-friendly.
```

## Alternative Formats (Also Supported)

The system also understands these variations:

### Interviewer/Respondent
```
Interviewer: Tell me about yourself.
Respondent: I'm Abdul, 24, from Bangalore...
```

### Researcher/Participant
```
Researcher: What apps do you use?
Participant: I use PhonePe and Zerodha...
```

### Named Speakers
```
Interviewer: What's your occupation?
Abdul: I'm a day trader in Bangalore...
```

## What Gets Extracted

From the **Respondent's** answers, the system extracts:

### Basic Information (Required)
- Name, age, gender
- Occupation, location (city, state)

### Rich Persona Details (51 Fields)
- **Personality**: Traits, communication style
- **Background**: Education, experience
- **Financial Profile**: Apps used, banks, payment habits
- **Pain Points**: General frustrations, UI issues
- **Goals & Motivations**: Career goals, life aspirations
- **Communication**: Key quotes, tone, language level
- **Cultural Context**: Heritage, beliefs, traditions
- **Social Context**: Family, friends, community values
- **Daily Life**: Routines, habits
- **Decision Making**: Style, influences
- **Life Events**: Significant events with years

## Tips for Better Results

### ✅ DO
- Use "Moderator:" and "Respondent:" labels
- Include specific details (name, age, location, occupation)
- Mention specific apps, banks, tools used
- Include direct quotes and examples
- Describe pain points and frustrations
- Mention goals and motivations

### ❌ DON'T
- Use generic labels like "Person 1:", "Speaker A:"
- Mix moderator and respondent statements
- Omit basic information (name, location, age)
- Use vague descriptions
- Include only questions without answers

## Example: Complete Good Transcript

```
User Research Interview - Day Trader

Moderator: Hi, thanks for joining us today. Can you introduce yourself?

Respondent: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore, Karnataka. I work as a day trader, mostly dealing with stocks and crypto.

Moderator: What financial apps do you use regularly?

Respondent: I use PhonePe for daily payments, Zerodha for trading, and I have savings accounts with HDFC and ICICI banks. I also tried Slice Pay, but the hidden charges were a big problem.

Moderator: What are your main pain points with current financial tools?

Respondent: The biggest issue is hidden charges. You think you're getting a good deal, but then there are all these random fees. Also, the UI is often confusing - too many buttons and options everywhere. I prefer simple, clean interfaces that get straight to the point.

Moderator: Tell me about your goals.

Respondent: I want to be financially independent by the time I'm 30. My family has always struggled with money, so I'm determined to break that cycle. I also love the challenge of trading - it's like solving a new puzzle every day.

Moderator: How comfortable are you with technology?

Respondent: Pretty comfortable. I use my phone for everything - trading, payments, banking, staying in touch with friends. But I get frustrated when apps are unnecessarily complicated or have too many steps.
```

### This Will Generate:
- **Name**: Abdul Yasser
- **Age**: 24
- **Location**: Bangalore, Karnataka
- **Occupation**: Day trader
- **Apps**: PhonePe, Zerodha, Slice Pay
- **Banks**: HDFC, ICICI
- **Pain Points**: Hidden charges, confusing UI, too many options
- **Goals**: Financial independence by 30
- **Motivations**: Break family financial struggles, loves challenges
- **Tech Level**: High
- **Personality**: Direct, analytical, goal-oriented
- **And 40+ more fields!**

## Integration

This format is automatically recognized by:
- ✅ Frontend: "Paste Transcript" feature
- ✅ Backend: `/api/transcript/upload` endpoint
- ✅ Data Processing: Enhanced transcript processor with GPT-4o

## Testing

Use the **"Load Sample Transcript"** button in the Generate Users modal to see a properly formatted example.

---

**Updated**: October 18, 2025  
**Version**: 1.0  
**Contact**: Avinci Development Team

