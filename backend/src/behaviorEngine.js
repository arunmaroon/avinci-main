/**
 * Behavior Engine for Human-like Chat
 * Post-processes AI responses to add persona-specific human behaviors
 */

/**
 * Humanize AI response with persona-specific behaviors
 */
function humanize(persona, text) {
  if (!text || !persona) return text;

  let humanizedText = text;

  // 1. Add filler words occasionally (10% chance)
  if (persona.speech_patterns?.filler_words && Math.random() < 0.1) {
    const fillerWords = persona.speech_patterns.filler_words;
    const randomFiller = fillerWords[Math.floor(Math.random() * fillerWords.length)];
    
    // Insert filler at natural break points
    const sentences = humanizedText.split(/[.!?]+/);
    if (sentences.length > 1) {
      const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
      sentences[randomIndex] = sentences[randomIndex].trim() + ` ${randomFiller}`;
      humanizedText = sentences.join('. ') + '.';
    }
  }

  // 2. Add self-corrections based on persona pattern
  if (persona.speech_patterns?.self_corrections && Math.random() < 0.15) {
    const correctionStyle = persona.speech_patterns.self_corrections;
    
    if (correctionStyle === 'occasional' || correctionStyle === 'frequent') {
      // Add a simple self-correction
      const corrections = [
        'I mean,', 'Actually,', 'Wait,', 'Let me think,', 'Hmm,'
      ];
      const randomCorrection = corrections[Math.floor(Math.random() * corrections.length)];
      
      // Insert at beginning of a sentence
      const sentences = humanizedText.split(/[.!?]+/);
      if (sentences.length > 0) {
        sentences[0] = `${randomCorrection} ${sentences[0].trim()}`;
        humanizedText = sentences.join('. ') + '.';
      }
    }
  }

  // 3. Adjust sentence length based on persona preference
  const targetLength = persona.communication_style?.sentence_length;
  if (targetLength === 'short') {
    // Break long sentences into shorter ones
    humanizedText = humanizedText.replace(/([.!?])\s+([A-Z])/g, '$1 $2');
    const sentences = humanizedText.split(/[.!?]+/);
    const shortSentences = sentences.map(sentence => {
      if (sentence.length > 80) {
        // Split very long sentences
        const parts = sentence.split(/,/);
        return parts.map(part => part.trim()).join(', ');
      }
      return sentence.trim();
    });
    humanizedText = shortSentences.filter(s => s.length > 0).join('. ') + '.';
  } else if (targetLength === 'long') {
    // Combine short sentences where appropriate
    humanizedText = humanizedText.replace(/([.!?])\s+([a-z])/g, ', $2');
  }

  // 4. Replace avoided words with simpler alternatives
  if (persona.vocabulary_profile?.avoided_words) {
    const avoidedWords = persona.vocabulary_profile.avoided_words;
    const alternatives = {
      'utilize': 'use',
      'facilitate': 'help',
      'implement': 'do',
      'leverage': 'use',
      'optimize': 'improve',
      'synthesize': 'combine',
      'paradigm': 'way',
      'methodology': 'method',
      'comprehensive': 'complete',
      'sophisticated': 'complex'
    };

    avoidedWords.forEach(word => {
      const alternative = alternatives[word.toLowerCase()] || 'thing';
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      humanizedText = humanizedText.replace(regex, alternative);
    });
  }

  // 5. Add common phrases naturally
  if (persona.speech_patterns?.common_phrases && Math.random() < 0.2) {
    const commonPhrases = persona.speech_patterns.common_phrases;
    const randomPhrase = commonPhrases[Math.floor(Math.random() * commonPhrases.length)];
    
    // Insert at natural points
    if (humanizedText.includes('I think') || humanizedText.includes('I feel')) {
      humanizedText = humanizedText.replace(/(I think|I feel)/g, `${randomPhrase}, $1`);
    }
  }

  return humanizedText;
}

/**
 * Compute realistic response delay based on persona and message content
 */
function computeDelay(persona, userMessage, reply) {
  if (!persona || !userMessage || !reply) return 1000;

  // Base delay factors
  let baseDelay = 800; // 0.8 seconds base

  // 1. Comprehension speed factor
  const comprehensionSpeed = persona.cognitive_profile?.comprehension_speed || 'medium';
  const speedMultiplier = {
    'slow': 1.5,
    'medium': 1.0,
    'fast': 0.7
  }[comprehensionSpeed] || 1.0;

  // 2. Patience factor (affects how quickly they respond)
  const patience = persona.cognitive_profile?.patience || 5;
  const patienceMultiplier = Math.max(0.5, patience / 10);

  // 3. Message complexity factor
  const userComplexity = userMessage.split(' ').length;
  const replyComplexity = reply.split(' ').length;
  const complexityFactor = Math.min(2.0, (userComplexity + replyComplexity) / 50);

  // 4. Emotional state factor
  const baseline = persona.emotional_profile?.baseline || 'neutral';
  const emotionalMultiplier = {
    'positive': 0.8,
    'neutral': 1.0,
    'negative': 1.2,
    'anxious': 1.3,
    'enthusiastic': 0.7
  }[baseline] || 1.0;

  // 5. Random variation (±20%)
  const randomVariation = 0.8 + (Math.random() * 0.4);

  // Calculate final delay
  const finalDelay = Math.round(
    baseDelay * 
    speedMultiplier * 
    patienceMultiplier * 
    complexityFactor * 
    emotionalMultiplier * 
    randomVariation
  );

  // Clamp between 0.5s and 8s
  return Math.max(500, Math.min(8000, finalDelay));
}

/**
 * Detect emotion in user message (simple keyword-based)
 */
function detectEmotion(message) {
  const emotions = {
    'frustrated': ['frustrated', 'annoying', 'hate', 'terrible', 'awful', 'stupid'],
    'excited': ['excited', 'amazing', 'love', 'great', 'awesome', 'fantastic'],
    'confused': ['confused', 'don\'t understand', 'unclear', 'lost', 'help'],
    'worried': ['worried', 'concerned', 'scared', 'nervous', 'anxious'],
    'happy': ['happy', 'good', 'nice', 'pleased', 'satisfied']
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return emotion;
    }
  }

  return 'neutral';
}

/**
 * Generate typing progress events for SSE
 */
function generateTypingProgress(totalDelay) {
  const events = [];
  const progressPoints = [0.2, 0.4, 0.6, 0.8]; // 20%, 40%, 60%, 80%
  
  progressPoints.forEach(progress => {
    events.push({
      delay: Math.round(totalDelay * progress),
      event: 'typing_progress',
      data: { progress: Math.round(progress * 100) }
    });
  });

  return events;
}

module.exports = {
  humanize,
  computeDelay,
  detectEmotion,
  generateTypingProgress
};

