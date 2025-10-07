/**
 * Mock AI Provider for testing and development
 * Provides realistic mock responses without requiring actual API keys
 */

class MockProvider {
    async chat(messages, params = {}) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        
        // Generate mock analysis based on input
        if (userMessage.includes('TRANSCRIPT:') && userMessage.includes('DEMOGRAPHICS:')) {
            return JSON.stringify({
                speech_patterns: {
                    sentence_length: "medium",
                    formality: 6,
                    filler_words: ["um", "like", "you know"],
                    common_phrases: ["I think", "I mean", "basically"],
                    self_corrections: "occasional",
                    question_style: "direct"
                },
                vocabulary_profile: {
                    complexity: 5,
                    avoided_words: ["technical", "complex", "sophisticated"],
                    common_words: ["simple", "easy", "clear", "help", "understand"]
                },
                emotional_profile: {
                    baseline: "positive",
                    frustration_triggers: ["confusing", "complex", "technical"],
                    excitement_triggers: ["simple", "clear", "helpful"]
                },
                cognitive_profile: {
                    comprehension_speed: "medium",
                    patience: 7
                },
                objectives: ["Learn new features", "Complete tasks efficiently"],
                needs: ["Clear instructions", "Step-by-step guidance", "Help when confused"],
                apprehensions: ["Making mistakes", "Not understanding technical terms"],
                real_quotes: [
                    "I love using mobile apps for banking",
                    "I get confused by all the technical terms",
                    "I prefer simple explanations",
                    "I usually ask my colleagues for help"
                ],
                knowledge_bounds: {
                    confident: ["Mobile apps", "Basic banking"],
                    partial: ["Advanced features", "Security settings"],
                    unknown: ["Technical implementation", "Backend systems"]
                }
            });
        }
        
        // Default response for other queries
        return "I understand. How can I help you with that?";
    }
}

module.exports = MockProvider;
