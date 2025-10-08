const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'arun.murugesan',
  host: 'localhost',
  database: 'avinci',
  port: 5432,
});

/**
 * Test endpoint to create a persona from mock data
 * POST /api/test-persona
 */
router.post('/', async (req, res) => {
  try {
    // Mock analysis data (simulating what would come from transcript analysis)
    const mockAnalysis = {
      speech_patterns: {
        sentence_length: "short",
        formality: 4,
        filler_words: ["uh", "like", "you know"],
        common_phrases: ["I just want", "you know", "it's so confusing"],
        self_corrections: "occasional",
        question_style: "clarifying"
      },
      vocabulary_profile: {
        complexity: 4,
        avoided_words: ["APR", "amortization", "debt-to-income ratio"],
        common_words: ["convenient", "frustrating", "confusing", "straightforward"]
      },
      emotional_profile: {
        baseline: "neutral",
        frustration_triggers: ["confusing forms", "jargon", "long applications"],
        excitement_triggers: ["convenience", "easy transfers", "quick access"]
      },
      cognitive_profile: {
        comprehension_speed: "medium",
        patience: 6
      },
      objectives: [
        "Easy online banking",
        "Simple loan applications", 
        "Clear explanations"
      ],
      needs: [
        "Plain language explanations",
        "Example calculations",
        "Step-by-step guidance"
      ],
      fears: [
        "Hidden fees",
        "Making mistakes on applications"
      ],
      apprehensions: [
        "Complex financial terms",
        "Long application processes"
      ],
      knowledge_bounds: {
        confident: ["basic banking", "online transfers"],
        partial: ["credit scores", "interest rates"],
        unknown: ["APR calculations", "debt-to-income ratios"]
      },
      real_quotes: [
        "I just want to know if I can get the loan and how much I'll pay each month",
        "I figured if they can't explain it simply, maybe I shouldn't be doing business with them"
      ]
    };

    const demographics = {
      name: 'Sarah Johnson',
      age: 28,
      gender: 'Female',
      education: 'Bachelor\'s',
      income_range: '$40k-$60k',
      family_status: 'Single',
      role_title: 'Marketing Coordinator',
      company: 'Tech Startup',
      location: 'Austin, Texas'
    };

    // Synthesize persona (simplified version)
    const persona = {
      name: demographics.name,
      role_title: demographics.role_title,
      company: demographics.company,
      location: demographics.location,
      demographics: {
        age: demographics.age,
        gender: demographics.gender,
        education: demographics.education,
        income_range: demographics.income_range,
        family_status: demographics.family_status
      },
      traits: {
        personality_archetype: 'Everyperson',
        big5: { openness: 5, conscientiousness: 5, extraversion: 5, agreeableness: 5, neuroticism: 5 },
        adjectives: []
      },
      behaviors: {
        habits: [],
        channels: [],
        tools: [],
        journey_highlights: []
      },
      objectives: mockAnalysis.objectives,
      needs: mockAnalysis.needs,
      fears: mockAnalysis.fears,
      apprehensions: mockAnalysis.apprehensions,
      motivations: [],
      frustrations: [],
      domain_literacy: { dimension: 'finance', level: 'low' },
      tech_savviness: 'medium',
      communication_style: {
        sentence_length: mockAnalysis.speech_patterns.sentence_length,
        formality: mockAnalysis.speech_patterns.formality,
        question_style: mockAnalysis.speech_patterns.question_style
      },
      speech_patterns: mockAnalysis.speech_patterns,
      vocabulary_profile: mockAnalysis.vocabulary_profile,
      emotional_profile: mockAnalysis.emotional_profile,
      cognitive_profile: mockAnalysis.cognitive_profile,
      knowledge_bounds: mockAnalysis.knowledge_bounds,
      quote: mockAnalysis.real_quotes[0]
    };

    // Build master system prompt
    const masterSystemPrompt = `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title} at ${persona.company} in ${persona.location}; Age: ${persona.demographics.age}; Gender: ${persona.demographics.gender}.

OBJECTIVES: ${persona.objectives.join('; ')}.
NEEDS: ${persona.needs.join('; ')}.
FEARS & APPREHENSIONS: ${[...persona.fears, ...persona.apprehensions].join('; ')}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style.sentence_length}; Formality: ${persona.communication_style.formality}/10; Question style: ${persona.communication_style.question_style}.
- Filler words: ${persona.speech_patterns.filler_words.join(', ')}.
- Common phrases: ${persona.speech_patterns.common_phrases.map((p, i) => `${i+1}. "${p}"`).join('\n')}

VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile.complexity}/10.
- Avoid: ${persona.vocabulary_profile.avoided_words.join(', ')}.

EMOTIONAL & COGNITIVE:
- Baseline mood: ${persona.emotional_profile.baseline}; Frustration triggers: ${persona.emotional_profile.frustration_triggers.join(', ')}; Excitement triggers: ${persona.emotional_profile.excitement_triggers.join(', ')}.
- Comprehension: ${persona.cognitive_profile.comprehension_speed}; Patience: ${persona.cognitive_profile.patience}/10.

KNOWLEDGE LIMITS:
- Confident: ${persona.knowledge_bounds.confident.join(', ')}.
- Partial: ${persona.knowledge_bounds.partial.join(', ')}.
- Unknown: ${persona.knowledge_bounds.unknown.join(', ')}.

RULES:
1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.`;

    // Generate avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`;

    // Insert into database
    const insertQuery = `
      INSERT INTO ai_agents (
        name, avatar_url, occupation, employment_type, location, age, gender, education, income_range,
        demographics, traits, behaviors, objectives, needs, fears, apprehensions,
        motivations, frustrations, domain_literacy, tech_savviness,
        communication_style, speech_patterns, vocabulary_profile,
        emotional_profile, cognitive_profile, knowledge_bounds,
        quote, master_system_prompt, is_active, source_meta
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      ) RETURNING id
    `;

    const values = [
      persona.name,                    // 1
      avatarUrl,                      // 2
      persona.role_title,             // 3
      persona.company,                // 4
      persona.location,               // 5
      persona.demographics.age,       // 6
      persona.demographics.gender,    // 7
      persona.demographics.education, // 8
      persona.demographics.income_range, // 9
      JSON.stringify(persona.demographics), // 10
      JSON.stringify(persona.traits), // 11
      JSON.stringify(persona.behaviors), // 12
      persona.objectives,             // 13
      persona.needs,                  // 14
      persona.fears,                  // 15
      persona.apprehensions,          // 16
      persona.motivations,            // 17
      persona.frustrations,           // 18
      JSON.stringify(persona.domain_literacy), // 19
      persona.tech_savviness,         // 20
      JSON.stringify(persona.communication_style), // 21
      JSON.stringify(persona.speech_patterns), // 22
      JSON.stringify(persona.vocabulary_profile), // 23
      JSON.stringify(persona.emotional_profile), // 24
      JSON.stringify(persona.cognitive_profile), // 25
      JSON.stringify(persona.knowledge_bounds), // 26
      persona.quote,                  // 27
      masterSystemPrompt,             // 28
      true,                           // 29
      JSON.stringify({                // 30
        source_type: 'test_transcript',
        created_by: 'system',
        created_at: new Date().toISOString()
      })
    ];

    const result = await pool.query(insertQuery, values);
    const agentId = result.rows[0].id;

    // Return the created agent
    const getAgentQuery = 'SELECT * FROM ai_agents WHERE id = $1';
    const agentResult = await pool.query(getAgentQuery, [agentId]);

    res.status(201).json({
      success: true,
      agent: agentResult.rows[0],
      message: 'Test persona created successfully from mock transcript analysis',
      shortView: {
        id: agentId,
        name: persona.name,
        avatar_url: avatarUrl,
        role_title: persona.role_title,
        company: persona.company,
        location: persona.location,
        quote: persona.quote,
        goals_preview: persona.objectives.slice(0, 3),
        challenges_preview: persona.apprehensions.slice(0, 3),
        gauges: {
          tech: persona.tech_savviness,
          domain: persona.domain_literacy.level,
          comms: persona.communication_style.sentence_length
        },
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error creating test persona:', error);
    res.status(500).json({ 
      error: 'Failed to create test persona', 
      details: error.message 
    });
  }
});

/**
 * GET /api/test-persona
 * Get all test personas
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, name, avatar_url, occupation, employment_type, location, 
             quote, objectives, apprehensions, tech_savviness, 
             domain_literacy, communication_style, is_active, created_at
      FROM ai_agents 
      WHERE source_meta->>'source_type' = 'test_transcript'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    const agents = result.rows.map(agent => ({
      id: agent.id,
      name: agent.name,
      avatar_url: agent.avatar_url,
      role_title: agent.occupation,
      company: agent.employment_type,
      location: agent.location,
      quote: agent.quote,
      goals_preview: (agent.objectives || []).slice(0, 3),
      challenges_preview: (agent.apprehensions || []).slice(0, 3),
      gauges: {
        tech: agent.tech_savviness || 'medium',
        domain: agent.domain_literacy?.level || 'medium',
        comms: agent.communication_style?.sentence_length || 'medium'
      },
      status: agent.is_active ? 'active' : 'inactive',
      created_at: agent.created_at
    }));
    
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching test personas:', error);
    res.status(500).json({ error: 'Failed to fetch test personas', details: error.message });
  }
});

module.exports = router;
