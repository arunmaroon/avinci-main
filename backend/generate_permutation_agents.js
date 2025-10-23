/**
 * Generate 10 Male AI Agents with Permutations of Tech, English, and Domain Knowledge
 */

const { Pool } = require('pg');
const PromptBuilder = require('./services/promptBuilder');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/avinci'
});

// Define the permutations with proper English levels including Advanced
const permutations = [
    { tech: 'High', english: 'Advanced', domain: 'High' },
    { tech: 'High', english: 'High', domain: 'High' },
    { tech: 'High', english: 'Medium', domain: 'High' },
    { tech: 'High', english: 'Low', domain: 'High' },
    { tech: 'Medium', english: 'Advanced', domain: 'High' },
    { tech: 'Medium', english: 'High', domain: 'High' },
    { tech: 'Medium', english: 'Medium', domain: 'High' },
    { tech: 'Medium', english: 'Low', domain: 'High' },
    { tech: 'Low', english: 'Advanced', domain: 'High' },
    { tech: 'Low', english: 'High', domain: 'High' },
    { tech: 'Low', english: 'Medium', domain: 'High' },
    { tech: 'Low', english: 'Low', domain: 'High' },
    { tech: 'Medium', english: 'Medium', domain: 'Medium' },
];

// Male names and occupations from Indian context (13 profiles for 13 permutations)
const maleProfiles = [
    { name: 'Dr. Arjun Rao', occupation: 'Senior Data Scientist', age: 34, location: 'Bangalore, Karnataka' },
    { name: 'Rajesh Kumar', occupation: 'Senior Software Engineer', age: 32, location: 'Bangalore, Karnataka' },
    { name: 'Amit Sharma', occupation: 'Business Analyst', age: 28, location: 'Pune, Maharashtra' },
    { name: 'Vikram Reddy', occupation: 'Product Manager', age: 35, location: 'Hyderabad, Telangana' },
    { name: 'Dr. Suresh Patel', occupation: 'Financial Consultant', age: 45, location: 'Ahmedabad, Gujarat' },
    { name: 'Karthik Iyer', occupation: 'Financial Advisor', age: 38, location: 'Chennai, Tamil Nadu' },
    { name: 'Manoj Singh', occupation: 'Marketing Manager', age: 30, location: 'Delhi, NCR' },
    { name: 'Prakash Nair', occupation: 'Retail Manager', age: 42, location: 'Kochi, Kerala' },
    { name: 'Dr. Anil Deshmukh', occupation: 'IT Consultant', age: 36, location: 'Mumbai, Maharashtra' },
    { name: 'Ramesh Yadav', occupation: 'Sales Executive', age: 29, location: 'Lucknow, Uttar Pradesh' },
    { name: 'Sanjay Joshi', occupation: 'Data Analyst', age: 31, location: 'Indore, Madhya Pradesh' },
    { name: 'Dr. Venkatesh Iyer', occupation: 'Research Director', age: 40, location: 'Bangalore, Karnataka' },
    { name: 'Ravi Kumar', occupation: 'Operations Manager', age: 33, location: 'Pune, Maharashtra' },
];

