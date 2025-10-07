/**
 * Behavior Engine - Human-like response generation and timing
 * Post-processes AI responses to add persona-specific human elements
 */

class BehaviorEngine {
    /**
     * Humanize AI response based on persona characteristics
     */
    static humanize(persona, text) {
        let humanizedText = text;

        // Add filler words occasionally
        if (persona.speech_patterns?.filler_words?.length > 0) {
            humanizedText = this.addFillerWords(humanizedText, persona.speech_patterns.filler_words);
        }

        // Add self-corrections based on persona pattern
        if (persona.speech_patterns?.self_corrections === 'frequent' || 
            persona.speech_patterns?.self_corrections === 'occasional') {
            humanizedText = this.addSelfCorrections(humanizedText, persona.speech_patterns.self_corrections);
        }

        // Adjust sentence length to match persona
        humanizedText = this.adjustSentenceLength(humanizedText, persona.communication_style?.sentence_length);

        // Simplify vocabulary if needed
        humanizedText = this.simplifyVocabulary(humanizedText, persona.vocabulary_profile);

        return humanizedText;
    }

    /**
     * Compute realistic response delay based on persona and content
     */
    static computeDelay(persona, userMessage, reply) {
        const baseDelay = 800; // 0.8 seconds base
        const readingTime = userMessage.length * 50; // 50ms per character
        const thinkingTime = this.getThinkingTime(persona);
        const typingTime = reply.length * 30; // 30ms per character
        
        // Add randomness (±20%)
        const randomFactor = 0.8 + (Math.random() * 0.4);
        
        const totalDelay = Math.min(
            (baseDelay + readingTime + thinkingTime + typingTime) * randomFactor,
            8000 // Cap at 8 seconds
        );

        return Math.max(totalDelay, 500); // Minimum 0.5 seconds
    }

    /**
     * Add filler words to text
     */
    static addFillerWords(text, fillerWords) {
        const sentences = text.split(/[.!?]+/);
        const result = [];

        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i].trim();
            if (sentence) {
                // 15% chance to add filler word at start
                if (Math.random() < 0.15) {
                    const filler = fillerWords[Math.floor(Math.random() * fillerWords.length)];
                    sentence = `${filler}, ${sentence}`;
                }
                result.push(sentence);
            }
        }

        return result.join('. ') + (text.endsWith('.') ? '.' : '');
    }

    /**
     * Add self-corrections to text
     */
    static addSelfCorrections(text, frequency) {
        if (frequency === 'never' || Math.random() > 0.1) return text;

        const corrections = [
            'actually,', 'I mean,', 'or rather,', 'wait,', 'let me think,'
        ];

        const sentences = text.split(/[.!?]+/);
        if (sentences.length > 1) {
            const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
            const correction = corrections[Math.floor(Math.random() * corrections.length)];
            sentences[randomIndex] = sentences[randomIndex].trim() + ` ${correction}`;
        }

        return sentences.join('. ') + (text.endsWith('.') ? '.' : '');
    }

    /**
     * Adjust sentence length to match persona
     */
    static adjustSentenceLength(text, sentenceLength) {
        if (!sentenceLength || sentenceLength === 'medium') return text;

        const sentences = text.split(/[.!?]+/);
        const result = [];

        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (trimmed) {
                if (sentenceLength === 'short') {
                    // Split long sentences
                    const words = trimmed.split(' ');
                    if (words.length > 15) {
                        const midPoint = Math.floor(words.length / 2);
                        result.push(words.slice(0, midPoint).join(' '));
                        result.push(words.slice(midPoint).join(' '));
                    } else {
                        result.push(trimmed);
                    }
                } else if (sentenceLength === 'long') {
                    // Combine short sentences
                    result.push(trimmed);
                } else {
                    result.push(trimmed);
                }
            }
        }

        return result.join('. ') + (text.endsWith('.') ? '.' : '');
    }

    /**
     * Simplify vocabulary based on persona constraints
     */
    static simplifyVocabulary(text, vocabularyProfile) {
        if (!vocabularyProfile?.avoided_words?.length) return text;

        let simplifiedText = text;
        const avoidedWords = vocabularyProfile.avoided_words;
        
        // Simple word replacement (in a real implementation, you'd use a thesaurus)
        const replacements = {
            'sophisticated': 'advanced',
            'complex': 'complicated',
            'technical': 'detailed',
            'comprehensive': 'complete',
            'utilize': 'use',
            'facilitate': 'help',
            'implement': 'do',
            'optimize': 'improve'
        };

        for (const [complex, simple] of Object.entries(replacements)) {
            if (avoidedWords.includes(complex)) {
                const regex = new RegExp(`\\b${complex}\\b`, 'gi');
                simplifiedText = simplifiedText.replace(regex, simple);
            }
        }

        return simplifiedText;
    }

    /**
     * Get thinking time based on persona cognitive profile
     */
    static getThinkingTime(persona) {
        const baseThinking = 1000; // 1 second base
        
        if (persona.cognitive_profile?.comprehension_speed === 'slow') {
            return baseThinking * 1.5;
        } else if (persona.cognitive_profile?.comprehension_speed === 'fast') {
            return baseThinking * 0.5;
        }
        
        return baseThinking;
    }

    /**
     * Generate emotion based on content and persona
     */
    static generateEmotion(persona, userMessage, reply) {
        const emotionalProfile = persona.emotional_profile;
        if (!emotionalProfile) return 'neutral';

        // Check for frustration triggers
        const frustrationTriggers = emotionalProfile.frustration_triggers || [];
        const hasFrustrationTrigger = frustrationTriggers.some(trigger => 
            userMessage.toLowerCase().includes(trigger.toLowerCase())
        );

        if (hasFrustrationTrigger) {
            return 'frustrated';
        }

        // Check for excitement triggers
        const excitementTriggers = emotionalProfile.excitement_triggers || [];
        const hasExcitementTrigger = excitementTriggers.some(trigger => 
            userMessage.toLowerCase().includes(trigger.toLowerCase())
        );

        if (hasExcitementTrigger) {
            return 'excited';
        }

        return emotionalProfile.baseline || 'neutral';
    }

    /**
     * Build system instruction with persona context
     */
    static buildSystemInstruction(persona) {
        const currentMood = persona.emotional_profile?.baseline || 'neutral';
        const recentInteractionState = 'normal';

        const contextualAppendix = `
Current Mood: ${currentMood}
Recent Interaction State: ${recentInteractionState}
Persona Status: ${persona.status || 'active'}`;

        return `${persona.master_system_prompt}\n\n${contextualAppendix}`;
    }

    /**
     * Prepare messages for AI provider
     */
    static prepareMessages(systemInstruction, conversationHistory, userMessage) {
        let messages = [{ role: 'system', content: systemInstruction }];

        // Add conversation history (rolling context window)
        const recentHistory = conversationHistory.slice(-10); // Last 10 messages
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        messages.push({ role: 'user', content: userMessage });
        return messages;
    }

    /**
     * Tune temperature based on persona emotional state
     */
    static tuneTemperature(persona) {
        const baseline = persona.emotional_profile?.baseline || 'neutral';
        let temperature = 0.7; // Default

        if (baseline === 'enthusiastic') temperature = 0.8;
        if (baseline === 'anxious') temperature = 0.6;
        if (baseline === 'positive') temperature = 0.75;
        if (baseline === 'negative') temperature = 0.65;

        return temperature;
    }
}

module.exports = BehaviorEngine;