# Comprehensive Persona Structure Documentation

## Overview
This document describes the enhanced persona structure with 50+ fields for creating rich, realistic AI agent personas from user research transcripts.

## Complete Persona Schema

```json
{
  "name": "string",
  "age": "integer",
  "gender": "string",
  
  "location": {
    "city": "string",
    "state": "string"
  },
  
  "profession": {
    "occupation": "string",
    "background": "string (work history, income, transitions)"
  },
  
  "personality": {
    "personality_traits": ["string"],
    "values": ["string"],
    "motivations": ["string"]
  },
  
  "hobbies": ["string"],
  
  "goals": {
    "short_term": ["string"],
    "long_term": ["string"]
  },
  
  "pain_points": {
    "general": ["string"],
    "ui_pain_points": ["string"]
  },
  
  "financial_profile": {
    "fintech_preferences": {
      "apps": ["string"],
      "banks": ["string"],
      "payment_habits": ["string"],
      "credit_cards": ["string (with limits if mentioned)"]
    }
  },
  
  "communication_style": {
    "tone": "string",
    "vocabulary_level": "string"
  },
  
  "emotional_profile": {
    "triggers": ["string"],
    "responses": ["string"],
    "tone": "string"
  },
  
  "social_context": {
    "family": "string",
    "friends": "string",
    "community_values": ["string"]
  },
  
  "cultural_background": {
    "heritage": "string",
    "beliefs": ["string"],
    "traditions": ["string"]
  },
  
  "daily_routine": ["string"],
  
  "decision_making": {
    "style": "string",
    "influences": ["string"]
  },
  
  "life_events": [
    {
      "event": "string",
      "year": "integer",
      "impact": "string"
    }
  ],
  
  "tech_profile": {
    "tech_savviness": "string",
    "english_level": "string"
  },
  
  "key_quotes": ["string"],
  
  "image": {
    "image_url": "string",
    "image_data": {
      "thumb": "string",
      "small": "string",
      "full": "string",
      "alt": "string",
      "photographer": "string",
      "attribution": "string"
    }
  },
  
  "source_meta": {
    "source_file": "string",
    "confidence_score": "float (0-1)",
    "timestamps": ["ISO datetime"]
  },
  
  "behavioral_patterns": {
    "habits": ["string"],
    "routines_beyond_daily": ["string"]
  },
  
  "relational_dynamics": {
    "family_interaction": "string",
    "friend_interaction": "string",
    "professional_interaction": "string"
  },
  
  "cognitive_biases": ["string"],
  
  "sensory_preferences": {
    "preferred_modalities": ["string"],
    "disliked_modalities": ["string"]
  },
  
  "humor_style": {
    "humor_type": "string",
    "humor_level": "string"
  },
  
  "conflict_resolution": {
    "strategies": ["string"],
    "preferred_outcomes": "string"
  },
  
  "learning_style": {
    "style": "string",
    "preferred_resources": ["string"]
  },
  
  "ethical_stance": {
    "financial_ethics": ["string"],
    "scam_sensitivity": "string"
  },
  
  "interaction_preferences": {
    "preferred_channels": ["string"],
    "response_time_expectations": "string"
  },
  
  "trust_factors": {
    "trust_builders": ["string"],
    "trust_breakers": ["string"]
  },
  
  "motivational_triggers": {
    "positive_triggers": ["string"],
    "negative_triggers": ["string"]
  }
}
```

## Field Descriptions

### Basic Information
- **name**: Full name of the persona
- **age**: Age in years
- **gender**: Gender identity
- **location**: City and state/province

### Professional Information
- **profession.occupation**: Current job title or role
- **profession.background**: Work history, income details, career transitions

### Personality & Values
- **personality.personality_traits**: Core traits (frank, practical, empathetic, etc.)
- **personality.values**: What they value (transparency, discipline, etc.)
- **personality.motivations**: Key drivers (independence, security, etc.)

### Goals
- **goals.short_term**: Goals for weeks/months ahead
- **goals.long_term**: Goals for years ahead

### Pain Points
- **pain_points.general**: Overall frustrations
- **pain_points.ui_pain_points**: Specific UI/UX issues

### Financial Profile
- **fintech_preferences.apps**: Financial apps used
- **fintech_preferences.banks**: Banking institutions
- **fintech_preferences.payment_habits**: How they prefer to pay
- **fintech_preferences.credit_cards**: Cards with limits

### Communication
- **communication_style.tone**: Overall tone (practical, formal, casual)
- **communication_style.vocabulary_level**: Language sophistication

### Emotional Profile
- **emotional_profile.triggers**: What causes emotional reactions
- **emotional_profile.responses**: How they respond emotionally
- **emotional_profile.tone**: Overall emotional disposition

### Social Context
- **social_context.family**: Family relationships
- **social_context.friends**: Friend circle description
- **social_context.community_values**: Community/cultural values

### Cultural Background
- **cultural_background.heritage**: Cultural roots
- **cultural_background.beliefs**: Religious/cultural beliefs
- **cultural_background.traditions**: Cultural practices

### Daily Routine
- Array of daily activities (morning, afternoon, evening)

### Decision Making
- **decision_making.style**: How they make decisions
- **decision_making.influences**: What influences their choices

### Life Events
- Significant events with year and impact

### Tech Profile
- **tech_savviness**: Technology comfort level
- **english_level**: English proficiency

### Key Quotes
- Direct quotes from transcript

### Image
- Profile image URLs and metadata

### Source Metadata
- **source_file**: Original transcript filename
- **confidence_score**: Extraction confidence (0-1)
- **timestamps**: When processed

### Advanced Behavioral Fields

#### Behavioral Patterns
- **habits**: Regular habits
- **routines_beyond_daily**: Weekly/monthly routines

#### Relational Dynamics
- How they interact with family, friends, professionals

#### Cognitive Biases
- Observed biases (loss aversion, confirmation bias, etc.)

#### Sensory Preferences
- Preferred and disliked sensory experiences

#### Humor Style
- Type and level of humor

#### Conflict Resolution
- How they handle conflicts

#### Learning Style
- Preferred learning methods and resources

#### Ethical Stance
- Financial ethics and scam sensitivity

#### Interaction Preferences
- Preferred communication channels and response expectations

#### Trust Factors
- What builds and breaks trust

#### Motivational Triggers
- Positive motivators and negative triggers

## Example: Abdul Yasser

See `TRANSCRIPT_FORMAT_GUIDE.md` for transcript examples that generate this comprehensive structure.

## Usage

### API Endpoint
```
POST /process-transcripts
{
  "transcripts": ["transcript text"],
  "source_files": ["filename.txt"]
}
```

### Response
```json
{
  "success": true,
  "personas": [/* array of comprehensive personas */],
  "total_transcripts": 1,
  "total_personas": 1
}
```

## Storage

Personas are stored in PostgreSQL:
- Basic fields: Direct columns
- Complex structures: JSON in `persona_json` column
- Images: Unsplash URLs in `avatar_url`

## AI Model

- **Model**: GPT-4o
- **Temperature**: 0.1 (low for consistent extraction)
- **Max Tokens**: 4096 (for comprehensive output)

## Confidence Scoring

Confidence score calculated based on:
- Critical fields: name, age, gender, location, profession (70% weight)
- Rich fields: personality, goals, pain points, etc. (30% weight)

Score range: 0.0 to 1.0

---

**Updated**: October 18, 2025  
**Version**: 2.0  
**Based on**: UXPressia persona format + Fintech enhancements