function generatePersonaData(profile, permutation, index) {
    const baseData = {
        name: profile.name,
        age: profile.age,
        occupation: profile.occupation,
        location: profile.location,
        role_title: profile.occupation,
        company: getCompanyForOccupation(profile.occupation),
        
        // Demographics
        demographics: {
            age: profile.age,
            gender: 'Male',
            education: permutation.domain === 'High' ? 'Bachelor\'s or Higher' : permutation.domain === 'Medium' ? 'Diploma/Certificate' : '12th Grade',
            income_bracket: permutation.domain === 'High' ? '₹8-15 LPA' : permutation.domain === 'Medium' ? '₹4-8 LPA' : '₹2-4 LPA',
            family_size: Math.floor(Math.random() * 3) + 2,
            marital_status: profile.age > 30 ? 'Married' : 'Single'
        },
        
        // Proficiency levels
        tech_savviness: permutation.tech,
        english_savvy: permutation.english,
        domain_literacy: {
            level: permutation.domain,
            primary_domain: getDomainForOccupation(profile.occupation)
        },
        
        // Cultural background
        cultural_background: {
            primary_language: 'Telugu',
            secondary_languages: ['Hindi', 'English'],
            cultural_values: ['Family-oriented', 'Value for money', 'Trust in recommendations']
        },
        
        // Communication style based on English proficiency
        communication_style: {
            sentence_length: permutation.english === 'High' ? 'medium-long' : permutation.english === 'Medium' ? 'medium' : 'short',
            formality: permutation.domain === 'High' ? 7 : permutation.domain === 'Medium' ? 5 : 3,
            question_style: permutation.english === 'Low' ? 'clarifying' : 'direct',
            english_proficiency: permutation.english
        },
        
        // Goals and objectives based on domain knowledge
        objectives: permutation.domain === 'High' 
            ? ['Career advancement', 'Financial planning', 'Skill development']
            : permutation.domain === 'Medium'
            ? ['Job stability', 'Family welfare', 'Basic savings']
            : ['Daily needs', 'Family support', 'Simple financial security'],
        
        needs: permutation.tech === 'High'
            ? ['Fast digital solutions', 'Advanced features', 'Automation']
            : permutation.tech === 'Medium'
            ? ['Easy-to-use apps', 'Clear instructions', 'Good support']
            : ['Simple interfaces', 'Offline options', 'Personal assistance'],
        
        // Pain points based on tech savviness
        apprehensions: permutation.tech === 'Low'
            ? ['Technology complexity', 'Security concerns', 'Fear of mistakes', 'Need for human help']
            : permutation.tech === 'Medium'
            ? ['Learning new systems', 'Data privacy', 'Hidden charges']
            : ['Time efficiency', 'Feature limitations', 'Integration issues'],
        
        fears: permutation.domain === 'Low'
            ? ['Financial loss', 'Making wrong decisions', 'Being cheated', 'Not understanding terms']
            : ['Missing opportunities', 'Poor ROI', 'Lack of transparency'],
        
        // Speech patterns based on English proficiency
        speech_patterns: {
            filler_words: permutation.english === 'Low' 
                ? ['Ante', 'Ento', 'Uh', 'Hmm', 'Kani']
                : permutation.english === 'Medium'
                ? ['Um', 'Like', 'You know', 'Ante']
                : permutation.english === 'High'
                ? ['Um', 'Like', 'You know']
                : ['Indeed', 'Furthermore', 'Consequently'], // Advanced
            common_phrases: generateCommonPhrases(permutation.english),
            vocabulary_mixing: permutation.english === 'Low' ? 'heavy' : 
                              permutation.english === 'Medium' ? 'moderate' : 
                              permutation.english === 'High' ? 'minimal' : 'none' // Advanced
        },
        
        // Vocabulary profile
        vocabulary_profile: {
            complexity: permutation.english === 'Advanced' ? 10 : 
                       permutation.english === 'High' && permutation.domain === 'High' ? 8 : 
                       permutation.english === 'Medium' || permutation.domain === 'Medium' ? 5 : 2,
            jargon_comfort: permutation.domain === 'High' ? 'high' : permutation.domain === 'Medium' ? 'medium' : 'low',
            avoided_words: permutation.english === 'Low' ? ['subsequently', 'nevertheless', 'comprehensive'] : 
                          permutation.english === 'Advanced' ? [] : ['subsequently', 'nevertheless']
        },
        
        // Emotional profile
        emotional_profile: {
            baseline: 'neutral',
            frustration_triggers: permutation.tech === 'Low' 
                ? ['Complex interfaces', 'Too many steps', 'Technical jargon', 'No human support']
                : ['Slow systems', 'Poor UX', 'Bugs'],
            excitement_triggers: ['Easy solutions', 'Time saving', 'Cost benefits', 'Clear value']
        },
        
        // Cognitive profile
        cognitive_profile: {
            comprehension_speed: permutation.domain === 'High' ? 'fast' : permutation.domain === 'Medium' ? 'medium' : 'slow',
            patience: permutation.tech === 'Low' ? 3 : permutation.tech === 'Medium' ? 5 : 7,
            learning_preference: permutation.tech === 'High' ? 'self-service' : 'guided'
        },
        
        // Knowledge bounds based on domain
        knowledge_bounds: {
            confident: permutation.domain === 'High' 
                ? ['Industry best practices', 'Market trends', 'Product features']
                : ['Basic product usage', 'Common scenarios'],
            partial: permutation.domain === 'Medium'
                ? ['Advanced features', 'Technical specifications']
                : ['Product benefits', 'Comparison shopping'],
            unknown: permutation.domain === 'Low'
                ? ['Technical details', 'Advanced concepts', 'Market dynamics']
                : ['Niche features', 'Advanced integrations']
        },
        
        // Behavioral traits based on tech savviness
        behaviors: {
            digital_comfort: permutation.tech,
            research_depth: permutation.domain === 'High' ? 'thorough' : permutation.domain === 'Medium' ? 'moderate' : 'minimal',
            decision_speed: permutation.tech === 'High' && permutation.domain === 'High' ? 'fast' : 'cautious',
            help_seeking: permutation.tech === 'Low' ? 'frequent' : permutation.tech === 'Medium' ? 'occasional' : 'rare'
        },
        
        // Social context
        social_context: {
            peer_influence: permutation.domain === 'Low' ? 'high' : 'medium',
            community_engagement: 'moderate',
            information_sources: permutation.tech === 'High' 
                ? ['Online reviews', 'Tech blogs', 'YouTube']
                : permutation.tech === 'Medium'
                ? ['Friends', 'Social media', 'Sales staff']
                : ['Family', 'Neighbors', 'Physical stores']
        },
        
        quote: generateQuote(permutation),
        status: 'active',
        native_language: 'Telugu'
    };
    
    return baseData;
}

