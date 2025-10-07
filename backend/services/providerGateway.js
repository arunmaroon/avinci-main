/**
 * Provider Gateway - Model-agnostic AI provider interface
 * Supports OpenAI and Anthropic with unified API
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class ProviderGateway {
    constructor() {
        this.openaiClient = null;
        this.anthropicClient = null;
        this.initializeClients();
    }

    initializeClients() {
        // Initialize OpenAI client if API key is provided
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            this.openaiClient = new OpenAI({ 
                apiKey: process.env.OPENAI_API_KEY 
            });
            console.log('OpenAI client initialized');
        }

        // Initialize Anthropic client if API key is provided
        if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
            this.anthropicClient = new Anthropic({ 
                apiKey: process.env.ANTHROPIC_API_KEY 
            });
            console.log('Anthropic client initialized');
        }

        console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
        console.log('OpenAI available:', !!this.openaiClient);
        console.log('Anthropic available:', !!this.anthropicClient);
    }

    async chat(messages, params = {}) {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error('No AI provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY');
        }

        return await provider.chat(messages, params);
    }

    async analyzeTranscript(transcript, demographics = {}) {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error('No AI provider configured for transcript analysis');
        }

        return await provider.analyzeTranscript(transcript, demographics);
    }

    async synthesizePersona(analysis, demographics) {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error('No AI provider configured for persona synthesis');
        }

        return await provider.synthesizePersona(analysis, demographics);
    }

    getProvider() {
        const providerName = process.env.AI_PROVIDER || 'openai';
        
        if (providerName === 'openai' && this.openaiClient) {
            return new OpenAIProvider(this.openaiClient);
        } else if (providerName === 'anthropic' && this.anthropicClient) {
            return new AnthropicProvider(this.anthropicClient);
        } else if (this.openaiClient) {
            return new OpenAIProvider(this.openaiClient);
        } else if (this.anthropicClient) {
            return new AnthropicProvider(this.anthropicClient);
        }
        
        // Fallback to mock provider for development/testing
        console.log('No real AI provider available, using mock provider');
        return new MockProvider();
    }
}

class OpenAIProvider {
    constructor(client) {
        this.client = client;
    }

    async chat(messages, params = {}) {
        const response = await this.client.chat.completions.create({
            model: params.model || 'gpt-4o',
            messages: messages,
            temperature: params.temperature || 0.8,
            max_tokens: params.max_tokens || 300,
            top_p: params.top_p || 0.9,
            presence_penalty: params.presence_penalty || 0.6,
            frequency_penalty: params.frequency_penalty || 0.5,
        });

        return response.choices[0]?.message?.content || '';
    }

    async analyzeTranscript(transcript, demographics = {}) {
        const systemPrompt = `You are a behavioral analysis expert. Extract behavioral signals from the transcript as JSON only. Return a structured JSON object with these exact fields:

{
  "speech_patterns": {
    "sentence_length": "short|medium|long",
    "formality": 1-10,
    "filler_words": ["um", "uh", "like", "you know"],
    "common_phrases": ["I think", "you know", "basically"],
    "self_corrections": "never|rare|occasional|frequent",
    "question_style": "direct|indirect|clarifying"
  },
  "vocabulary_profile": {
    "complexity": 1-10,
    "avoided_words": ["technical", "jargon", "complex terms"],
    "common_words": ["really", "actually", "basically"]
  },
  "emotional_profile": {
    "baseline": "positive|neutral|negative|anxious|enthusiastic",
    "frustration_triggers": ["confusing", "difficult", "hard to find"],
    "excitement_triggers": ["love", "great", "awesome", "amazing"]
  },
  "cognitive_profile": {
    "comprehension_speed": "slow|medium|fast",
    "patience": 1-10
  },
  "objectives": ["goal1", "goal2", "goal3"],
  "needs": ["need1", "need2", "need3"],
  "fears": ["fear1", "fear2", "fear3"],
  "apprehensions": ["concern1", "concern2", "concern3"],
  "knowledge_bounds": {
    "confident": ["topic1", "topic2"],
    "partial": ["topic3", "topic4"],
    "unknown": ["topic5", "topic6"]
  },
  "real_quotes": ["exact quote 1", "exact quote 2", "exact quote 3", "exact quote 4", "exact quote 5"]
}

Be precise and extract only what you can clearly observe from the transcript.`;

        const userPrompt = `TRANSCRIPT:
${transcript.raw_text || transcript}

DEMOGRAPHICS:
${JSON.stringify(demographics)}

Return JSON only with no extra text.`;

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    }

    async synthesizePersona(analysis, demographics) {
        const systemPrompt = `You are a persona synthesis expert. Create a detailed persona and master system prompt based on the behavioral analysis. Return JSON with persona details and a comprehensive master system prompt.`;

        const userPrompt = `ANALYSIS:
${JSON.stringify(analysis, null, 2)}

DEMOGRAPHICS:
${JSON.stringify(demographics, null, 2)}

Create a persona object and a master system prompt (2-3K characters) that captures this person's exact speaking style, vocabulary constraints, emotional patterns, and behavioral traits.`;

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
            max_tokens: 3000
        });

        return response.choices[0].message.content;
    }
}

class AnthropicProvider {
    constructor(client) {
        this.client = client;
    }

    async chat(messages, params = {}) {
        // Separate system message from conversation turns
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const conversationTurns = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            }));

        const response = await this.client.messages.create({
            model: params.model || 'claude-3-5-sonnet-20241022',
            max_tokens: params.max_tokens || 300,
            system: systemMessage,
            messages: conversationTurns,
            temperature: params.temperature || 0.8,
        });

        const firstTextContent = response.content.find(p => p.type === 'text');
        return firstTextContent?.text || '';
    }

    async analyzeTranscript(transcript, demographics = {}) {
        const systemPrompt = `You are a behavioral analysis expert. Extract behavioral signals from the transcript as JSON only. Return a structured JSON object with these exact fields:

{
  "speech_patterns": {
    "sentence_length": "short|medium|long",
    "formality": 1-10,
    "filler_words": ["um", "uh", "like", "you know"],
    "common_phrases": ["I think", "you know", "basically"],
    "self_corrections": "never|rare|occasional|frequent",
    "question_style": "direct|indirect|clarifying"
  },
  "vocabulary_profile": {
    "complexity": 1-10,
    "avoided_words": ["technical", "jargon", "complex terms"],
    "common_words": ["really", "actually", "basically"]
  },
  "emotional_profile": {
    "baseline": "positive|neutral|negative|anxious|enthusiastic",
    "frustration_triggers": ["confusing", "difficult", "hard to find"],
    "excitement_triggers": ["love", "great", "awesome", "amazing"]
  },
  "cognitive_profile": {
    "comprehension_speed": "slow|medium|fast",
    "patience": 1-10
  },
  "objectives": ["goal1", "goal2", "goal3"],
  "needs": ["need1", "need2", "need3"],
  "fears": ["fear1", "fear2", "fear3"],
  "apprehensions": ["concern1", "concern2", "concern3"],
  "knowledge_bounds": {
    "confident": ["topic1", "topic2"],
    "partial": ["topic3", "topic4"],
    "unknown": ["topic5", "topic6"]
  },
  "real_quotes": ["exact quote 1", "exact quote 2", "exact quote 3", "exact quote 4", "exact quote 5"]
}

Be precise and extract only what you can clearly observe from the transcript.`;

        const userPrompt = `TRANSCRIPT:
${transcript.raw_text || transcript}

DEMOGRAPHICS:
${JSON.stringify(demographics)}

Return JSON only with no extra text.`;

        const response = await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            temperature: 0.2,
        });

        const firstTextContent = response.content.find(p => p.type === 'text');
        return JSON.parse(firstTextContent?.text || '{}');
    }

    async synthesizePersona(analysis, demographics) {
        const systemPrompt = `You are a persona synthesis expert. Create a detailed persona and master system prompt based on the behavioral analysis. Return JSON with persona details and a comprehensive master system prompt.`;

        const userPrompt = `ANALYSIS:
${JSON.stringify(analysis, null, 2)}

DEMOGRAPHICS:
${JSON.stringify(demographics, null, 2)}

Create a persona object and a master system prompt (2-3K characters) that captures this person's exact speaking style, vocabulary constraints, emotional patterns, and behavioral traits.`;

        const response = await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            temperature: 0.5,
        });

        const firstTextContent = response.content.find(p => p.type === 'text');
        return firstTextContent?.text || '';
    }
}

class MockProvider {
    async chat(messages, params = {}) {
        // Mock response for development
        return "This is a mock response for development purposes.";
    }

    async analyzeTranscript(transcript, demographics = {}) {
        // Mock analysis for development
        return {
            speech_patterns: {
                sentence_length: 'medium',
                formality: 6,
                filler_words: ['um', 'like', 'you know'],
                common_phrases: ['I think', 'I mean', 'basically'],
                self_corrections: 'occasional',
                question_style: 'direct'
            },
            vocabulary_profile: {
                complexity: 5,
                avoided_words: ['technical', 'complex', 'sophisticated'],
                common_words: ['simple', 'easy', 'clear', 'help', 'understand']
            },
            emotional_profile: {
                baseline: 'positive',
                frustration_triggers: ['confusing', 'complex', 'technical'],
                excitement_triggers: ['simple', 'clear', 'helpful']
            },
            cognitive_profile: {
                comprehension_speed: 'medium',
                patience: 7
            },
            objectives: ['Learn new features', 'Complete tasks efficiently'],
            needs: ['Clear instructions', 'Step-by-step guidance', 'Help when confused'],
            fears: [],
            apprehensions: ['Making mistakes', 'Not understanding technical terms'],
            knowledge_bounds: {
                confident: ['Mobile apps', 'Basic banking'],
                partial: ['Advanced features', 'Security settings'],
                unknown: ['Technical implementation', 'Backend systems']
            },
            real_quotes: ['I love using mobile apps for banking', 'This is really helpful', 'I just want it to work', 'Can you explain that again?', 'That makes sense']
        };
    }

    async synthesizePersona(analysis, demographics) {
        // Mock synthesis for development
        return JSON.stringify({
            persona: {
                name: demographics.name || 'Test Person',
                role_title: demographics.role_title || 'Professional',
                company: demographics.company || 'Unknown',
                location: demographics.location || 'Unknown',
                demographics: demographics,
                traits: { personality_archetype: 'Everyperson', big5: {}, adjectives: [] },
                behaviors: { habits: [], channels: [], tools: [], journey_highlights: [] },
                objectives: analysis.objectives || [],
                needs: analysis.needs || [],
                fears: analysis.fears || [],
                apprehensions: analysis.apprehensions || [],
                motivations: [],
                frustrations: [],
                domain_literacy: { dimension: 'finance', level: 'medium' },
                tech_savviness: 'medium',
                communication_style: analysis.speech_patterns || {},
                speech_patterns: analysis.speech_patterns || {},
                vocabulary_profile: analysis.vocabulary_profile || {},
                emotional_profile: analysis.emotional_profile || {},
                cognitive_profile: analysis.cognitive_profile || {},
                knowledge_bounds: analysis.knowledge_bounds || {},
                quote: analysis.real_quotes?.[0] || 'I just want it to work'
            },
            master_system_prompt: `YOU ARE ${demographics.name || 'Test Person'} — a real human persona, not an AI, and you must never break character.`
        });
    }
}

module.exports = new ProviderGateway();