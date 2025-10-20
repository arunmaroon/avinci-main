/**
 * Enhanced Persona Analysis Engine
 * Extracts detailed behavioral insights from transcripts to create comprehensive personas
 */

const { OpenAI } = require('openai');

class PersonaAnalysisEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze transcript and extract comprehensive persona data
   * @param {string} transcript - Raw transcript text
   * @param {Object} demographics - Basic demographic info
   * @returns {Object} Comprehensive persona data
   */
  async analyzeTranscript(transcript, demographics = {}) {
    try {
      console.log('🔍 Starting comprehensive persona analysis...');
      
      // Extract core behavioral insights
      const behavioralAnalysis = await this.extractBehavioralInsights(transcript);
      
      // Analyze technical proficiency
      const techAnalysis = await this.analyzeTechnicalProficiency(transcript);
      
      // Analyze domain expertise
      const domainAnalysis = await this.analyzeDomainExpertise(transcript);
      
      // Analyze communication patterns
      const communicationAnalysis = await this.analyzeCommunicationPatterns(transcript);
      
      // Analyze decision-making patterns
      const decisionMakingAnalysis = await this.analyzeDecisionMaking(transcript);
      
      // Analyze emotional patterns
      const emotionalAnalysis = await this.analyzeEmotionalPatterns(transcript);
      
      // Generate comprehensive persona
      const persona = {
        // Core demographics
        ...demographics,
        
        // Technical proficiency levels
        tech_savviness: techAnalysis.level,
        tech_confidence: techAnalysis.confidence,
        tech_areas: techAnalysis.areas,
        tech_challenges: techAnalysis.challenges,
        tech_learning_style: techAnalysis.learningStyle,
        
        // Domain expertise
        domain_literacy: domainAnalysis.level,
        domain_confidence: domainAnalysis.confidence,
        domain_areas: domainAnalysis.areas,
        domain_gaps: domainAnalysis.gaps,
        domain_learning_approach: domainAnalysis.learningApproach,
        
        // Communication patterns
        english_proficiency: communicationAnalysis.englishLevel,
        communication_style: communicationAnalysis.style,
        speech_patterns: communicationAnalysis.patterns,
        vocabulary_complexity: communicationAnalysis.vocabularyLevel,
        formality_level: communicationAnalysis.formalityLevel,
        
        // Behavioral insights
        personality_traits: behavioralAnalysis.personality,
        decision_making: decisionMakingAnalysis,
        emotional_patterns: emotionalAnalysis,
        
        // Goals and motivations
        objectives: behavioralAnalysis.objectives,
        fears: behavioralAnalysis.fears,
        motivations: behavioralAnalysis.motivations,
        
        // Interaction preferences
        preferred_communication: communicationAnalysis.preferences,
        learning_preferences: techAnalysis.learningStyle,
        
        // Generated insights
        sample_quote: behavioralAnalysis.sampleQuote,
        background_story: behavioralAnalysis.backgroundStory,
        
        // Metadata
        analysis_confidence: this.calculateOverallConfidence([
          techAnalysis.confidence,
          domainAnalysis.confidence,
          communicationAnalysis.confidence
        ]),
        analysis_timestamp: new Date().toISOString()
      };
      
      console.log('✅ Persona analysis completed successfully');
      return persona;
      
    } catch (error) {
      console.error('❌ Error in persona analysis:', error);
      throw new Error(`Persona analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract behavioral insights from transcript
   */
  async extractBehavioralInsights(transcript) {
    const prompt = `
Analyze this transcript and extract detailed behavioral insights about the person:

Transcript: "${transcript}"

Extract the following information in JSON format:
{
  "personality": {
    "traits": ["trait1", "trait2", "trait3"],
    "primary_characteristics": ["char1", "char2"],
    "communication_style": "formal/casual/mixed",
    "energy_level": "high/medium/low"
  },
  "objectives": ["goal1", "goal2", "goal3"],
  "fears": ["fear1", "fear2"],
  "motivations": ["motivation1", "motivation2"],
  "sample_quote": "Most representative quote from transcript",
  "background_story": "Brief narrative about their background and context"
}

Focus on:
- Personality traits and characteristics
- Goals and aspirations
- Fears and apprehensions
- What motivates them
- Their communication patterns
- Their background and context
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze technical proficiency from transcript
   */
  async analyzeTechnicalProficiency(transcript) {
    const prompt = `
Analyze this transcript to determine the person's technical proficiency level:

Transcript: "${transcript}"

Assess their technical savvy in JSON format:
{
  "level": "beginner/intermediate/advanced/expert",
  "confidence": 0.0-1.0,
  "areas": ["mobile apps", "web browsing", "digital payments", "social media", "online shopping"],
  "challenges": ["specific technical challenges mentioned"],
  "learning_style": "visual/auditory/kinesthetic/reading",
  "tech_comfort": "low/medium/high",
  "adaptability": "low/medium/high"
}

Look for:
- Technical terminology usage
- Problem-solving approaches
- Questions about technology
- Confidence in using tech
- Specific tech areas mentioned
- Learning preferences
- Frustration levels with tech
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze domain expertise from transcript
   */
  async analyzeDomainExpertise(transcript) {
    const prompt = `
Analyze this transcript to determine the person's domain expertise and literacy:

Transcript: "${transcript}"

Assess their domain knowledge in JSON format:
{
  "level": "beginner/intermediate/advanced/expert",
  "confidence": 0.0-1.0,
  "areas": ["banking", "finance", "investments", "insurance", "loans"],
  "gaps": ["knowledge gaps identified"],
  "learning_approach": "self-directed/guided/structured",
  "domain_comfort": "low/medium/high",
  "specialization": "generalist/specialist"
}

Look for:
- Domain-specific terminology
- Understanding of concepts
- Questions about domain topics
- Confidence in domain discussions
- Specific areas of expertise
- Knowledge gaps
- Learning preferences
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze communication patterns and English proficiency
   */
  async analyzeCommunicationPatterns(transcript) {
    const prompt = `
Analyze this transcript to determine communication patterns and English proficiency:

Transcript: "${transcript}"

Assess their communication in JSON format:
{
  "englishLevel": "basic/intermediate/advanced/fluent",
  "style": "formal/casual/mixed",
  "patterns": {
    "sentence_structure": "simple/complex/mixed",
    "vocabulary_usage": "basic/intermediate/advanced",
    "grammar_accuracy": "low/medium/high",
    "fluency": "low/medium/high"
  },
  "vocabularyLevel": "basic/intermediate/advanced",
  "formalityLevel": "low/medium/high",
  "confidence": 0.0-1.0,
  "preferences": {
    "communication_method": "verbal/written/mixed",
    "detail_level": "high/medium/low",
    "explanation_style": "step-by-step/overview/detailed"
  }
}

Look for:
- Grammar and sentence structure
- Vocabulary complexity
- Fluency and confidence
- Communication style
- Formality level
- Clarity of expression
- Use of technical terms
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze decision-making patterns
   */
  async analyzeDecisionMaking(transcript) {
    const prompt = `
Analyze this transcript to understand decision-making patterns:

Transcript: "${transcript}"

Extract decision-making insights in JSON format:
{
  "style": "analytical/intuitive/mixed",
  "risk_tolerance": "low/medium/high",
  "decision_speed": "slow/deliberate/quick",
  "factors": ["factors they consider when making decisions"],
  "process": "step-by-step/instinctive/mixed",
  "confidence": 0.0-1.0
}

Look for:
- How they approach decisions
- Risk assessment patterns
- Decision-making process
- Factors they consider
- Speed of decisions
- Confidence in decisions
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze emotional patterns
   */
  async analyzeEmotionalPatterns(transcript) {
    const prompt = `
Analyze this transcript to understand emotional patterns and responses:

Transcript: "${transcript}"

Extract emotional insights in JSON format:
{
  "emotional_stability": "low/medium/high",
  "stress_responses": ["how they handle stress"],
  "motivation_triggers": ["what motivates them"],
  "frustration_patterns": ["what frustrates them"],
  "emotional_intelligence": "low/medium/high",
  "mood_patterns": ["positive/negative/mixed"]
}

Look for:
- Emotional responses to situations
- Stress handling
- Motivation factors
- Frustration triggers
- Emotional intelligence
- Mood patterns
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(confidenceScores) {
    const validScores = confidenceScores.filter(score => typeof score === 'number' && !isNaN(score));
    if (validScores.length === 0) return 0.5;
    
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Generate persona summary for display
   */
  generatePersonaSummary(persona) {
    return {
      tech_level: persona.tech_savviness,
      domain_level: persona.domain_literacy,
      english_level: persona.english_proficiency,
      confidence: persona.analysis_confidence,
      key_traits: persona.personality_traits?.traits?.slice(0, 3) || [],
      primary_goals: persona.objectives?.slice(0, 2) || [],
      communication_style: persona.communication_style
    };
  }
}

module.exports = PersonaAnalysisEngine;