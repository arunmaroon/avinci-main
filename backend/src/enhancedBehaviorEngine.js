/**
 * Enhanced Behavior Engine for Human-like Chat
 * Integrates with the existing chat system to provide realistic AI responses
 */

const providerGateway = require('./providerGateway');

/**
 * Enhanced humanize function with advanced persona-specific behaviors
 */
function humanize(persona, text, context = {}) {
  if (!text || !persona) return text;

  let humanizedText = text;
  const { previousMessage, conversationLength = 0, timeOfDay = 'day' } = context;

  // 0. Remove generic AI language patterns
  const genericPatterns = [
    /How may I assist you today\?/gi,
    /How can I help you\?/gi,
    /What can I do for you\?/gi,
    /Is there anything else I can help with\?/gi,
    /I'm here to help/gi,
    /I'm an AI assistant/gi,
    /As an AI/gi,
    /I'm designed to/gi,
    /My purpose is to/gi
  ];
  
  genericPatterns.forEach(pattern => {
    humanizedText = humanizedText.replace(pattern, '');
  });
  
  // Clean up any double spaces or awkward punctuation
  humanizedText = humanizedText.replace(/\s+/g, ' ').trim();

  // 1. Add filler words based on persona patterns and context
  if (persona.speech_patterns?.filler_words && Math.random() < 0.15) {
    const fillerWords = persona.speech_patterns.filler_words;
    const randomFiller = fillerWords[Math.floor(Math.random() * fillerWords.length)];
    
    // Higher chance of filler words when confused or thinking
    const isConfused = text.includes('?') || text.includes('not sure') || text.includes('confused');
    if (isConfused && Math.random() < 0.3) {
      humanizedText = `${randomFiller} ${humanizedText}`;
    } else if (conversationLength > 3 && Math.random() < 0.1) {
      // Add filler at natural break points
      const sentences = humanizedText.split(/[.!?]+/);
      if (sentences.length > 1) {
        const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
        sentences[randomIndex] = sentences[randomIndex].trim() + ` ${randomFiller}`;
        humanizedText = sentences.join('. ') + '.';
      }
    }
  }

  // 2. Add self-corrections based on persona pattern and complexity
  if (persona.speech_patterns?.self_corrections && Math.random() < 0.2) {
    const correctionStyle = persona.speech_patterns.self_corrections;
    const isComplex = text.length > 100 || text.includes('actually') || text.includes('basically');
    
    if ((correctionStyle === 'occasional' || correctionStyle === 'frequent') && isComplex) {
      const corrections = [
        'I mean,', 'Actually,', 'Wait,', 'Let me think,', 'Hmm,', 'Well,'
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

  // 3. Adjust sentence length based on persona preference and emotional state
  const targetLength = persona.communication_style?.sentence_length;
  const isFrustrated = text.toLowerCase().includes('frustrating') || text.toLowerCase().includes('annoying');
  
  if (targetLength === 'short' || isFrustrated) {
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
  } else if (targetLength === 'long' && !isFrustrated) {
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
      'sophisticated': 'complex',
      'amortization': 'payment schedule',
      'APR': 'interest rate',
      'debt-to-income ratio': 'how much you owe vs earn'
    };

    avoidedWords.forEach(word => {
      const alternative = alternatives[word.toLowerCase()] || 'thing';
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      humanizedText = humanizedText.replace(regex, alternative);
    });
  }

  // 5. Add common phrases naturally based on context
  if (persona.speech_patterns?.common_phrases && Math.random() < 0.25) {
    const commonPhrases = persona.speech_patterns.common_phrases;
    const randomPhrase = commonPhrases[Math.floor(Math.random() * commonPhrases.length)];
    
    // Context-aware phrase insertion
    if (humanizedText.includes('I think') || humanizedText.includes('I feel')) {
      humanizedText = humanizedText.replace(/(I think|I feel)/g, `${randomPhrase}, $1`);
    } else if (humanizedText.includes('I need') || humanizedText.includes('I want')) {
      humanizedText = humanizedText.replace(/(I need|I want)/g, `${randomPhrase}, $1`);
    }
  }

  // 6. Add emotional context based on persona's emotional profile
  if (persona.emotional_profile?.baseline) {
    const baseline = persona.emotional_profile.baseline;
    const frustrationTriggers = persona.emotional_profile.frustration_triggers || [];
    const excitementTriggers = persona.emotional_profile.excitement_triggers || [];
    
    // Check if any triggers are present in the conversation
    const hasFrustrationTrigger = frustrationTriggers.some(trigger => 
      text.toLowerCase().includes(trigger.toLowerCase())
    );
    const hasExcitementTrigger = excitementTriggers.some(trigger => 
      text.toLowerCase().includes(trigger.toLowerCase())
    );
    
    if (hasFrustrationTrigger && baseline !== 'positive') {
      // Add subtle frustration indicators
      if (Math.random() < 0.3) {
        humanizedText = humanizedText.replace(/\./g, '...');
      }
    } else if (hasExcitementTrigger && baseline === 'positive') {
      // Add excitement indicators
      if (Math.random() < 0.2) {
        humanizedText = humanizedText.replace(/!/g, '!!');
      }
    }
  }

  // 7. Add time-of-day and context awareness
  if (timeOfDay === 'night' && persona.behaviors?.habits?.includes('late-night work')) {
    // Add tiredness indicators
    if (Math.random() < 0.1) {
      humanizedText = humanizedText.replace(/\./g, '...');
    }
  }

  return humanizedText;
}

/**
 * Enhanced delay calculation with persona-specific factors
 */
function computeDelay(persona, userMessage, reply, context = {}) {
  if (!persona || !userMessage || !reply) return 1000;

  // Base delay factors
  let baseDelay = 800; // 0.8 seconds base

  // 1. Comprehension speed factor
  const comprehensionSpeed = persona.cognitive_profile?.comprehension_speed || 'medium';
  const speedMultiplier = {
    'slow': 1.8,
    'medium': 1.0,
    'fast': 0.6
  }[comprehensionSpeed] || 1.0;

  // 2. Patience factor (affects how quickly they respond)
  const patience = persona.cognitive_profile?.patience || 5;
  const patienceMultiplier = Math.max(0.3, patience / 10);

  // 3. Message complexity factor
  const userComplexity = userMessage.split(' ').length;
  const replyComplexity = reply.split(' ').length;
  const complexityFactor = Math.min(2.5, (userComplexity + replyComplexity) / 40);

  // 4. Emotional state factor
  const baseline = persona.emotional_profile?.baseline || 'neutral';
  const emotionalMultiplier = {
    'positive': 0.7,
    'neutral': 1.0,
    'negative': 1.4,
    'anxious': 1.6,
    'enthusiastic': 0.5
  }[baseline] || 1.0;

  // 5. Context factors
  const { conversationLength = 0, timeOfDay = 'day', isConfused = false } = context;
  
  // Longer delays for longer conversations (tiredness)
  const conversationFactor = Math.min(1.5, 1 + (conversationLength * 0.1));
  
  // Night time delays for night workers
  const timeFactor = (timeOfDay === 'night' && persona.behaviors?.habits?.includes('late-night work')) ? 1.2 : 1.0;
  
  // Confusion delays
  const confusionFactor = isConfused ? 1.5 : 1.0;

  // 6. Random variation (±25%)
  const randomVariation = 0.75 + (Math.random() * 0.5);

  // Calculate final delay
  const finalDelay = Math.round(
    baseDelay * 
    speedMultiplier * 
    patienceMultiplier * 
    complexityFactor * 
    emotionalMultiplier * 
    conversationFactor *
    timeFactor *
    confusionFactor *
    randomVariation
  );

  // Clamp between 0.5s and 12s
  return Math.max(500, Math.min(12000, finalDelay));
}

/**
 * Enhanced emotion detection with context awareness
 */
function detectEmotion(message, persona = null) {
  const emotions = {
    'frustrated': ['frustrated', 'annoying', 'hate', 'terrible', 'awful', 'stupid', 'confusing', 'complicated'],
    'excited': ['excited', 'amazing', 'love', 'great', 'awesome', 'fantastic', 'perfect', 'wonderful'],
    'confused': ['confused', 'don\'t understand', 'unclear', 'lost', 'help', 'explain', 'what does'],
    'worried': ['worried', 'concerned', 'scared', 'nervous', 'anxious', 'afraid', 'scary'],
    'happy': ['happy', 'good', 'nice', 'pleased', 'satisfied', 'glad', 'delighted'],
    'angry': ['angry', 'mad', 'furious', 'rage', 'pissed', 'annoyed', 'irritated']
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return emotion;
    }
  }

  // Check against persona's emotional triggers
  if (persona?.emotional_profile?.frustration_triggers) {
    const hasFrustrationTrigger = persona.emotional_profile.frustration_triggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
    if (hasFrustrationTrigger) return 'frustrated';
  }

  if (persona?.emotional_profile?.excitement_triggers) {
    const hasExcitementTrigger = persona.emotional_profile.excitement_triggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
    if (hasExcitementTrigger) return 'excited';
  }

  return 'neutral';
}

/**
 * Generate typing progress events for enhanced SSE
 */
function generateTypingProgress(totalDelay, persona) {
  const events = [];
  const progressPoints = [0.15, 0.35, 0.55, 0.75, 0.9]; // More granular progress
  
  // Adjust based on persona's typing speed
  const typingSpeed = persona.cognitive_profile?.comprehension_speed || 'medium';
  const speedMultiplier = {
    'slow': 1.2,
    'medium': 1.0,
    'fast': 0.8
  }[typingSpeed] || 1.0;
  
  progressPoints.forEach(progress => {
    events.push({
      delay: Math.round(totalDelay * progress * speedMultiplier),
      event: 'typing_progress',
      data: { 
        progress: Math.round(progress * 100),
        persona: persona.name
      }
    });
  });

  return events;
}

/**
 * Enhanced response generation with persona context
 */
async function generatePersonaResponse(persona, userMessage, chatHistory = [], context = {}) {
  try {
    // Build context-aware messages
    const messages = [
      { role: 'system', content: persona.master_system_prompt || 'You are a helpful assistant.' },
      ...chatHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    // Adjust AI parameters based on persona
    const aiParams = {
      temperature: persona.cognitive_profile?.comprehension_speed === 'fast' ? 0.9 : 0.8,
      max_tokens: persona.communication_style?.sentence_length === 'long' ? 400 : 280,
      top_p: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    };

    let rawResponse;
    
    // Try to get AI response, fallback to persona-based response if API fails
    try {
      rawResponse = await providerGateway.chat(messages, aiParams);
      console.log('✅ AI response received successfully');
    } catch (apiError) {
      console.warn('⚠️  AI API unavailable, using persona-based fallback');
      rawResponse = generatePersonaBasedFallback(persona, userMessage, chatHistory, context);
      console.log('✅ Persona-based fallback response generated');
    }
    
    // Humanize the response
    const humanizedResponse = humanize(persona, rawResponse, context);
    console.log('✅ Response humanized');
    
    // Compute realistic delay
    const delay = computeDelay(persona, userMessage, humanizedResponse, context);
    
    return {
      content: humanizedResponse,
      delay: delay,
      emotion: detectEmotion(userMessage, persona),
      typingEvents: generateTypingProgress(delay, persona)
    };
    
  } catch (error) {
    console.error('Error generating persona response:', error);
    // Final fallback - generate basic response
    const fallbackResponse = generatePersonaBasedFallback(persona, userMessage, chatHistory, context);
    return {
      content: fallbackResponse,
      delay: computeDelay(persona, userMessage, fallbackResponse, context),
      emotion: detectEmotion(userMessage, persona),
      typingEvents: []
    };
  }
}

/**
 * Generate persona-based response using agent's rich data (fallback when API unavailable)
 */
function generatePersonaBasedFallback(persona, userMessage, chatHistory = [], context = {}) {
  const { 
    name,
    occupation,
    personality,
    goals,
    pain_points,
    motivations,
    fears,
    apprehensions,
    speech_patterns,
    communication_style
  } = persona;
  
  const agentName = name || 'Agent';
  const occupation_text = occupation || 'professional';
  const personality_traits = personality?.traits || [];
  const agent_tone = communication_style?.formality || 5;
  const agent_goals = goals || [];
  const agent_pains = pain_points || [];
  const agent_apprehensions = apprehensions || [];
  const common_phrases = speech_patterns?.common_phrases || [];
  const filler_words = speech_patterns?.filler_words || [];
  
  let response = '';
  
  // Add filler word sometimes for authenticity
  if (filler_words.length > 0 && Math.random() > 0.7) {
    response += filler_words[Math.floor(Math.random() * filler_words.length)] + ' ';
  }
  
  // Add personality-driven opening based on formality
  const openings = agent_tone > 6
    ? [
        `From my experience as a ${occupation_text}, `,
        `In my professional opinion, `,
        `Based on my background, `,
        `Allow me to share my perspective. `
      ]
    : [
        `You know, as a ${occupation_text}, `,
        `From my experience, `,
        `Let me share my thoughts on this. `,
        `Honestly, `,
        `So basically, `,
        `I think `
      ];
  
  response += openings[Math.floor(Math.random() * openings.length)];
  
  // Add query-specific context
  const queryLower = userMessage.toLowerCase();
  
  if (queryLower.includes('problem') || queryLower.includes('issue') || queryLower.includes('challenge') || queryLower.includes('difficult')) {
    // Relate to pain points
    if (agent_pains.length > 0 && Math.random() > 0.5) {
      const pain = agent_pains[Math.floor(Math.random() * agent_pains.length)];
      response += `this reminds me of challenges I've faced with ${pain}. `;
    }
    response += `I think the key is to break it down and tackle it step by step. `;
  } else if (queryLower.includes('goal') || queryLower.includes('want') || queryLower.includes('need')) {
    // Relate to goals
    if (agent_goals.length > 0 && Math.random() > 0.5) {
      const goal = agent_goals[Math.floor(Math.random() * agent_goals.length)];
      response += `this aligns with my goal around ${goal}. `;
    }
    response += `What I really need is a solution that actually works for my situation. `;
  } else if (queryLower.includes('fintech') || queryLower.includes('app') || queryLower.includes('digital')) {
    if (agent_apprehensions.length > 0 && Math.random() > 0.6) {
      const concern = agent_apprehensions[Math.floor(Math.random() * agent_apprehensions.length)];
      response += `I'm always concerned about ${concern}. `;
    }
    response += `I think fintech can be really useful, but it has to be trustworthy and easy to use. `;
  } else if (queryLower.includes('how') || queryLower.includes('what') || queryLower.includes('why')) {
    response += `let me explain how I see this. `;
  } else if (queryLower.includes('hi') || queryLower.includes('hello') || queryLower.includes('hey')) {
    response = `Hi there! `;
    if (common_phrases.length > 0 && Math.random() > 0.5) {
      response += common_phrases[Math.floor(Math.random() * common_phrases.length)] + '. ';
    }
    response += `How can I help you today?`;
    return response;
  } else {
    response += `I have some thoughts on this. `;
  }
  
  // Add personality-specific insights
  if (personality_traits.includes('cautious') || personality_traits.includes('risk-averse')) {
    response += `I'd want to make sure we're considering all the risks here. `;
  } else if (personality_traits.includes('innovative') || personality_traits.includes('tech-savvy')) {
    response += `I'm thinking we could try a more innovative approach. `;
  } else if (personality_traits.includes('practical') || personality_traits.includes('pragmatic')) {
    response += `Let's focus on what actually works in practice. `;
  }
  
  // Add motivations
  if (motivations && motivations.length > 0 && Math.random() > 0.6) {
    const motivation = motivations[Math.floor(Math.random() * motivations.length)];
    response += `What drives me is ${motivation}. `;
  }
  
  // Add closing based on formality
  if (agent_tone > 6) {
    const formals = [
      "I hope this perspective is helpful.",
      "Please let me know if you'd like to discuss this further.",
      "I'm happy to elaborate on any point.",
      "Feel free to ask if you have more questions."
    ];
    response += formals[Math.floor(Math.random() * formals.length)];
  } else {
    const casuals = [
      "Hope that helps!",
      "Let me know what you think.",
      "Does that make sense?",
      "What do you reckon?",
      "That's my take anyway."
    ];
    response += casuals[Math.floor(Math.random() * casuals.length)];
  }
  
  return response;
}

module.exports = {
  humanize,
  computeDelay,
  detectEmotion,
  generateTypingProgress,
  generatePersonaResponse
};





