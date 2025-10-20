"""
Comprehensive Persona Data Models
Enhanced structure for rich AI agent personas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# Location Models
class Location(BaseModel):
    city: str = Field(description="City name")
    state: str = Field(description="State/Province name")

# Profession Models
class Profession(BaseModel):
    occupation: str = Field(description="Current occupation/job title")
    background: str = Field(default="", description="Professional background, work history, income details")

# Personality Models
class Personality(BaseModel):
    personality_traits: List[str] = Field(default_factory=list, description="Core personality traits")
    values: List[str] = Field(default_factory=list, description="Core personal values")
    motivations: List[str] = Field(default_factory=list, description="Key motivations and drivers")

# Goals Models
class Goals(BaseModel):
    short_term: List[str] = Field(default_factory=list, description="Short-term goals (weeks/months)")
    long_term: List[str] = Field(default_factory=list, description="Long-term goals (years)")

# Pain Points Models
class PainPoints(BaseModel):
    general: List[str] = Field(default_factory=list, description="General frustrations and problems")
    ui_pain_points: List[str] = Field(default_factory=list, description="UI/UX specific pain points")

# Financial Profile Models
class FintechPreferences(BaseModel):
    apps: List[str] = Field(default_factory=list, description="Financial apps used")
    banks: List[str] = Field(default_factory=list, description="Banks/financial institutions")
    payment_habits: List[str] = Field(default_factory=list, description="Payment preferences and habits")
    credit_cards: List[str] = Field(default_factory=list, description="Credit cards with limits if mentioned")

class FinancialProfile(BaseModel):
    fintech_preferences: FintechPreferences = Field(default_factory=FintechPreferences)

# Communication Models
class CommunicationStyle(BaseModel):
    tone: str = Field(default="neutral", description="Overall communication tone")
    vocabulary_level: str = Field(default="conversational", description="Vocabulary sophistication level")

# Emotional Profile Models
class EmotionalProfile(BaseModel):
    triggers: List[str] = Field(default_factory=list, description="Emotional triggers")
    responses: List[str] = Field(default_factory=list, description="How they respond emotionally")
    tone: str = Field(default="balanced", description="Overall emotional tone")

# Social Context Models
class SocialContext(BaseModel):
    family: str = Field(default="", description="Family relationships and dynamics")
    friends: str = Field(default="", description="Friend circle and social life")
    community_values: List[str] = Field(default_factory=list, description="Community and cultural values")

# Cultural Background Models
class CulturalBackground(BaseModel):
    heritage: str = Field(default="", description="Cultural heritage and roots")
    beliefs: List[str] = Field(default_factory=list, description="Cultural/religious beliefs")
    traditions: List[str] = Field(default_factory=list, description="Cultural traditions and practices")

# Decision Making Models
class DecisionMaking(BaseModel):
    style: str = Field(default="analytical", description="Decision-making style")
    influences: List[str] = Field(default_factory=list, description="Key influences on decisions")

# Life Events Models
class LifeEvent(BaseModel):
    event: str = Field(description="Life event description")
    year: int = Field(description="Year of event")
    impact: str = Field(description="Impact on person's life")

# Tech Profile Models
class TechProfile(BaseModel):
    tech_savviness: str = Field(default="intermediate", description="Technology comfort level")
    english_level: str = Field(default="intermediate", description="English proficiency level")

# Image Models
class ImageData(BaseModel):
    thumb: str = Field(default="", description="Thumbnail image URL")
    small: str = Field(default="", description="Small image URL")
    full: str = Field(default="", description="Full-size image URL")
    alt: str = Field(default="", description="Image alt text")
    photographer: str = Field(default="", description="Photographer name")
    attribution: str = Field(default="", description="Attribution text")

class Image(BaseModel):
    image_url: str = Field(default="", description="Primary image URL")
    image_data: ImageData = Field(default_factory=ImageData)

# Source Metadata Models
class SourceMeta(BaseModel):
    source_file: str = Field(default="", description="Source file name")
    confidence_score: float = Field(default=0.0, description="Extraction confidence (0-1)")
    timestamps: List[str] = Field(default_factory=list, description="Processing timestamps")

# Behavioral Patterns Models
class BehavioralPatterns(BaseModel):
    habits: List[str] = Field(default_factory=list, description="Regular habits")
    routines_beyond_daily: List[str] = Field(default_factory=list, description="Weekly/monthly routines")

# Relational Dynamics Models
class RelationalDynamics(BaseModel):
    family_interaction: str = Field(default="", description="How they interact with family")
    friend_interaction: str = Field(default="", description="How they interact with friends")
    professional_interaction: str = Field(default="", description="Professional interaction style")

# Sensory Preferences Models
class SensoryPreferences(BaseModel):
    preferred_modalities: List[str] = Field(default_factory=list, description="Preferred sensory experiences")
    disliked_modalities: List[str] = Field(default_factory=list, description="Disliked sensory experiences")

# Humor Style Models
class HumorStyle(BaseModel):
    humor_type: str = Field(default="subtle", description="Type of humor")
    humor_level: str = Field(default="moderate", description="Humor usage level")

# Conflict Resolution Models
class ConflictResolution(BaseModel):
    strategies: List[str] = Field(default_factory=list, description="Conflict resolution strategies")
    preferred_outcomes: str = Field(default="", description="Preferred outcomes in conflicts")

# Learning Style Models
class LearningStyle(BaseModel):
    style: str = Field(default="self-paced", description="Learning style preference")
    preferred_resources: List[str] = Field(default_factory=list, description="Preferred learning resources")

# Ethical Stance Models
class EthicalStance(BaseModel):
    financial_ethics: List[str] = Field(default_factory=list, description="Financial ethics and principles")
    scam_sensitivity: str = Field(default="medium", description="Sensitivity to scams")

# Interaction Preferences Models
class InteractionPreferences(BaseModel):
    preferred_channels: List[str] = Field(default_factory=list, description="Preferred communication channels")
    response_time_expectations: str = Field(default="", description="Expected response times")

# Trust Factors Models
class TrustFactors(BaseModel):
    trust_builders: List[str] = Field(default_factory=list, description="Factors that build trust")
    trust_breakers: List[str] = Field(default_factory=list, description="Factors that break trust")

# Motivational Triggers Models
class MotivationalTriggers(BaseModel):
    positive_triggers: List[str] = Field(default_factory=list, description="Positive motivators")
    negative_triggers: List[str] = Field(default_factory=list, description="Negative triggers to avoid")

# Main Comprehensive Persona Model
class ComprehensivePersona(BaseModel):
    """
    Complete persona structure with all fields for rich AI agent generation
    Based on UXPressia persona format with fintech and behavioral enhancements
    """
    # Basic Information
    name: str = Field(description="Full name")
    age: int = Field(description="Age in years")
    gender: str = Field(description="Gender identity")
    location: Location = Field(description="Location details")
    
    # Professional Information
    profession: Profession = Field(description="Professional details")
    
    # Personality & Values
    personality: Personality = Field(default_factory=Personality)
    
    # Hobbies & Interests
    hobbies: List[str] = Field(default_factory=list, description="Hobbies and interests")
    
    # Goals
    goals: Goals = Field(default_factory=Goals)
    
    # Pain Points
    pain_points: PainPoints = Field(default_factory=PainPoints)
    
    # Financial Profile
    financial_profile: FinancialProfile = Field(default_factory=FinancialProfile)
    
    # Communication
    communication_style: CommunicationStyle = Field(default_factory=CommunicationStyle)
    
    # Emotional Profile
    emotional_profile: EmotionalProfile = Field(default_factory=EmotionalProfile)
    
    # Social Context
    social_context: SocialContext = Field(default_factory=SocialContext)
    
    # Cultural Background
    cultural_background: CulturalBackground = Field(default_factory=CulturalBackground)
    
    # Daily Routine
    daily_routine: List[str] = Field(default_factory=list, description="Daily routine patterns")
    
    # Decision Making
    decision_making: DecisionMaking = Field(default_factory=DecisionMaking)
    
    # Life Events
    life_events: List[LifeEvent] = Field(default_factory=list, description="Significant life events")
    
    # Technical Profile
    tech_profile: TechProfile = Field(default_factory=TechProfile)
    
    # Key Quotes
    key_quotes: List[str] = Field(default_factory=list, description="Direct quotes from transcript")
    
    # Image
    image: Image = Field(default_factory=Image)
    
    # Source Metadata
    source_meta: SourceMeta = Field(default_factory=SourceMeta)
    
    # Advanced Behavioral Fields
    behavioral_patterns: BehavioralPatterns = Field(default_factory=BehavioralPatterns)
    relational_dynamics: RelationalDynamics = Field(default_factory=RelationalDynamics)
    cognitive_biases: List[str] = Field(default_factory=list, description="Identified cognitive biases")
    sensory_preferences: SensoryPreferences = Field(default_factory=SensoryPreferences)
    humor_style: HumorStyle = Field(default_factory=HumorStyle)
    conflict_resolution: ConflictResolution = Field(default_factory=ConflictResolution)
    learning_style: LearningStyle = Field(default_factory=LearningStyle)
    ethical_stance: EthicalStance = Field(default_factory=EthicalStance)
    interaction_preferences: InteractionPreferences = Field(default_factory=InteractionPreferences)
    trust_factors: TrustFactors = Field(default_factory=TrustFactors)
    motivational_triggers: MotivationalTriggers = Field(default_factory=MotivationalTriggers)

