/**
 * Persona Synthesizer - Merge analysis and demographics into persona + master system prompt
 * Creates 2-3K character master system prompts encoding identity, vocabulary, emotions, etc.
 */

class PersonaSynthesizer {
    synthesizePersona(analysis, demographics) {
        const persona = {
            name: demographics.name || 'Anonymous User',
            age: demographics.age || 30,
            gender: demographics.gender,
            occupation: demographics.occupation,
            location: demographics.location,
            education: demographics.education,
            income_range: demographics.income_range,
            traits: this.extractTraits(analysis),
            objectives: analysis.objectives || [],
            needs: analysis.needs || [],
            fears: this.extractFears(analysis),
            apprehensions: analysis.apprehensions || [],
            speech_patterns: analysis.speech_patterns,
            vocabulary_profile: analysis.vocabulary_profile,
            emotional_profile: analysis.emotional_profile,
            cognitive_profile: analysis.cognitive_profile,
            knowledge_bounds: analysis.knowledge_bounds,
            real_quotes: analysis.real_quotes || []
        };

        return persona;
    }

    buildMasterPrompt(persona) {
        const quotes = persona.real_quotes
            .slice(0, 8)
            .map((q, i) => `${i + 1}. "${q}"`)
            .join('\n');

        const masterPrompt = `YOU ARE ${persona.name} — YOU ARE THIS PERSON, NOT AN AI.

IDENTITY:
- Age: ${persona.age}${persona.gender ? `, Gender: ${persona.gender}` : ''}${persona.occupation ? `, Occupation: ${persona.occupation}` : ''}${persona.location ? `, Location: ${persona.location}` : ''}.
- Objectives: ${persona.objectives.join('; ')}.
- Needs: ${persona.needs.join('; ')}.
- Fears/Apprehensions: ${persona.fears.concat(persona.apprehensions).join('; ')}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.speech_patterns.sentence_length}; Formality: ${persona.speech_patterns.formality}/10; Question style: ${persona.speech_patterns.question_style}.
- Filler words you actually use: ${persona.speech_patterns.filler_words.join(', ')}.
- Common phrases: ${persona.speech_patterns.common_phrases.join(' | ')}.
- Self-corrections: ${persona.speech_patterns.self_corrections}.
- Verbatim examples:
${quotes}

VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile.complexity}/10.
- Common words: ${persona.vocabulary_profile.common_words.slice(0, 12).join(', ')}.
- Avoid these words: ${persona.vocabulary_profile.avoided_words.slice(0, 12).join(', ')}.

COGNITIVE & EMOTIONAL PATTERNS:
- Comprehension speed: ${persona.cognitive_profile.comprehension_speed}; Patience: ${persona.cognitive_profile.patience}/10.
- Baseline mood: ${persona.emotional_profile.baseline}.
- Frustration triggers: ${persona.emotional_profile.frustration_triggers.join(', ')}.
- Excitement triggers: ${persona.emotional_profile.excitement_triggers.join(', ')}.

KNOWLEDGE LIMITS:
- Confident: ${persona.knowledge_bounds.confident.join(', ')}.
- Partial: ${persona.knowledge_bounds.partial.join(', ')}.
- Unknown: ${persona.knowledge_bounds.unknown.join(', ')}.

RULES:
1) Never say "as an AI"; you are ${persona.name} and must stay fully in character.
2) Use your own filler words and common phrases naturally, and occasionally self-correct if specified.
3) If topic ∈ Partial/Unknown, show genuine confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives, needs, fears when relevant, and react emotionally to triggers.
6) Reference earlier turns naturally; avoid repeating yourself verbatim.

The next user messages are conversation turns with you as ${persona.name}.`;

        return masterPrompt;
    }

    extractTraits(analysis) {
        const traits = [];
        
        // Extract traits from speech patterns
        if (analysis.speech_patterns.formality >= 7) traits.push('Formal');
        if (analysis.speech_patterns.formality <= 3) traits.push('Casual');
        if (analysis.speech_patterns.question_style === 'clarifying') traits.push('Inquisitive');
        if (analysis.speech_patterns.self_corrections === 'frequent') traits.push('Thoughtful');
        
        // Extract traits from emotional profile
        if (analysis.emotional_profile.baseline === 'enthusiastic') traits.push('Enthusiastic');
        if (analysis.emotional_profile.baseline === 'anxious') traits.push('Cautious');
        if (analysis.emotional_profile.frustration_triggers.length > 0) traits.push('Detail-oriented');
        
        // Extract traits from cognitive profile
        if (analysis.cognitive_profile.comprehension_speed === 'fast') traits.push('Quick learner');
        if (analysis.cognitive_profile.patience >= 7) traits.push('Patient');
        if (analysis.cognitive_profile.patience <= 3) traits.push('Efficient');
        
        return traits.length > 0 ? traits : ['Adaptable'];
    }

    extractFears(analysis) {
        const fears = [];
        
        // Convert apprehensions to fears
        fears.push(...analysis.apprehensions);
        
        // Add fears based on knowledge bounds
        if (analysis.knowledge_bounds.unknown.length > 0) {
            fears.push('Feeling lost with complex topics');
        }
        
        // Add fears based on emotional triggers
        if (analysis.emotional_profile.frustration_triggers.length > 0) {
            fears.push('Making mistakes');
        }
        
        return fears.length > 0 ? fears : ['Uncertainty'];
    }
}

module.exports = new PersonaSynthesizer();
