# Enhanced Persona Extraction Template for AI Agents

## Overview
This template provides a comprehensive framework for extracting realistic human behavior patterns from user transcripts to create AI agents that behave exactly like real humans for design testing purposes.

## Template Structure

### 1. Basic Information Extraction
```json
{
  "basic_info": {
    "name": "Person's name (use Indian names if not specified)",
    "age": "Estimated age (number)",
    "gender": "Male/Female/Other",
    "occupation": "Job title or profession",
    "company": "Company name (use Indian companies if not specified)",
    "location": "City, State (use Indian locations if not specified)",
    "education": "Education level (e.g., 'Bachelor's in Computer Science')",
    "income_range": "Income bracket (e.g., '₹5-10 Lakhs')",
    "family_status": "Single/Married/Divorced/Widowed",
    "tech_savviness": "low/medium/high (1-10 scale)",
    "english_proficiency": "basic/intermediate/advanced"
  }
}
```

### 2. Communication Style Analysis
```json
{
  "communication_style": {
    "formality_level": "casual/professional/formal (1-10 scale)",
    "sentence_length": "short/medium/long",
    "speaking_pace": "slow/medium/fast",
    "filler_words": ["um", "like", "you know", "actually", "basically"],
    "common_phrases": ["phrase1", "phrase2", "phrase3"],
    "question_style": "direct/indirect/tentative",
    "agreement_style": "enthusiastic/neutral/reserved",
    "disagreement_style": "diplomatic/direct/avoidant",
    "interruption_style": "polite/assertive/aggressive",
    "explanation_style": "detailed/brief/step-by-step"
  }
}
```

### 3. Personality Traits & Values
```json
{
  "personality_traits": {
    "primary_traits": ["trait1", "trait2", "trait3"],
    "secondary_traits": ["trait4", "trait5"],
    "values": ["value1", "value2", "value3"],
    "attitudes": {
      "towards_technology": "enthusiastic/neutral/skeptical",
      "towards_change": "embracing/cautious/resistant",
      "towards_authority": "respectful/questioning/deferential",
      "towards_risk": "risk-taking/balanced/risk-averse"
    },
    "decision_making": "analytical/intuitive/consensus-based/authoritative",
    "learning_style": "visual/auditory/kinesthetic/reading",
    "social_preference": "extroverted/introverted/ambivert"
  }
}
```

### 4. Emotional Profile
```json
{
  "emotional_profile": {
    "baseline_mood": "positive/neutral/negative",
    "emotional_range": "narrow/moderate/wide",
    "stress_indicators": ["indicator1", "indicator2"],
    "frustration_triggers": ["trigger1", "trigger2", "trigger3"],
    "excitement_triggers": ["trigger1", "trigger2", "trigger3"],
    "anxiety_triggers": ["trigger1", "trigger2"],
    "confidence_indicators": ["indicator1", "indicator2"],
    "humor_style": "sarcastic/playful/dry/self-deprecating",
    "empathy_level": "high/medium/low"
  }
}
```

### 5. Cognitive Profile
```json
{
  "cognitive_profile": {
    "attention_span": "short/medium/long",
    "processing_speed": "slow/medium/fast",
    "memory_style": "visual/auditory/kinesthetic",
    "problem_solving": "systematic/creative/collaborative",
    "information_processing": "sequential/parallel/holistic",
    "patience_level": "low/medium/high (1-10 scale)",
    "perfectionism": "low/medium/high (1-10 scale)",
    "multitasking_ability": "poor/fair/good/excellent"
  }
}
```

### 6. Behavioral Patterns
```json
{
  "behavioral_patterns": {
    "work_style": "collaborative/independent/mixed",
    "communication_preference": "email/phone/in-person/chat",
    "meeting_style": "structured/flexible/minimal",
    "feedback_style": "constructive/direct/gentle",
    "conflict_resolution": "avoidant/confrontational/collaborative",
    "time_management": "punctual/flexible/chaotic",
    "organization_style": "meticulous/moderate/casual"
  }
}
```

### 7. Goals and Motivations
```json
{
  "goals_and_motivations": {
    "primary_goals": ["goal1", "goal2", "goal3"],
    "secondary_goals": ["goal4", "goal5"],
    "career_aspirations": ["aspiration1", "aspiration2"],
    "personal_motivations": ["motivation1", "motivation2"],
    "success_metrics": ["metric1", "metric2"],
    "fear_of_failure": "low/medium/high (1-10 scale)",
    "ambition_level": "low/medium/high (1-10 scale)"
  }
}
```

### 8. Pain Points and Challenges
```json
{
  "pain_points_and_challenges": {
    "primary_pain_points": ["pain1", "pain2", "pain3"],
    "secondary_pain_points": ["pain4", "pain5"],
    "workplace_challenges": ["challenge1", "challenge2"],
    "technology_challenges": ["challenge1", "challenge2"],
    "communication_challenges": ["challenge1", "challenge2"],
    "time_management_issues": ["issue1", "issue2"],
    "stress_factors": ["factor1", "factor2", "factor3"]
  }
}
```

