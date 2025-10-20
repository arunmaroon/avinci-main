/**
 * Agent Generation - AI-powered persona creation from transcripts
 * Handles transcript analysis and persona synthesis using OpenAI
 */

const { OpenAI } = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');

class AgentGeneration {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze transcript to extract behavioral signals
   */
  async analyzeTranscript(transcript, demographics = {}) {
    const prompt = `
    Analyze the following transcript and extract behavioral signals for persona creation.
    
    Transcript: ${transcript}
    Demographics: ${JSON.stringify(demographics)}
    
    Extract the following information:
    1. Personality traits and archetype
    2. Communication style and patterns
    3. Goals, motivations, and aspirations
    4. Pain points, fears, and concerns
    5. Technology usage and comfort level
    6. Financial behavior and preferences
    7. Daily habits and routines
    8. Social context and relationships
    9. Cultural background and values
    10. Decision-making patterns
    
    Return as structured JSON with all 51 UXPressia fields.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert persona analyst. Extract detailed behavioral signals from transcripts and return structured JSON data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      throw new Error('Failed to analyze transcript');
    }
  }

  /**
   * Synthesize persona from analysis
   */
  async synthesizePersona(analysis, demographics) {
    const prompt = `
    Create a comprehensive persona from the following analysis and demographics.
    
    Analysis: ${JSON.stringify(analysis)}
    Demographics: ${JSON.stringify(demographics)}
    
    Generate a complete persona with all 51 UXPressia fields:
    
    Basic Information (5):
    - name, title, company, location, avatar_url
    
    Demographics (8):
    - age, gender, education, income_range, family_status, occupation, industry, experience_years
    
    Personality & Traits (6):
    - personality_archetype, big_five_traits, personality_adjectives, values, beliefs, attitudes
    
    Goals & Motivations (8):
    - primary_goals, secondary_goals, motivations, aspirations, fears, concerns, pain_points, frustrations
    
    Behavior & Habits (6):
    - daily_routine, habits, preferences, behaviors, lifestyle, hobbies
    
    Technology & Tools (5):
    - tech_savviness, preferred_devices, apps_used, tech_comfort_level, digital_behavior
    
    Communication (4):
    - communication_style, language_preferences, vocabulary_level, speech_patterns
    
    Emotional & Cognitive (4):
    - emotional_profile, cognitive_style, learning_style, attention_span
    
    Social & Cultural (5):
    - social_context, cultural_background, social_media_usage, network_size, influence_level
    
    Life Events & Context (4):
    - life_events, current_situation, future_plans, life_stage
    
    Fintech-Specific (6):
    - financial_goals, financial_concerns, banking_preferences, investment_style, risk_tolerance, financial_literacy
    
    Return as valid JSON with all fields populated.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert persona creator. Generate comprehensive personas with all 51 UXPressia fields from behavioral analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 6000
      });

      const persona = JSON.parse(response.choices[0].message.content);
      return persona;
    } catch (error) {
      console.error('Error synthesizing persona:', error);
      throw new Error('Failed to synthesize persona');
    }
  }

  /**
   * Generate master system prompt for persona
   */
  async generateMasterPrompt(persona) {
    const prompt = `
    Create a comprehensive master system prompt for this persona:
    
    ${JSON.stringify(persona, null, 2)}
    
    The prompt should:
    1. Establish the persona's identity and background
    2. Define their communication style and tone
    3. Include their goals, motivations, and pain points
    4. Specify their technology comfort level
    5. Include their financial behavior and preferences
    6. Set expectations for their responses
    7. Be 2-3K characters long
    8. Be suitable for fintech UI testing scenarios
    
    Return only the system prompt text.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer. Create detailed system prompts for AI personas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating master prompt:', error);
      throw new Error('Failed to generate master prompt');
    }
  }

  /**
   * Generate avatar URL based on persona
   */
  generateAvatarUrl(persona) {
    const { name, gender, age } = persona;
    
    // Use Unsplash for real Indian faces
    const genderParam = gender?.toLowerCase().includes('female') ? 'woman' : 'man';
    const ageParam = age > 50 ? 'senior' : age < 25 ? 'young' : '';
    
    const searchTerms = `indian ${genderParam} ${ageParam} professional portrait`.trim();
    
    // Use a consistent seed based on name for reproducible results
    const seed = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const imageId = Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 1000;
    
    return `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
  }

  /**
   * Batch process multiple transcripts
   */
  async batchProcessTranscripts(transcripts, demographics = {}) {
    const results = [];
    
    for (const transcript of transcripts) {
      try {
        const analysis = await this.analyzeTranscript(transcript, demographics);
        const persona = await this.synthesizePersona(analysis, demographics);
        const masterPrompt = await this.generateMasterPrompt(persona);
        const avatarUrl = this.generateAvatarUrl(persona);
        
        results.push({
          transcript,
          analysis,
          persona: {
            ...persona,
            master_system_prompt: masterPrompt,
            avatar_url: avatarUrl
          }
        });
      } catch (error) {
        console.error(`Error processing transcript:`, error);
        results.push({
          transcript,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Cluster personas by similarity
   */
  async clusterPersonas(personas, numClusters = 3) {
    // This would implement clustering logic
    // For now, return simple grouping by tech_savviness
    const clusters = {
      'tech_experts': personas.filter(p => p.tech_savviness === 'expert'),
      'tech_intermediate': personas.filter(p => p.tech_savviness === 'intermediate'),
      'tech_beginners': personas.filter(p => p.tech_savviness === 'beginner')
    };
    
    return clusters;
  }

  /**
   * Generate persona insights and analytics
   */
  async generatePersonaInsights(personas) {
    const insights = {
      total_personas: personas.length,
      age_distribution: this.calculateAgeDistribution(personas),
      gender_distribution: this.calculateGenderDistribution(personas),
      tech_savviness_distribution: this.calculateTechDistribution(personas),
      common_goals: this.findCommonGoals(personas),
      common_pain_points: this.findCommonPainPoints(personas),
      financial_literacy_distribution: this.calculateFinancialLiteracyDistribution(personas)
    };
    
    return insights;
  }

  calculateAgeDistribution(personas) {
    const distribution = {};
    personas.forEach(persona => {
      const ageGroup = Math.floor(persona.age / 10) * 10;
      distribution[ageGroup] = (distribution[ageGroup] || 0) + 1;
    });
    return distribution;
  }

  calculateGenderDistribution(personas) {
    const distribution = {};
    personas.forEach(persona => {
      const gender = persona.gender || 'unknown';
      distribution[gender] = (distribution[gender] || 0) + 1;
    });
    return distribution;
  }

  calculateTechDistribution(personas) {
    const distribution = {};
    personas.forEach(persona => {
      const tech = persona.tech_savviness || 'unknown';
      distribution[tech] = (distribution[tech] || 0) + 1;
    });
    return distribution;
  }

  findCommonGoals(personas) {
    const goalCounts = {};
    personas.forEach(persona => {
      (persona.primary_goals || []).forEach(goal => {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });
    });
    
    return Object.entries(goalCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([goal, count]) => ({ goal, count }));
  }

  findCommonPainPoints(personas) {
    const painPointCounts = {};
    personas.forEach(persona => {
      (persona.pain_points || []).forEach(pain => {
        painPointCounts[pain] = (painPointCounts[pain] || 0) + 1;
      });
    });
    
    return Object.entries(painPointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pain, count]) => ({ pain, count }));
  }

  calculateFinancialLiteracyDistribution(personas) {
    const distribution = {};
    personas.forEach(persona => {
      const literacy = persona.financial_literacy || 'unknown';
      distribution[literacy] = (distribution[literacy] || 0) + 1;
    });
    return distribution;
  }
}

module.exports = AgentGeneration;