function getCompanyForOccupation(occupation) {
    const companies = {
        'Senior Software Engineer': 'TCS',
        'Business Analyst': 'Infosys',
        'Product Manager': 'Flipkart',
        'Small Business Owner': 'Self-Employed',
        'Financial Advisor': 'HDFC Bank',
        'Marketing Manager': 'Reliance Industries',
        'Retail Manager': 'Big Bazaar',
        'IT Consultant': 'Wipro',
        'Sales Executive': 'Mahindra & Mahindra',
        'Data Analyst': 'Capgemini'
    };
    return companies[occupation] || 'Private Company';
}

function getDomainForOccupation(occupation) {
    if (occupation.includes('Software') || occupation.includes('IT') || occupation.includes('Data')) return 'Technology';
    if (occupation.includes('Business') || occupation.includes('Manager')) return 'Business';
    if (occupation.includes('Financial')) return 'Finance';
    if (occupation.includes('Marketing') || occupation.includes('Sales')) return 'Sales & Marketing';
    return 'General';
}

function generateCommonPhrases(englishLevel) {
    if (englishLevel === 'Low') {
        return [
            'Naaku artham kaaledu',
            'Idi ela work avtundi?',
            'Koncham slow ga cheppandi',
            'Simple ga chepthe better',
            'Kani naaku doubt undi'
        ];
    } else if (englishLevel === 'Medium') {
        return [
            'Can you explain this?',
            'I\'m not sure about this',
            'Koncham confusing ga undi',
            'Let me check once',
            'Ante, I need more details',
            'This is good, kani I have questions'
        ];
    } else if (englishLevel === 'High') {
        return [
            'I understand the concept',
            'That makes sense',
            'Could you elaborate on this?',
            'I see what you mean',
            'Let me analyze this further'
        ];
    } else { // Advanced
        return [
            'I comprehend the underlying principles',
            'The methodology appears sound',
            'Could you provide additional context?',
            'I perceive the implications',
            'Let me conduct a comprehensive analysis',
            'The framework seems robust'
        ];
    }
}

