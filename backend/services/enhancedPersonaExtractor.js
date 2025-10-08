const { OpenAI } = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

class EnhancedPersonaExtractor {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.chatModel = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-4o",
            temperature: 0.3,
            maxTokens: 2000
        });
    }

    async extractPersonaFromTranscript(transcriptText, demographics = {}) {
        try {
            console.log('Starting enhanced persona extraction...');
            
            const prompt = this.buildExtractionPrompt(transcriptText, demographics);
            
            const messages = [
                new SystemMessage("You are an expert persona analyst specializing in fintech user research. Extract detailed persona information from transcript text, focusing on R: (Respondent) responses. Return valid JSON only."),
                new HumanMessage(prompt)
            ];

            const response = await this.chatModel.call(messages);
            let content = response.content;
            
            // Remove markdown code blocks if present
            if (content.includes('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (content.includes('```')) {
                content = content.replace(/```\n?/g, '');
            }
            
            const extractedData = JSON.parse(content);
            
            // Enhance with fintech-specific analysis
            const enhancedData = await this.enhanceFintechPersona(extractedData, transcriptText);
            
            console.log('Enhanced persona extraction completed');
            return enhancedData;
            
        } catch (error) {
            console.error('Enhanced persona extraction failed:', error);
            throw new Error(`Enhanced persona extraction failed: ${error.message}`);
        }
    }

    buildExtractionPrompt(transcriptText, demographics) {
        return `
Extract a detailed persona from this user research transcript. Focus on R: (Respondent) responses to understand the user's characteristics, behaviors, and pain points.

Transcript:
${transcriptText}

Demographics (if available):
${JSON.stringify(demographics, null, 2)}

Extract the following information and return as JSON:

{
  "name": "Full name from transcript or generate appropriate name",
  "age": "Age mentioned or estimated",
  "occupation": "Job title or profession",
  "background": "Brief background story (2-3 sentences)",
  "personality": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "fintech_preferences": {
    "banking_style": "traditional/digital/mixed",
    "payment_preferences": ["cash", "upi", "cards", "netbanking"],
    "investment_approach": "conservative/moderate/aggressive",
    "tech_comfort": "low/medium/high"
  },
  "pain_points": [
    "General pain point 1",
    "General pain point 2",
    "General pain point 3"
  ],
  "ui_pain_points": [
    "UI/UX specific pain point 1",
    "UI/UX specific pain point 2",
    "UI/UX specific pain point 3"
  ],
  "key_quotes": [
    "Exact quote from transcript 1",
    "Exact quote from transcript 2",
    "Exact quote from transcript 3"
  ],
  "communication_style": "casual/formal/mixed",
  "decision_making": "quick/analytical/collaborative",
  "tech_savviness": "low/medium/high",
  "financial_goals": ["goal1", "goal2", "goal3"],
  "frustrations": ["frustration1", "frustration2", "frustration3"],
  "motivations": ["motivation1", "motivation2", "motivation3"]
}

Focus on:
1. R: responses for authentic personality traits
2. Financial behaviors and preferences
3. Technology usage patterns
4. Specific UI/UX pain points mentioned
5. Communication style and tone
6. Real quotes that capture their voice

Return valid JSON only.`;
    }

    async enhanceFintechPersona(personaData, transcriptText) {
        try {
            // Analyze fintech-specific patterns
            const fintechAnalysis = await this.analyzeFintechPatterns(transcriptText);
            
            // Enhance persona with fintech insights
            const enhanced = {
                ...personaData,
                fintech_analysis: fintechAnalysis,
                risk_profile: this.assessRiskProfile(personaData),
                ui_preferences: this.extractUIPreferences(personaData, transcriptText),
                task_completion_style: this.assessTaskCompletionStyle(personaData),
                error_handling_approach: this.assessErrorHandling(personaData)
            };

            return enhanced;
        } catch (error) {
            console.warn('Fintech enhancement failed, using base persona:', error.message);
            return personaData;
        }
    }

    async analyzeFintechPatterns(transcriptText) {
        const patterns = {
            payment_mentions: [],
            banking_mentions: [],
            investment_mentions: [],
            loan_mentions: [],
            insurance_mentions: [],
            digital_adoption: 'unknown',
            security_concerns: [],
            convenience_factors: []
        };

        const text = transcriptText.toLowerCase();
        
        // Payment patterns
        if (text.includes('upi') || text.includes('phonepe') || text.includes('gpay')) {
            patterns.payment_mentions.push('UPI');
        }
        if (text.includes('card') || text.includes('credit') || text.includes('debit')) {
            patterns.payment_mentions.push('Cards');
        }
        if (text.includes('cash')) {
            patterns.payment_mentions.push('Cash');
        }

        // Banking patterns
        if (text.includes('branch') || text.includes('atm')) {
            patterns.banking_mentions.push('Physical');
        }
        if (text.includes('app') || text.includes('online') || text.includes('mobile')) {
            patterns.banking_mentions.push('Digital');
        }

        // Digital adoption assessment
        if (patterns.banking_mentions.includes('Digital') && patterns.payment_mentions.includes('UPI')) {
            patterns.digital_adoption = 'high';
        } else if (patterns.banking_mentions.includes('Digital') || patterns.payment_mentions.includes('UPI')) {
            patterns.digital_adoption = 'medium';
        } else {
            patterns.digital_adoption = 'low';
        }

        return patterns;
    }

    assessRiskProfile(personaData) {
        const riskFactors = [];
        
        if (personaData.fintech_preferences?.investment_approach === 'aggressive') {
            riskFactors.push('high_risk_tolerance');
        }
        if (personaData.tech_savviness === 'high') {
            riskFactors.push('tech_comfortable');
        }
        if (personaData.personality?.some(trait => ['cautious', 'conservative', 'careful'].includes(trait.toLowerCase()))) {
            riskFactors.push('risk_averse');
        }

        if (riskFactors.includes('high_risk_tolerance') && riskFactors.includes('tech_comfortable')) {
            return 'high';
        } else if (riskFactors.includes('risk_averse')) {
            return 'low';
        } else {
            return 'medium';
        }
    }

    extractUIPreferences(personaData, transcriptText) {
        const preferences = {
            layout_preference: 'unknown',
            color_preference: 'unknown',
            interaction_style: 'unknown',
            information_density: 'unknown'
        };

        const text = transcriptText.toLowerCase();
        
        // Layout preferences
        if (text.includes('simple') || text.includes('clean')) {
            preferences.layout_preference = 'minimal';
        } else if (text.includes('detailed') || text.includes('comprehensive')) {
            preferences.layout_preference = 'detailed';
        }

        // Interaction style
        if (text.includes('quick') || text.includes('fast')) {
            preferences.interaction_style = 'efficient';
        } else if (text.includes('step') || text.includes('guide')) {
            preferences.interaction_style = 'guided';
        }

        return preferences;
    }

    assessTaskCompletionStyle(personaData) {
        if (personaData.personality?.some(trait => ['analytical', 'methodical', 'careful'].includes(trait.toLowerCase()))) {
            return 'systematic';
        } else if (personaData.personality?.some(trait => ['quick', 'efficient', 'direct'].includes(trait.toLowerCase()))) {
            return 'efficient';
        } else {
            return 'balanced';
        }
    }

    assessErrorHandling(personaData) {
        if (personaData.personality?.some(trait => ['patient', 'persistent', 'problem-solver'].includes(trait.toLowerCase()))) {
            return 'persistent';
        } else if (personaData.personality?.some(trait => ['frustrated', 'impatient', 'quick-tempered'].includes(trait.toLowerCase()))) {
            return 'frustrated';
        } else {
            return 'neutral';
        }
    }

    generateConversationStarters(personaData) {
        const starters = [
            `Hi ${personaData.name}, tell me about your experience with financial apps`,
            `What's your biggest challenge when using banking services?`,
            `How do you typically handle loan applications?`,
            `What frustrates you most about current financial tools?`
        ];

        // Customize based on persona
        if (personaData.fintech_preferences?.banking_style === 'digital') {
            starters.push("I see you prefer digital banking - what features do you find most useful?");
        }

        if (personaData.ui_pain_points?.length > 0) {
            starters.push(`I noticed you mentioned issues with ${personaData.ui_pain_points[0]} - can you tell me more?`);
        }

        return starters;
    }

    generateUsabilityTestScenarios(personaData) {
        const scenarios = [
            {
                task: "Apply for a personal loan",
                description: "Complete a loan application form",
                focus_areas: ["form_usability", "information_clarity", "process_flow"]
            },
            {
                task: "Check account balance and recent transactions",
                description: "Navigate to account details",
                focus_areas: ["navigation", "information_display", "user_feedback"]
            },
            {
                task: "Set up UPI payment",
                description: "Configure UPI for payments",
                focus_areas: ["setup_process", "security_perception", "ease_of_use"]
            }
        ];

        // Customize based on persona's pain points
        if (personaData.ui_pain_points?.some(point => point.toLowerCase().includes('form'))) {
            scenarios[0].priority = 'high';
        }

        return scenarios;
    }
}

module.exports = EnhancedPersonaExtractor;
