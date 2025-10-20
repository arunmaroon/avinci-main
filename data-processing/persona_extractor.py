"""
Persona Extractor - Python module for extracting persona data from transcripts
Uses spaCy and NLTK for advanced text processing and persona extraction
"""

import os
import json
import re
import requests
from typing import Dict, List, Any, Optional
import spacy
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('maxent_ne_chunker', quiet=True)
    nltk.download('words', quiet=True)
except:
    pass

class PersonaExtractor:
    def __init__(self):
        """Initialize the persona extractor with NLP models"""
        self.nlp = spacy.load("en_core_web_sm") if self._load_spacy_model() else None
        self.sia = SentimentIntensityAnalyzer()
        self.api_base_url = os.getenv('API_BASE_URL', 'http://localhost:9001')
        self.pexels_api_key = os.getenv('PEXELS_API_KEY')
        self.pexels_base_url = 'https://api.pexels.com/v1/search'
        
    def _load_spacy_model(self) -> bool:
        """Load spaCy model, install if not available"""
        try:
            spacy.load("en_core_web_sm")
            return True
        except OSError:
            print("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
            return False

    def extract_persona_from_transcript(self, transcript: str, demographics: Dict = None) -> Dict[str, Any]:
        """
        Extract comprehensive persona data from transcript
        
        Args:
            transcript: Raw transcript text
            demographics: Optional demographic information
            
        Returns:
            Dictionary containing extracted persona data
        """
        if not transcript:
            raise ValueError("Transcript cannot be empty")
            
        # Basic text preprocessing
        cleaned_transcript = self._clean_text(transcript)
        
        # Extract various persona aspects
        persona_data = {
            # Basic Information
            'name': self._extract_name(cleaned_transcript, demographics),
            'title': self._extract_title(cleaned_transcript, demographics),
            'company': self._extract_company(cleaned_transcript, demographics),
            'location': self._extract_location(cleaned_transcript, demographics),
            
            # Demographics
            'age': self._extract_age(cleaned_transcript, demographics),
            'gender': self._extract_gender(cleaned_transcript, demographics),
            'education': self._extract_education(cleaned_transcript, demographics),
            'income_range': self._extract_income_range(cleaned_transcript, demographics),
            'family_status': self._extract_family_status(cleaned_transcript, demographics),
            'occupation': self._extract_occupation(cleaned_transcript, demographics),
            'industry': self._extract_industry(cleaned_transcript, demographics),
            'experience_years': self._extract_experience_years(cleaned_transcript, demographics),
            
            # Personality & Traits
            'personality_archetype': self._extract_personality_archetype(cleaned_transcript),
            'big_five_traits': self._extract_big_five_traits(cleaned_transcript),
            'personality_adjectives': self._extract_personality_adjectives(cleaned_transcript),
            'values': self._extract_values(cleaned_transcript),
            'beliefs': self._extract_beliefs(cleaned_transcript),
            'attitudes': self._extract_attitudes(cleaned_transcript),
            
            # Goals & Motivations
            'primary_goals': self._extract_primary_goals(cleaned_transcript),
            'secondary_goals': self._extract_secondary_goals(cleaned_transcript),
            'motivations': self._extract_motivations(cleaned_transcript),
            'aspirations': self._extract_aspirations(cleaned_transcript),
            'fears': self._extract_fears(cleaned_transcript),
            'concerns': self._extract_concerns(cleaned_transcript),
            'pain_points': self._extract_pain_points(cleaned_transcript),
            'frustrations': self._extract_frustrations(cleaned_transcript),
            
            # Behavior & Habits
            'daily_routine': self._extract_daily_routine(cleaned_transcript),
            'habits': self._extract_habits(cleaned_transcript),
            'preferences': self._extract_preferences(cleaned_transcript),
            'behaviors': self._extract_behaviors(cleaned_transcript),
            'lifestyle': self._extract_lifestyle(cleaned_transcript),
            'hobbies': self._extract_hobbies(cleaned_transcript),
            
            # Technology & Tools
            'tech_savviness': self._extract_tech_savviness(cleaned_transcript),
            'preferred_devices': self._extract_preferred_devices(cleaned_transcript),
            'apps_used': self._extract_apps_used(cleaned_transcript),
            'tech_comfort_level': self._extract_tech_comfort_level(cleaned_transcript),
            'digital_behavior': self._extract_digital_behavior(cleaned_transcript),
            
            # Communication
            'communication_style': self._extract_communication_style(cleaned_transcript),
            'language_preferences': self._extract_language_preferences(cleaned_transcript),
            'vocabulary_level': self._extract_vocabulary_level(cleaned_transcript),
            'speech_patterns': self._extract_speech_patterns(cleaned_transcript),
            
            # Emotional & Cognitive
            'emotional_profile': self._extract_emotional_profile(cleaned_transcript),
            'cognitive_style': self._extract_cognitive_style(cleaned_transcript),
            'learning_style': self._extract_learning_style(cleaned_transcript),
            'attention_span': self._extract_attention_span(cleaned_transcript),
            
            # Social & Cultural
            'social_context': self._extract_social_context(cleaned_transcript),
            'cultural_background': self._extract_cultural_background(cleaned_transcript),
            'social_media_usage': self._extract_social_media_usage(cleaned_transcript),
            'network_size': self._extract_network_size(cleaned_transcript),
            'influence_level': self._extract_influence_level(cleaned_transcript),
            
            # Life Events & Context
            'life_events': self._extract_life_events(cleaned_transcript),
            'current_situation': self._extract_current_situation(cleaned_transcript),
            'future_plans': self._extract_future_plans(cleaned_transcript),
            'life_stage': self._extract_life_stage(cleaned_transcript),
            
            # Fintech-Specific
            'financial_goals': self._extract_financial_goals(cleaned_transcript),
            'financial_concerns': self._extract_financial_concerns(cleaned_transcript),
            'banking_preferences': self._extract_banking_preferences(cleaned_transcript),
            'investment_style': self._extract_investment_style(cleaned_transcript),
            'risk_tolerance': self._extract_risk_tolerance(cleaned_transcript),
            'financial_literacy': self._extract_financial_literacy(cleaned_transcript),
            
            # Metadata
            'extraction_metadata': {
                'extracted_at': datetime.now().isoformat(),
                'transcript_length': len(transcript),
                'processing_method': 'python_nlp',
                'confidence_scores': self._calculate_confidence_scores(cleaned_transcript)
            }
        }
        
        return persona_data

    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:\-()]', '', text)
        return text.strip()

    def _extract_name(self, text: str, demographics: Dict = None) -> str:
        """Extract person's name from transcript"""
        if demographics and demographics.get('name'):
            return demographics['name']
            
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text
        return "Unknown"

    def _extract_title(self, text: str, demographics: Dict = None) -> str:
        """Extract job title"""
        if demographics and demographics.get('title'):
            return demographics['title']
            
        # Common job titles
        titles = ['manager', 'director', 'analyst', 'engineer', 'consultant', 'executive', 'specialist']
        for title in titles:
            if title in text.lower():
                return title.title()
        return "Professional"

    def _extract_company(self, text: str, demographics: Dict = None) -> str:
        """Extract company name"""
        if demographics and demographics.get('company'):
            return demographics['company']
            
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    return ent.text
        return "Unknown Company"

    def _extract_location(self, text: str, demographics: Dict = None) -> str:
        """Extract location"""
        if demographics and demographics.get('location'):
            return demographics['location']
            
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "GPE":  # Geopolitical entity
                    return ent.text
        return "Unknown Location"

    def _extract_age(self, text: str, demographics: Dict = None) -> int:
        """Extract age from text"""
        if demographics and demographics.get('age'):
            return demographics['age']
            
        # Look for age patterns
        age_patterns = [
            r'(\d+)\s*years?\s*old',
            r'age\s*(\d+)',
            r'(\d+)\s*years?\s*of\s*age'
        ]
        
        for pattern in age_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                age = int(match.group(1))
                if 18 <= age <= 100:  # Reasonable age range
                    return age
        return 30  # Default age

    def _extract_gender(self, text: str, demographics: Dict = None) -> str:
        """Extract gender"""
        if demographics and demographics.get('gender'):
            return demographics['gender']
            
        # Simple gender detection based on pronouns and terms
        male_indicators = ['he', 'him', 'his', 'mr', 'sir', 'gentleman']
        female_indicators = ['she', 'her', 'hers', 'ms', 'mrs', 'madam', 'lady']
        
        text_lower = text.lower()
        male_count = sum(1 for indicator in male_indicators if indicator in text_lower)
        female_count = sum(1 for indicator in female_indicators if indicator in text_lower)
        
        if male_count > female_count:
            return "Male"
        elif female_count > male_count:
            return "Female"
        return "Unknown"

    def _extract_education(self, text: str, demographics: Dict = None) -> str:
        """Extract education level"""
        if demographics and demographics.get('education'):
            return demographics['education']
            
        education_keywords = {
            'PhD': ['phd', 'doctorate', 'ph.d'],
            'Master': ['master', 'mba', 'mca', 'mtech', 'ms'],
            'Bachelor': ['bachelor', 'btech', 'bca', 'bcom', 'ba', 'bs'],
            'Diploma': ['diploma', 'certificate'],
            'High School': ['high school', '12th', 'intermediate']
        }
        
        text_lower = text.lower()
        for level, keywords in education_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return level
        return "Unknown"

    def _extract_income_range(self, text: str, demographics: Dict = None) -> str:
        """Extract income range"""
        if demographics and demographics.get('income_range'):
            return demographics['income_range']
            
        # Look for income indicators
        income_patterns = [
            r'(\d+)\s*lakh',
            r'(\d+)\s*crore',
            r'salary\s*(\d+)',
            r'earn\s*(\d+)'
        ]
        
        for pattern in income_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount = int(match.group(1))
                if amount < 5:
                    return "Low"
                elif amount < 15:
                    return "Medium"
                else:
                    return "High"
        return "Unknown"

    def _extract_family_status(self, text: str, demographics: Dict = None) -> str:
        """Extract family status"""
        if demographics and demographics.get('family_status'):
            return demographics['family_status']
            
        family_keywords = {
            'Married': ['married', 'wife', 'husband', 'spouse'],
            'Single': ['single', 'unmarried', 'bachelor'],
            'Divorced': ['divorced', 'separated'],
            'Widowed': ['widowed', 'widow', 'widower']
        }
        
        text_lower = text.lower()
        for status, keywords in family_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return status
        return "Unknown"

    def _extract_occupation(self, text: str, demographics: Dict = None) -> str:
        """Extract occupation"""
        if demographics and demographics.get('occupation'):
            return demographics['occupation']
            
        occupations = [
            'engineer', 'manager', 'analyst', 'consultant', 'developer',
            'designer', 'teacher', 'doctor', 'lawyer', 'accountant',
            'sales', 'marketing', 'hr', 'finance', 'operations'
        ]
        
        text_lower = text.lower()
        for occupation in occupations:
            if occupation in text_lower:
                return occupation.title()
        return "Professional"

    def _extract_industry(self, text: str, demographics: Dict = None) -> str:
        """Extract industry"""
        if demographics and demographics.get('industry'):
            return demographics['industry']
            
        industries = [
            'technology', 'finance', 'healthcare', 'education', 'retail',
            'manufacturing', 'consulting', 'media', 'real estate', 'automotive'
        ]
        
        text_lower = text.lower()
        for industry in industries:
            if industry in text_lower:
                return industry.title()
        return "Unknown"

    def _extract_experience_years(self, text: str, demographics: Dict = None) -> int:
        """Extract years of experience"""
        if demographics and demographics.get('experience_years'):
            return demographics['experience_years']
            
        exp_patterns = [
            r'(\d+)\s*years?\s*of\s*experience',
            r'(\d+)\s*years?\s*in\s*the\s*field',
            r'experience\s*(\d+)\s*years?'
        ]
        
        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        return 5  # Default experience

    def _extract_personality_archetype(self, text: str) -> str:
        """Extract personality archetype"""
        archetypes = {
            'Analytical': ['analyze', 'data', 'logic', 'systematic', 'methodical'],
            'Creative': ['creative', 'innovative', 'artistic', 'imaginative'],
            'Social': ['people', 'team', 'collaborate', 'social', 'friendly'],
            'Practical': ['practical', 'realistic', 'pragmatic', 'down-to-earth'],
            'Adventurous': ['adventure', 'risk', 'explore', 'bold', 'daring']
        }
        
        text_lower = text.lower()
        scores = {}
        for archetype, keywords in archetypes.items():
            scores[archetype] = sum(1 for keyword in keywords if keyword in text_lower)
        
        return max(scores, key=scores.get) if max(scores.values()) > 0 else 'Balanced'

    def _extract_big_five_traits(self, text: str) -> Dict[str, float]:
        """Extract Big Five personality traits"""
        # Simplified Big Five extraction based on keywords
        traits = {
            'openness': 0.5,
            'conscientiousness': 0.5,
            'extraversion': 0.5,
            'agreeableness': 0.5,
            'neuroticism': 0.5
        }
        
        # This would be more sophisticated in a real implementation
        return traits

    def _extract_personality_adjectives(self, text: str) -> List[str]:
        """Extract personality adjectives"""
        adjectives = [
            'confident', 'friendly', 'analytical', 'creative', 'practical',
            'ambitious', 'patient', 'organized', 'curious', 'reliable'
        ]
        
        text_lower = text.lower()
        found_adjectives = [adj for adj in adjectives if adj in text_lower]
        return found_adjectives[:5]  # Return top 5

    def _extract_values(self, text: str) -> List[str]:
        """Extract personal values"""
        values = [
            'honesty', 'integrity', 'family', 'success', 'security',
            'freedom', 'creativity', 'knowledge', 'health', 'wealth'
        ]
        
        text_lower = text.lower()
        found_values = [value for value in values if value in text_lower]
        return found_values[:5]

    def _extract_beliefs(self, text: str) -> List[str]:
        """Extract beliefs"""
        # This would be more sophisticated in a real implementation
        return []

    def _extract_attitudes(self, text: str) -> Dict[str, str]:
        """Extract attitudes"""
        return {
            'risk_tolerance': 'medium',
            'change_acceptance': 'moderate'
        }

    def _extract_primary_goals(self, text: str) -> List[str]:
        """Extract primary goals"""
        goal_keywords = [
            'goal', 'want', 'achieve', 'aspire', 'plan', 'aim',
            'career', 'success', 'growth', 'development'
        ]
        
        sentences = sent_tokenize(text)
        goals = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in goal_keywords):
                # Extract goal from sentence
                goal = sentence.strip()
                if len(goal) < 100:  # Reasonable goal length
                    goals.append(goal)
        
        return goals[:5]

    def _extract_secondary_goals(self, text: str) -> List[str]:
        """Extract secondary goals"""
        return []

    def _extract_motivations(self, text: str) -> List[str]:
        """Extract motivations"""
        motivation_keywords = [
            'motivated', 'inspire', 'drive', 'passion', 'purpose',
            'meaning', 'fulfillment', 'satisfaction'
        ]
        
        sentences = sent_tokenize(text)
        motivations = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in motivation_keywords):
                motivations.append(sentence.strip())
        
        return motivations[:3]

    def _extract_aspirations(self, text: str) -> List[str]:
        """Extract aspirations"""
        return []

    def _extract_fears(self, text: str) -> List[str]:
        """Extract fears"""
        fear_keywords = [
            'afraid', 'fear', 'worried', 'concerned', 'anxious',
            'scared', 'nervous', 'uncertain'
        ]
        
        sentences = sent_tokenize(text)
        fears = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in fear_keywords):
                fears.append(sentence.strip())
        
        return fears[:3]

    def _extract_concerns(self, text: str) -> List[str]:
        """Extract concerns"""
        return []

    def _extract_pain_points(self, text: str) -> List[str]:
        """Extract pain points"""
        pain_keywords = [
            'problem', 'issue', 'challenge', 'difficulty', 'struggle',
            'frustration', 'pain', 'hassle', 'trouble'
        ]
        
        sentences = sent_tokenize(text)
        pain_points = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in pain_keywords):
                pain_points.append(sentence.strip())
        
        return pain_points[:5]

    def _extract_frustrations(self, text: str) -> List[str]:
        """Extract frustrations"""
        return []

    def _extract_daily_routine(self, text: str) -> Dict[str, str]:
        """Extract daily routine"""
        return {
            'morning': 'Not specified',
            'afternoon': 'Not specified',
            'evening': 'Not specified'
        }

    def _extract_habits(self, text: str) -> List[str]:
        """Extract habits"""
        return []

    def _extract_preferences(self, text: str) -> Dict[str, str]:
        """Extract preferences"""
        return {}

    def _extract_behaviors(self, text: str) -> Dict[str, str]:
        """Extract behaviors"""
        return {}

    def _extract_lifestyle(self, text: str) -> List[str]:
        """Extract lifestyle"""
        return []

    def _extract_hobbies(self, text: str) -> List[str]:
        """Extract hobbies"""
        hobby_keywords = [
            'hobby', 'interest', 'passion', 'enjoy', 'like',
            'reading', 'music', 'sports', 'travel', 'cooking'
        ]
        
        text_lower = text.lower()
        hobbies = [hobby for hobby in hobby_keywords if hobby in text_lower]
        return hobbies[:5]

    def _extract_tech_savviness(self, text: str) -> str:
        """Extract technology savviness level"""
        tech_keywords = {
            'expert': ['expert', 'advanced', 'professional', 'developer'],
            'intermediate': ['intermediate', 'moderate', 'comfortable'],
            'beginner': ['beginner', 'basic', 'simple', 'easy']
        }
        
        text_lower = text.lower()
        for level, keywords in tech_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return level
        return 'intermediate'

    def _extract_preferred_devices(self, text: str) -> List[str]:
        """Extract preferred devices"""
        devices = ['smartphone', 'laptop', 'desktop', 'tablet', 'smartwatch']
        text_lower = text.lower()
        return [device for device in devices if device in text_lower]

    def _extract_apps_used(self, text: str) -> List[str]:
        """Extract apps used"""
        apps = ['whatsapp', 'gmail', 'chrome', 'office', 'instagram', 'facebook']
        text_lower = text.lower()
        return [app for app in apps if app in text_lower]

    def _extract_tech_comfort_level(self, text: str) -> Dict[str, str]:
        """Extract technology comfort levels"""
        return {
            'mobile': 'medium',
            'desktop': 'medium',
            'web': 'medium'
        }

    def _extract_digital_behavior(self, text: str) -> Dict[str, str]:
        """Extract digital behavior"""
        return {}

    def _extract_communication_style(self, text: str) -> Dict[str, str]:
        """Extract communication style"""
        return {
            'formality': 'medium',
            'tone': 'professional',
            'length': 'medium'
        }

    def _extract_language_preferences(self, text: str) -> Dict[str, str]:
        """Extract language preferences"""
        return {
            'primary': 'English',
            'secondary': 'Hindi'
        }

    def _extract_vocabulary_level(self, text: str) -> str:
        """Extract vocabulary level"""
        # Simple vocabulary level detection
        words = word_tokenize(text)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        if avg_word_length > 6:
            return 'advanced'
        elif avg_word_length > 4:
            return 'intermediate'
        else:
            return 'basic'

    def _extract_speech_patterns(self, text: str) -> Dict[str, List[str]]:
        """Extract speech patterns"""
        return {
            'filler_words': ['um', 'uh', 'like'],
            'common_phrases': [],
            'self_corrections': []
        }

    def _extract_emotional_profile(self, text: str) -> Dict[str, str]:
        """Extract emotional profile"""
        sentiment = self.sia.polarity_scores(text)
        
        if sentiment['compound'] > 0.1:
            mood = 'positive'
        elif sentiment['compound'] < -0.1:
            mood = 'negative'
        else:
            mood = 'neutral'
        
        return {
            'baseline': mood,
            'triggers': [],
            'responses': []
        }

    def _extract_cognitive_style(self, text: str) -> Dict[str, str]:
        """Extract cognitive style"""
        return {
            'processing_speed': 'medium',
            'decision_style': 'analytical'
        }

    def _extract_learning_style(self, text: str) -> str:
        """Extract learning style"""
        return 'visual'

    def _extract_attention_span(self, text: str) -> str:
        """Extract attention span"""
        return 'medium'

    def _extract_social_context(self, text: str) -> Dict[str, str]:
        """Extract social context"""
        return {
            'family': 'Not specified',
            'friends': 'Not specified',
            'community': 'Not specified'
        }

    def _extract_cultural_background(self, text: str) -> Dict[str, str]:
        """Extract cultural background"""
        return {
            'heritage': 'Not specified',
            'traditions': [],
            'values': []
        }

    def _extract_social_media_usage(self, text: str) -> Dict[str, str]:
        """Extract social media usage"""
        return {
            'platforms': [],
            'frequency': 'medium',
            'content': 'personal'
        }

    def _extract_network_size(self, text: str) -> str:
        """Extract network size"""
        return 'medium'

    def _extract_influence_level(self, text: str) -> str:
        """Extract influence level"""
        return 'medium'

    def _extract_life_events(self, text: str) -> Dict[str, List[Dict]]:
        """Extract life events"""
        return {
            'timeline': [],
            'impact': [],
            'significance': []
        }

    def _extract_current_situation(self, text: str) -> Dict[str, str]:
        """Extract current situation"""
        return {
            'status': 'Not specified',
            'challenges': [],
            'opportunities': []
        }

    def _extract_future_plans(self, text: str) -> List[str]:
        """Extract future plans"""
        return []

    def _extract_life_stage(self, text: str) -> str:
        """Extract life stage"""
        return 'adult'

    def _extract_financial_goals(self, text: str) -> List[str]:
        """Extract financial goals"""
        financial_keywords = [
            'save', 'invest', 'retirement', 'house', 'car', 'loan',
            'wealth', 'money', 'financial', 'budget'
        ]
        
        sentences = sent_tokenize(text)
        financial_goals = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in financial_keywords):
                financial_goals.append(sentence.strip())
        
        return financial_goals[:5]

    def _extract_financial_concerns(self, text: str) -> List[str]:
        """Extract financial concerns"""
        return []

    def _extract_banking_preferences(self, text: str) -> Dict[str, str]:
        """Extract banking preferences"""
        return {
            'channels': [],
            'features': [],
            'security': 'medium'
        }

    def _extract_investment_style(self, text: str) -> str:
        """Extract investment style"""
        return 'conservative'

    def _extract_risk_tolerance(self, text: str) -> str:
        """Extract risk tolerance"""
        return 'medium'

    def _extract_financial_literacy(self, text: str) -> str:
        """Extract financial literacy"""
        return 'intermediate'

    def _calculate_confidence_scores(self, text: str) -> Dict[str, float]:
        """Calculate confidence scores for extracted data"""
        return {
            'demographics': 0.8,
            'personality': 0.6,
            'goals': 0.7,
            'behaviors': 0.5,
            'technology': 0.6,
            'financial': 0.7
        }

    def save_persona_to_backend(self, persona_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Save extracted persona to backend API"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/personas/v2",
                json={
                    'personaData': persona_data,
                    'sourceType': 'python_extraction'
                },
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {os.getenv("API_TOKEN")}'
                }
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                raise Exception(f"API Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error saving persona to backend: {e}")
            return None

    def process_batch_transcripts(self, transcripts: List[Dict[str, Any]], user_id: str) -> List[Dict[str, Any]]:
        """Process multiple transcripts in batch"""
        results = []
        
        for transcript_data in transcripts:
            try:
                transcript = transcript_data.get('text', '')
                demographics = transcript_data.get('demographics', {})
                
                persona_data = self.extract_persona_from_transcript(transcript, demographics)
                
                # Save to backend
                saved_persona = self.save_persona_to_backend(persona_data, user_id)
                
                results.append({
                    'transcript_id': transcript_data.get('id'),
                    'persona_data': persona_data,
                    'saved_persona': saved_persona,
                    'success': True
                })
                
            except Exception as e:
                results.append({
                    'transcript_id': transcript_data.get('id'),
                    'error': str(e),
                    'success': False
                })
        
        return results

    def build_image_search_query(self, persona_data: Dict[str, Any]) -> str:
        """
        Build search query for Pexels API based on 51 UXPressia fields
        
        Args:
            persona_data: Persona data dictionary
            
        Returns:
            str: Search query for image API
        """
        query_terms = []
        
        # Demographics
        if persona_data.get('gender'):
            query_terms.append(persona_data['gender'].lower())
        
        if persona_data.get('age'):
            age = persona_data['age']
            if age < 25:
                query_terms.append('young')
            elif age < 35:
                query_terms.append('young adult')
            elif age < 45:
                query_terms.append('adult')
            elif age < 55:
                query_terms.append('middle aged')
            else:
                query_terms.append('senior')
        
        # Ethnicity/Cultural background
        ethnicity = persona_data.get('ethnicity') or persona_data.get('cultural_background', '')
        if ethnicity:
            if 'indian' in ethnicity.lower():
                query_terms.append('indian')
            elif 'asian' in ethnicity.lower():
                query_terms.append('asian')
            elif 'caucasian' in ethnicity.lower():
                query_terms.append('caucasian')
            elif 'african' in ethnicity.lower():
                query_terms.append('african')
            elif 'hispanic' in ethnicity.lower():
                query_terms.append('hispanic')
        
        # Professional context
        if persona_data.get('occupation'):
            query_terms.append(persona_data['occupation'].lower())
        
        if persona_data.get('industry'):
            query_terms.append(persona_data['industry'].lower())
        
        # Location context
        if persona_data.get('location'):
            location = persona_data['location'].lower()
            # Common Indian cities
            indian_cities = [
                'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
                'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
                'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ludhiana'
            ]
            for city in indian_cities:
                if city in location:
                    query_terms.append(city)
                    break
        
        # Lifestyle and personality
        if persona_data.get('lifestyle'):
            query_terms.append(persona_data['lifestyle'].lower())
        
        if persona_data.get('personality_archetype'):
            query_terms.append(persona_data['personality_archetype'].lower())
        
        # Tech context
        tech_savviness = persona_data.get('tech_savviness', '')
        if tech_savviness:
            if 'high' in tech_savviness.lower() or 'expert' in tech_savviness.lower():
                query_terms.append('professional')
            elif 'low' in tech_savviness.lower() or 'beginner' in tech_savviness.lower():
                query_terms.append('casual')
        
        # Communication style
        comm_style = persona_data.get('communication_style', {})
        if isinstance(comm_style, dict):
            if comm_style.get('tone'):
                query_terms.append(comm_style['tone'].lower())
            if comm_style.get('formality'):
                formality = comm_style['formality']
                if isinstance(formality, (int, float)):
                    if formality > 6:
                        query_terms.append('formal')
                    elif formality < 4:
                        query_terms.append('casual')
        
        # Add quality descriptors
        query_terms.extend(['realistic', 'professional', 'portrait'])
        
        # Remove duplicates and empty strings
        unique_terms = list(set([term for term in query_terms if term and len(term) > 0]))
        
        return ' '.join(unique_terms)

    def fetch_persona_image(self, persona_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetch persona image from Pexels API
        
        Args:
            persona_data: Persona data dictionary
            
        Returns:
            Dict with image data or None if failed
        """
        try:
            if not self.pexels_api_key:
                print("⚠️ PEXELS_API_KEY not found, using fallback")
                return self._get_fallback_image(persona_data)
            
            # Build search query
            search_query = self.build_image_search_query(persona_data)
            print(f"🔍 Searching Pexels for: {search_query}")
            
            # Make API request
            headers = {'Authorization': self.pexels_api_key}
            params = {
                'query': search_query,
                'per_page': 1,
                'orientation': 'portrait',
                'size': 'medium'
            }
            
            response = requests.get(
                self.pexels_base_url,
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('photos') and len(data['photos']) > 0:
                    photo = data['photos'][0]
                    
                    return {
                        'url': photo['src']['medium'],
                        'photographer': photo['photographer'],
                        'photographer_url': photo['photographer_url'],
                        'pexels_url': photo['url'],
                        'alt': photo.get('alt', search_query),
                        'width': photo['width'],
                        'height': photo['height'],
                        'attribution': 'Via Pexels',
                        'source': 'pexels',
                        'cached_at': datetime.now().isoformat()
                    }
            
            print("⚠️ No images found in Pexels response")
            return self._get_fallback_image(persona_data)
            
        except Exception as e:
            print(f"❌ Error fetching image from Pexels: {e}")
            return self._get_fallback_image(persona_data)

    def _get_fallback_image(self, persona_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get fallback image when Pexels fails
        
        Args:
            persona_data: Persona data dictionary
            
        Returns:
            Dict with fallback image data
        """
        try:
            # Try Unsplash as fallback
            search_query = self.build_image_search_query(persona_data)
            unsplash_url = f"https://source.unsplash.com/400x400/?{search_query.replace(' ', ',')}"
            
            return {
                'url': unsplash_url,
                'photographer': 'Unsplash',
                'photographer_url': 'https://unsplash.com',
                'pexels_url': None,
                'alt': search_query,
                'width': 400,
                'height': 400,
                'attribution': 'Via Unsplash',
                'source': 'unsplash',
                'cached_at': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Fallback image generation failed: {e}")
            
            # Ultimate fallback - UI Avatars
            name = persona_data.get('name', 'Persona')
            initials = ''.join([n[0] for n in name.split()[:2]]).upper()
            
            return {
                'url': f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff&size=400",
                'photographer': 'UI Avatars',
                'photographer_url': 'https://ui-avatars.com',
                'pexels_url': None,
                'alt': f"{name} avatar",
                'width': 400,
                'height': 400,
                'attribution': 'Generated Avatar',
                'source': 'ui-avatars',
                'cached_at': datetime.now().isoformat()
            }

    def extract_persona_with_image(self, transcript: str, demographics: Dict = None) -> Dict[str, Any]:
        """
        Extract persona data and fetch image
        
        Args:
            transcript: Raw transcript text
            demographics: Optional demographic data
            
        Returns:
            Dict with persona data including image information
        """
        # Extract persona data
        persona_data = self.extract_persona_from_transcript(transcript, demographics)
        
        # Fetch image
        image_data = self.fetch_persona_image(persona_data)
        
        # Add image data to persona
        if image_data:
            persona_data['profile_image_url'] = image_data['url']
            persona_data['image_metadata'] = {
                'photographer': image_data['photographer'],
                'photographer_url': image_data['photographer_url'],
                'attribution': image_data['attribution'],
                'source': image_data['source'],
                'cached_at': image_data['cached_at']
            }
        
        return persona_data

    def batch_extract_with_images(self, transcripts: List[Dict[str, Any]], user_id: str = None) -> List[Dict[str, Any]]:
        """
        Batch extract personas with images from multiple transcripts
        
        Args:
            transcripts: List of transcript data dictionaries
            user_id: Optional user ID for saving
            
        Returns:
            List of results with persona data and images
        """
        results = []
        
        for transcript_data in transcripts:
            try:
                transcript = transcript_data.get('transcript', '')
                demographics = transcript_data.get('demographics', {})
                
                # Extract persona with image
                persona_data = self.extract_persona_with_image(transcript, demographics)
                
                # Save to backend
                saved_persona = self.save_persona_to_backend(persona_data, user_id)
                
                results.append({
                    'transcript_id': transcript_data.get('id'),
                    'persona_data': persona_data,
                    'saved_persona': saved_persona,
                    'success': True
                })
                
            except Exception as e:
                results.append({
                    'transcript_id': transcript_data.get('id'),
                    'error': str(e),
                    'success': False
                })
        
        return results

# Example usage
if __name__ == "__main__":
    extractor = PersonaExtractor()
    
    # Example transcript
    sample_transcript = """
    Hi, I'm Aditya Singh. I'm a 33-year-old Business Analyst working at TechCorp in Delhi. 
    I have a B.Tech in Computer Science and an MBA in Finance. I've been working in the 
    technology industry for about 8 years now. I'm married and have two kids.
    
    My main goals are to advance in my career and build a strong financial foundation for my family. 
    I'm interested in learning new technologies and improving my skills. I use my smartphone 
    and laptop daily for work and personal use. I'm comfortable with technology but prefer 
    simple, user-friendly interfaces.
    
    I'm looking to buy a house in the next few years and want to start investing for my 
    children's education. I'm concerned about the current economic situation and want to 
    make smart financial decisions.
    """
    
    # Extract persona
    persona_data = extractor.extract_persona_from_transcript(sample_transcript)
    print(json.dumps(persona_data, indent=2))