function generateQuote(permutation) {
    if (permutation.english === 'Advanced') {
        return 'I require sophisticated digital solutions that demonstrate exceptional efficiency and elegant design principles. Time optimization is paramount.';
    } else if (permutation.english === 'High') {
        return 'I prefer digital solutions that are efficient and well-designed. Time is valuable.';
    } else if (permutation.english === 'Low') {
        return 'Naaku simple ga undali, ekkuva complications oddu. Family ki manchidi kavali.';
    } else { // Medium English
        return 'I want something that works well for me and my family, kani without too much hassle.';
    }
}

async function generateAgents() {
    const client = await pool.connect();
    
    try {
        console.log('🤖 Starting generation of 13 male AI agents with permutations...\n');
        
        for (let i = 0; i < 13; i++) {
            const profile = maleProfiles[i];
            const permutation = permutations[i];
            
            console.log(`\n📝 Generating Agent ${i + 1}/13:`);
            console.log(`   Name: ${profile.name}`);
            console.log(`   Tech: ${permutation.tech} | English: ${permutation.english} | Domain: ${permutation.domain}`);
            
            const personaData = generatePersonaData(profile, permutation, i);
            
            // Build master system prompt
            const masterPrompt = PromptBuilder.buildMasterPrompt(personaData);
            
            // Insert into database using the correct ai_agents schema
            const query = `
                INSERT INTO ai_agents (
                    name, occupation, employment_type, location, demographics, traits, behaviors,
                    objectives, needs, fears, apprehensions, motivations, frustrations,
                    domain_literacy, tech_savviness, communication_style, speech_patterns,
                    vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                    quote, master_system_prompt, is_active, source_meta, avatar_url
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
                ) RETURNING id, name
            `;
            
            const values = [
                personaData.name,
                personaData.occupation,
                'Full-time',
                personaData.location,
                JSON.stringify(personaData.demographics),
                JSON.stringify({ personality_archetype: 'Professional', adjectives: ['focused', 'practical'] }),
                JSON.stringify(personaData.behaviors),
                personaData.objectives,
                personaData.needs,
                personaData.fears,
                personaData.apprehensions,
                ['Career growth', 'Family welfare'],
                ['Financial stress', 'Job insecurity'],
                JSON.stringify(personaData.domain_literacy),
                personaData.tech_savviness,
                JSON.stringify(personaData.communication_style),
                JSON.stringify(personaData.speech_patterns),
                JSON.stringify(personaData.vocabulary_profile),
                JSON.stringify(personaData.emotional_profile),
                JSON.stringify(personaData.cognitive_profile),
                JSON.stringify(personaData.knowledge_bounds),
                personaData.quote,
                masterPrompt,
                true,
                JSON.stringify({ source_type: 'generated', created_by: 'permutation_script' }),
                `https://ui-avatars.com/api/?name=${encodeURIComponent(personaData.name)}&background=random&color=fff&size=200`
            ];
            
            const result = await client.query(query, values);
            console.log(`   ✅ Created: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        }
        
        console.log('\n\n🎉 Successfully generated 13 male AI agents with permutations!');
        console.log('\nPermutation Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        permutations.forEach((perm, idx) => {
            console.log(`${idx + 1}. ${maleProfiles[idx].name}: Tech=${perm.tech}, English=${perm.english}, Domain=${perm.domain}`);
        });
        
    } catch (error) {
        console.error('❌ Error generating agents:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the generation
generateAgents()
    .then(() => {
        console.log('\n✨ Generation complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