### 9. Technology Usage
```json
{
  "technology_usage": {
    "devices_used": ["smartphone", "laptop", "tablet", "desktop"],
    "preferred_platforms": ["iOS", "Android", "Windows", "Mac"],
    "frequently_used_apps": ["app1", "app2", "app3"],
    "comfort_with_new_tech": "low/medium/high (1-10 scale)",
    "preferred_learning_method": "tutorials/documentation/trial-and-error/help",
    "tech_support_preference": "self-service/peer-help/professional-support"
  }
}
```

### 10. Daily Life Context
```json
{
  "daily_life_context": {
    "morning_routine": "early-riser/standard/late-starter",
    "work_environment": "office/remote/hybrid",
    "commute_style": "car/public-transport/walking/cycling",
    "leisure_activities": ["activity1", "activity2", "activity3"],
    "social_circles": "work-friends/family-friends/mixed",
    "hobbies": ["hobby1", "hobby2", "hobby3"],
    "lifestyle": "busy/balanced/relaxed"
  }
}
```

### 11. Domain Expertise
```json
{
  "domain_expertise": {
    "primary_domain": "domain name",
    "expertise_level": "beginner/intermediate/advanced/expert",
    "years_of_experience": "number",
    "key_skills": ["skill1", "skill2", "skill3"],
    "knowledge_gaps": ["gap1", "gap2"],
    "learning_interests": ["interest1", "interest2"],
    "industry_awareness": "low/medium/high"
  }
}
```

### 12. Quotes and Voice
```json
{
  "quotes_and_voice": {
    "representative_quotes": ["exact quote 1", "exact quote 2", "exact quote 3"],
    "speaking_patterns": ["pattern1", "pattern2"],
    "vocabulary_complexity": "simple/intermediate/advanced (1-10 scale)",
    "jargon_usage": "minimal/moderate/heavy",
    "accent_indicators": ["indicator1", "indicator2"],
    "formality_consistency": "consistent/variable"
  }
}
```

### 13. Interaction Preferences
```json
{
  "interaction_preferences": {
    "preferred_communication_length": "brief/medium/detailed",
    "response_style": "immediate/thoughtful/delayed",
    "question_asking_style": "direct/indirect/tentative",
    "help_seeking_behavior": "independent/collaborative/dependent",
    "feedback_receiving": "open/defensive/selective",
    "conflict_handling": "avoidant/confrontational/collaborative"
  }
}
```

### 14. Design Testing Persona
```json
{
  "design_testing_persona": {
    "user_type": "primary/secondary/tertiary",
    "use_case_priority": "high/medium/low",
    "pain_point_severity": "critical/moderate/minor",
    "willingness_to_adopt": "high/medium/low",
    "influence_level": "high/medium/low",
    "feedback_quality": "detailed/constructive/superficial",
    "testing_behavior": "thorough/casual/selective"
  }
}
```

## Extraction Guidelines

### Key Principles
1. **Pay attention to subtle cues** like hesitation, repetition, emphasis, and emotional undertones
2. **Extract exact quotes** that show speaking patterns and personality
3. **Identify implicit behaviors** and preferences from context
4. **Look for contradictions** or inconsistencies that make the person human
5. **Capture the person's unique voice** and communication style
6. **Focus on what makes this person different** from generic users
7. **Extract both stated and unstated needs** and motivations
8. **Pay attention to how they handle uncertainty**, frustration, and success
9. **Note their problem-solving approach** and decision-making style
10. **Capture their relationship with technology** and learning

### Example Analysis

**Transcript Sample:**
> "Hi, I'm Maria and I've been working in UX design for about 8 years now. I really love creating interfaces that are both beautiful and functional. I get frustrated when developers don't understand the user's perspective, but I try to be patient and explain things clearly. I prefer working with tools that have good documentation and I always ask lots of questions to make sure I understand the requirements properly."

**Extracted Patterns:**
- **Communication Style**: Professional but friendly, uses "I really love" showing enthusiasm
- **Personality**: Patient, detail-oriented, collaborative
- **Pain Points**: Frustration with developer communication gaps
- **Values**: User-centered design, clear communication
- **Work Style**: Prefers documentation, asks questions proactively
- **Emotional Profile**: Generally positive but gets frustrated with miscommunication

## Usage Instructions

1. **Upload transcript** via the frontend interface
2. **System automatically extracts** persona data using the enhanced template
3. **AI agent is created** with realistic human behavior patterns
4. **Agent can be used** for design testing and feedback
5. **Conversation starters** and testing scenarios are generated automatically

## Benefits

- **Realistic Human Behavior**: Agents behave like real users, not generic AI
- **Detailed Personas**: Comprehensive understanding of user characteristics
- **Design Testing Focus**: Specifically optimized for design feedback
- **Cultural Context**: Supports Indian demographics and contexts
- **Scalable**: Can process multiple transcripts and create diverse agent personas

## Next Steps

1. Upload your 9 user transcripts
2. System will extract detailed personas using this template
3. AI agents will be created with realistic human behavior
4. Use agents for design testing and feedback
5. Iterate and improve based on agent performance
