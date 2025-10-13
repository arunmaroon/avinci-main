const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Rich demographic data for different agent types
const agentProfiles = {
    'Operations Manager': {
        age: 35,
        gender: 'M',
        education: 'MBA',
        income: '₹8-12 LPA',
        family: 'Married with 2 children',
        personality: 'Analytical, detail-oriented, process-driven, collaborative',
        background_story: 'Started as a junior executive in a manufacturing company, worked his way up through various operational roles. Has 12 years of experience in streamlining processes and managing teams. Lives in a middle-class neighborhood with his family.',
        goals: 'Optimize operational efficiency, implement digital transformation, mentor junior staff',
        pain_points: 'Legacy systems, resistance to change, budget constraints, staff turnover',
        motivations: 'Process improvement, team success, cost reduction, innovation',
        hobbies: 'Cricket, reading business books, gardening, family time',
        daily_routine: 'Early riser, gym at 6 AM, office by 8:30 AM, family dinner at 8 PM',
        decision_style: 'Data-driven, consultative, risk-averse',
        communication_style: 'Direct, professional, process-focused',
        key_phrases: ['Let me check the data', 'We need to optimize this', 'What\'s the ROI?', 'Let\'s streamline this process'],
        fintech_usage: 'Uses UPI, online banking, digital wallets, investment apps',
        triggers: 'Inefficiency, waste, missed deadlines, poor communication',
        community_values: 'Hard work, integrity, family first, community service'
    },
    'Research Director': {
        age: 42,
        gender: 'M',
        education: 'PhD',
        income: '₹15-20 LPA',
        family: 'Married, no children',
        personality: 'Intellectual, curious, methodical, innovative',
        background_story: 'Academic background with 15 years in market research. Started as a research analyst, moved to senior positions in consulting firms. Now leads research teams and advises on strategic decisions.',
        goals: 'Publish research papers, mentor researchers, drive innovation in research methods',
        pain_points: 'Limited budgets, tight deadlines, data quality issues, stakeholder expectations',
        motivations: 'Knowledge creation, impact on business decisions, team development',
        hobbies: 'Reading research papers, chess, classical music, photography',
        daily_routine: 'Starts work at 9 AM, research meetings, data analysis, evening reading',
        decision_style: 'Evidence-based, analytical, collaborative',
        communication_style: 'Academic, detailed, evidence-supported',
        key_phrases: ['Based on our research', 'The data suggests', 'We need more evidence', 'Let\'s analyze this'],
        fintech_usage: 'Uses research tools, data analytics platforms, academic databases',
        triggers: 'Poor data quality, rushed research, lack of methodology',
        community_values: 'Knowledge sharing, academic integrity, research ethics'
    },
    'Data Analyst': {
        age: 28,
        gender: 'M',
        education: 'B.Tech',
        income: '₹6-8 LPA',
        family: 'Single, lives with parents',
        personality: 'Logical, detail-oriented, introverted, tech-savvy',
        background_story: 'Fresh graduate with 3 years of experience in data analysis. Passionate about numbers and patterns. Works in a tech company analyzing user behavior and business metrics.',
        goals: 'Learn advanced analytics, get promoted to senior analyst, work on AI/ML projects',
        pain_points: 'Data quality issues, unclear requirements, repetitive tasks, limited growth',
        motivations: 'Learning new technologies, solving complex problems, career growth',
        hobbies: 'Coding, online courses, gaming, watching tech videos',
        daily_routine: 'Starts at 10 AM, data analysis, meetings, coding practice in evening',
        decision_style: 'Data-driven, logical, systematic',
        communication_style: 'Technical, precise, data-focused',
        key_phrases: ['The numbers show', 'Let me run the analysis', 'Based on the data', 'We need to clean this data'],
        fintech_usage: 'Uses UPI, online banking, investment apps, crypto trading',
        triggers: 'Messy data, unclear requirements, poor documentation',
        community_values: 'Continuous learning, technical excellence, innovation'
    },
    'Sales Executive': {
        age: 32,
        gender: 'M',
        education: 'BBA',
        income: '₹5-7 LPA + commissions',
        family: 'Married, 1 child',
        personality: 'Extroverted, persuasive, ambitious, relationship-focused',
        background_story: 'Started in retail sales, moved to B2B sales. Has 8 years of experience in building client relationships and closing deals. Lives in a rented apartment with his family.',
        goals: 'Increase sales targets, get promoted to sales manager, buy a house',
        pain_points: 'Rejection, difficult clients, unrealistic targets, competition',
        motivations: 'Financial success, recognition, client satisfaction, career growth',
        hobbies: 'Networking events, watching sales videos, family outings, cricket',
        daily_routine: 'Starts at 9 AM, client calls, meetings, follow-ups, ends at 7 PM',
        decision_style: 'Intuitive, relationship-based, quick decisions',
        communication_style: 'Persuasive, friendly, solution-oriented',
        key_phrases: ['How can I help you?', 'Let me show you the benefits', 'What\'s your budget?', 'I\'ll get you the best deal'],
        fintech_usage: 'Uses UPI, online banking, expense tracking apps',
        triggers: 'Rejection, difficult clients, missed targets',
        community_values: 'Hard work, persistence, customer service, family support'
    },
    'IT Consultant': {
        age: 38,
        gender: 'M',
        education: 'M.Tech',
        income: '₹12-15 LPA',
        family: 'Married, 2 children',
        personality: 'Technical, problem-solving, client-focused, detail-oriented',
        background_story: 'Started as a software developer, moved to consulting. Has 12 years of experience in IT solutions and digital transformation. Advises clients on technology decisions.',
        goals: 'Expand consulting practice, specialize in cloud technologies, mentor junior consultants',
        pain_points: 'Client resistance to change, outdated systems, budget constraints, technical debt',
        motivations: 'Solving complex problems, client success, technology innovation',
        hobbies: 'Technology blogs, coding projects, family time, reading tech books',
        daily_routine: 'Starts at 9 AM, client meetings, technical analysis, family time in evening',
        decision_style: 'Technical, risk-assessed, client-focused',
        communication_style: 'Technical but accessible, solution-oriented',
        key_phrases: ['Let me analyze your requirements', 'This solution will help', 'We need to consider security', 'Let\'s implement this step by step'],
        fintech_usage: 'Uses UPI, online banking, investment apps, crypto',
        triggers: 'Poor security practices, outdated technology, client resistance',
        community_values: 'Technical excellence, client success, continuous learning'
    },
    'Retail Manager': {
        age: 30,
        gender: 'M',
        education: 'B.Com',
        income: '₹4-6 LPA',
        family: 'Single, lives with parents',
        personality: 'Customer-focused, organized, team-oriented, energetic',
        background_story: 'Started as a sales associate, worked his way up to store manager. Has 6 years of experience in retail operations and customer service. Manages a team of 15 people.',
        goals: 'Increase store sales, improve customer satisfaction, get promoted to area manager',
        pain_points: 'Staff turnover, inventory management, customer complaints, competition',
        motivations: 'Customer satisfaction, team success, sales growth, recognition',
        hobbies: 'Shopping, watching retail trends, team building activities, movies',
        daily_routine: 'Starts at 8 AM, store opening, staff management, customer service, closes at 9 PM',
        decision_style: 'Customer-focused, quick, team-consulted',
        communication_style: 'Friendly, service-oriented, team-focused',
        key_phrases: ['How can I help you?', 'Let me check our inventory', 'Customer satisfaction is our priority', 'Let\'s work as a team'],
        fintech_usage: 'Uses UPI, online banking, retail management apps',
        triggers: 'Customer complaints, staff issues, inventory problems',
        community_values: 'Customer service, team work, community engagement'
    },
    'Marketing Manager': {
        age: 34,
        gender: 'M',
        education: 'MBA',
        income: '₹10-12 LPA',
        family: 'Married, 1 child',
        personality: 'Creative, strategic, data-driven, collaborative',
        background_story: 'Started in advertising, moved to digital marketing. Has 10 years of experience in brand management and digital campaigns. Leads a team of 8 marketing professionals.',
        goals: 'Launch successful campaigns, increase brand awareness, mentor team members',
        pain_points: 'Budget constraints, changing consumer behavior, competition, ROI measurement',
        motivations: 'Brand success, creative expression, team growth, market impact',
        hobbies: 'Content creation, social media, photography, family time',
        daily_routine: 'Starts at 9 AM, campaign planning, team meetings, creative reviews, ends at 7 PM',
        decision_style: 'Data-driven, creative, collaborative',
        communication_style: 'Creative, persuasive, data-supported',
        key_phrases: ['Let\'s create something amazing', 'What does the data say?', 'We need to engage our audience', 'Let\'s think outside the box'],
        fintech_usage: 'Uses UPI, online banking, marketing tools, analytics platforms',
        triggers: 'Poor campaign performance, budget cuts, creative blocks',
        community_values: 'Creativity, innovation, brand building, team collaboration'
    },
    'Financial Advisor': {
        age: 40,
        gender: 'M',
        education: 'CA',
        income: '₹15-18 LPA',
        family: 'Married, 2 children',
        personality: 'Analytical, trustworthy, detail-oriented, client-focused',
        background_story: 'Started as a junior accountant, became a CA, then moved to financial advisory. Has 15 years of experience in financial planning and investment advisory. Runs his own practice.',
        goals: 'Grow client base, provide excellent financial advice, achieve work-life balance',
        pain_points: 'Market volatility, client expectations, regulatory changes, competition',
        motivations: 'Client financial success, professional growth, family security',
        hobbies: 'Reading financial news, golf, family time, investment research',
        daily_routine: 'Starts at 9 AM, client meetings, market analysis, family time in evening',
        decision_style: 'Risk-assessed, client-focused, evidence-based',
        communication_style: 'Professional, trustworthy, clear explanations',
        key_phrases: ['Let me analyze your portfolio', 'We need to diversify', 'This is a good investment', 'Let\'s plan for your future'],
        fintech_usage: 'Uses UPI, online banking, investment platforms, financial apps',
        triggers: 'Poor investment decisions, market crashes, client complaints',
        community_values: 'Financial literacy, trust, client success, professional ethics'
    },
    'Product Manager': {
        age: 36,
        gender: 'M',
        education: 'MBA',
        income: '₹12-15 LPA',
        family: 'Married, 1 child',
        personality: 'Strategic, user-focused, collaborative, innovative',
        background_story: 'Started as a software engineer, moved to product management. Has 10 years of experience in product development and strategy. Leads product teams and drives innovation.',
        goals: 'Launch successful products, improve user experience, mentor product teams',
        pain_points: 'Stakeholder alignment, resource constraints, market competition, technical debt',
        motivations: 'Product success, user satisfaction, team growth, innovation',
        hobbies: 'Product reviews, user research, technology trends, family time',
        daily_routine: 'Starts at 9 AM, product planning, team meetings, user research, ends at 7 PM',
        decision_style: 'User-focused, data-driven, collaborative',
        communication_style: 'Strategic, user-centric, collaborative',
        key_phrases: ['What do our users need?', 'Let\'s prioritize this feature', 'We need to validate this', 'How does this impact the user?'],
        fintech_usage: 'Uses UPI, online banking, product analytics tools, investment apps',
        triggers: 'Poor user experience, feature bloat, technical issues',
        community_values: 'User-centricity, innovation, team collaboration, product excellence'
    },
    'Business Analyst': {
        age: 29,
        gender: 'M',
        education: 'B.Tech',
        income: '₹7-9 LPA',
        family: 'Single, lives with roommates',
        personality: 'Analytical, detail-oriented, problem-solving, collaborative',
        background_story: 'Started as a data analyst, moved to business analysis. Has 5 years of experience in requirements gathering and process improvement. Works with cross-functional teams.',
        goals: 'Improve business processes, learn advanced analytics, get promoted to senior analyst',
        pain_points: 'Unclear requirements, stakeholder conflicts, data quality issues, scope creep',
        motivations: 'Process improvement, business impact, learning new skills, career growth',
        hobbies: 'Data visualization, online courses, gaming, networking events',
        daily_routine: 'Starts at 9 AM, requirements gathering, data analysis, stakeholder meetings, ends at 6 PM',
        decision_style: 'Data-driven, stakeholder-consulted, evidence-based',
        communication_style: 'Analytical, clear, stakeholder-focused',
        key_phrases: ['Let me analyze the requirements', 'What\'s the business impact?', 'We need to gather more data', 'Let\'s document this properly'],
        fintech_usage: 'Uses UPI, online banking, analytics tools, investment apps',
        triggers: 'Unclear requirements, poor data quality, scope changes',
        community_values: 'Process improvement, data-driven decisions, stakeholder success'
    },
    'Senior Software Engineer': {
        age: 32,
        gender: 'M',
        education: 'B.Tech',
        income: '₹10-12 LPA',
        family: 'Married, 1 child',
        personality: 'Technical, problem-solving, collaborative, innovative',
        background_story: 'Started as a junior developer, worked his way up to senior engineer. Has 8 years of experience in software development and architecture. Leads technical teams and mentors junior developers.',
        goals: 'Build scalable systems, mentor junior developers, learn new technologies',
        pain_points: 'Technical debt, tight deadlines, legacy code, resource constraints',
        motivations: 'Technical excellence, team success, innovation, career growth',
        hobbies: 'Coding projects, tech blogs, open source contributions, family time',
        daily_routine: 'Starts at 9 AM, coding, code reviews, team meetings, ends at 6 PM',
        decision_style: 'Technical, performance-focused, team-consulted',
        communication_style: 'Technical, clear, collaborative',
        key_phrases: ['Let me check the code', 'We need to optimize this', 'This approach will work better', 'Let\'s refactor this'],
        fintech_usage: 'Uses UPI, online banking, development tools, investment apps',
        triggers: 'Poor code quality, technical debt, missed deadlines',
        community_values: 'Technical excellence, code quality, team collaboration, innovation'
    },
    'Senior Data Scientist': {
        age: 38,
        gender: 'M',
        education: 'PhD',
        income: '₹18-22 LPA',
        family: 'Married, 2 children',
        personality: 'Analytical, innovative, research-oriented, collaborative',
        background_story: 'Academic background with 12 years in data science. Started as a research scientist, moved to industry. Leads data science teams and drives AI/ML initiatives.',
        goals: 'Publish research papers, build advanced ML models, mentor data scientists',
        pain_points: 'Data quality issues, model performance, stakeholder expectations, resource constraints',
        motivations: 'Research impact, model success, team development, innovation',
        hobbies: 'Research papers, machine learning projects, family time, photography',
        daily_routine: 'Starts at 9 AM, model development, team meetings, research, ends at 7 PM',
        decision_style: 'Evidence-based, model-driven, collaborative',
        communication_style: 'Technical, research-focused, data-supported',
        key_phrases: ['Let me analyze the data', 'The model shows', 'We need more training data', 'Let\'s validate this approach'],
        fintech_usage: 'Uses UPI, online banking, ML platforms, investment apps',
        triggers: 'Poor data quality, model failures, unrealistic expectations',
        community_values: 'Research excellence, data integrity, team development, innovation'
    },
    'Doctor': {
        age: 45,
        gender: 'M',
        education: 'MD',
        income: '₹20-25 LPA',
        family: 'Married, 2 children',
        personality: 'Compassionate, analytical, patient-focused, detail-oriented',
        background_story: 'Medical school graduate with 18 years of experience. Started as a resident, became a specialist. Now runs his own practice and consults at hospitals.',
        goals: 'Provide excellent patient care, stay updated with medical advances, mentor junior doctors',
        pain_points: 'Long working hours, patient expectations, medical malpractice, administrative burden',
        motivations: 'Patient care, medical excellence, professional growth, community health',
        hobbies: 'Medical journals, family time, community service, reading medical books',
        daily_routine: 'Starts at 8 AM, patient consultations, hospital rounds, ends at 8 PM',
        decision_style: 'Evidence-based, patient-focused, risk-assessed',
        communication_style: 'Compassionate, clear, professional',
        key_phrases: ['Let me examine you', 'Based on your symptoms', 'We need to run some tests', 'Take care of yourself'],
        fintech_usage: 'Uses UPI, online banking, medical apps, investment platforms',
        triggers: 'Patient complaints, medical errors, administrative issues',
        community_values: 'Patient care, medical ethics, community health, professional excellence'
    },
    'Sales Agent': {
        age: 26,
        gender: 'M',
        education: 'B.Com',
        income: '₹3-5 LPA + commissions',
        family: 'Single, lives with parents',
        personality: 'Energetic, persuasive, ambitious, relationship-focused',
        background_story: 'Started in retail sales, moved to B2C sales. Has 4 years of experience in customer service and sales. Works in a call center selling financial products.',
        goals: 'Increase sales performance, get promoted to team lead, improve communication skills',
        pain_points: 'Rejection, difficult customers, unrealistic targets, competition',
        motivations: 'Financial success, recognition, customer satisfaction, career growth',
        hobbies: 'Sales training videos, networking, family time, watching motivational content',
        daily_routine: 'Starts at 9 AM, customer calls, sales meetings, follow-ups, ends at 6 PM',
        decision_style: 'Quick, customer-focused, target-driven',
        communication_style: 'Persuasive, friendly, solution-oriented',
        key_phrases: ['How can I help you today?', 'This product will benefit you', 'Let me explain the features', 'What\'s your budget?'],
        fintech_usage: 'Uses UPI, online banking, sales CRM tools',
        triggers: 'Rejection, difficult customers, missed targets',
        community_values: 'Customer service, persistence, hard work, family support'
    },
    'Small Business Owner': {
        age: 48,
        gender: 'M',
        education: 'B.Com',
        income: '₹8-12 LPA (business profit)',
        family: 'Married, 2 children',
        personality: 'Entrepreneurial, risk-taking, family-focused, determined',
        background_story: 'Started his own business 15 years ago. Runs a small manufacturing unit with 20 employees. Faces challenges of competition and market fluctuations.',
        goals: 'Grow the business, provide for family, create employment opportunities',
        pain_points: 'Competition, cash flow issues, regulatory compliance, employee management',
        motivations: 'Business growth, family security, community development, independence',
        hobbies: 'Business networking, family time, community service, reading business books',
        daily_routine: 'Starts at 7 AM, factory inspection, meetings, business development, ends at 8 PM',
        decision_style: 'Risk-assessed, family-considered, business-focused',
        communication_style: 'Direct, business-focused, family-oriented',
        key_phrases: ['We need to grow the business', 'Quality is our priority', 'Let\'s work together', 'Family comes first'],
        fintech_usage: 'Uses UPI, online banking, business apps, investment platforms',
        triggers: 'Business losses, employee issues, regulatory problems',
        community_values: 'Hard work, family values, community support, business ethics'
    }
};

// Regional variations for different locations
const regionalVariations = {
    'Pune, Maharashtra': {
        cultural_heritage: 'Maharashtrian culture, Marathi language, Ganesh Chaturthi celebrations',
        community_values: 'Education, hard work, family values, social service',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Bangalore, Karnataka': {
        cultural_heritage: 'Kannada culture, IT hub, diverse population, tech-savvy community',
        community_values: 'Innovation, education, technology, work-life balance',
        key_phrases: ['Chennagide', 'Tumba chennagide', 'Kannada gothilla', 'Swalpa adjust maadi']
    },
    'Chennai, Tamil Nadu': {
        cultural_heritage: 'Tamil culture, classical music, temple festivals, traditional values',
        community_values: 'Education, tradition, family values, cultural heritage',
        key_phrases: ['Nalla irukku', 'Romba nalla', 'Enna pannalam', 'Sari']
    },
    'Mumbai, Maharashtra': {
        cultural_heritage: 'Cosmopolitan culture, Marathi heritage, Bollywood influence, diverse communities',
        community_values: 'Hard work, ambition, diversity, resilience',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Delhi, NCR': {
        cultural_heritage: 'North Indian culture, Punjabi influence, political hub, diverse communities',
        community_values: 'Ambition, networking, political awareness, family values',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Hyderabad, Telangana': {
        cultural_heritage: 'Telugu culture, Nizami heritage, IT hub, biryani capital',
        community_values: 'Education, technology, cultural diversity, business acumen',
        key_phrases: ['Chala bagundi', 'Nenu chepthunna', 'Em chestham', 'Sare']
    },
    'Kochi, Kerala': {
        cultural_heritage: 'Malayalam culture, backwaters, spice trade, diverse religions',
        community_values: 'Education, social equality, environmental consciousness, cultural diversity',
        key_phrases: ['Nalla', 'Sari', 'Entha', 'Kollam']
    },
    'Ahmedabad, Gujarat': {
        cultural_heritage: 'Gujarati culture, business hub, textile industry, vegetarian cuisine',
        community_values: 'Business ethics, family values, education, community service',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Indore, Madhya Pradesh': {
        cultural_heritage: 'Central Indian culture, Marathi influence, business hub, food culture',
        community_values: 'Hard work, business acumen, family values, community service',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Lucknow, Uttar Pradesh': {
        cultural_heritage: 'Awadhi culture, Urdu poetry, nawabi heritage, traditional crafts',
        community_values: 'Cultural heritage, education, family values, social harmony',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Vijayawada, Andhra Pradesh': {
        cultural_heritage: 'Telugu culture, Krishna river, agricultural heritage, traditional arts',
        community_values: 'Education, agriculture, cultural heritage, family values',
        key_phrases: ['Chala bagundi', 'Nenu chepthunna', 'Em chestham', 'Sare']
    },
    'Mysore, Karnataka': {
        cultural_heritage: 'Kannada culture, royal heritage, sandalwood, classical music',
        community_values: 'Cultural heritage, education, tradition, environmental consciousness',
        key_phrases: ['Chennagide', 'Tumba chennagide', 'Kannada gothilla', 'Swalpa adjust maadi']
    },
    'Coimbatore, Tamil Nadu': {
        cultural_heritage: 'Tamil culture, textile industry, educational hub, traditional values',
        community_values: 'Education, industry, family values, cultural heritage',
        key_phrases: ['Nalla irukku', 'Romba nalla', 'Enna pannalam', 'Sari']
    }
};

async function enrichAgents() {
    try {
        console.log('🔄 Fetching all agents...');
        
        // Get all agents
        const result = await pool.query('SELECT id, name, location FROM ai_agents ORDER BY created_at');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to enrich`);
        
        // Enrich each agent
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const role = 'Professional'; // Default role since not available in schema
            const location = agent.location;
            
            // Get base profile for the role
            const baseProfile = agentProfiles[role] || agentProfiles['Sales Executive'];
            
            // Get regional variations
            const regional = regionalVariations[location] || regionalVariations['Pune, Maharashtra'];
            
            // Create enriched profile
            const enrichedProfile = {
                age: baseProfile.age + Math.floor(Math.random() * 10) - 5, // Add some variation
                gender: baseProfile.gender,
                education: baseProfile.education,
                income: baseProfile.income,
                family: baseProfile.family,
                personality: JSON.stringify({
                    traits: baseProfile.personality,
                    communication_style: baseProfile.communication_style,
                    decision_style: baseProfile.decision_style
                }),
                background_story: baseProfile.background_story,
                goals: baseProfile.goals.split(', '),
                pain_points: baseProfile.pain_points.split(', '),
                motivations: baseProfile.motivations.split(', '),
                hobbies: JSON.stringify({
                    interests: baseProfile.hobbies,
                    activities: baseProfile.hobbies
                }),
                daily_routine: JSON.stringify({
                    schedule: baseProfile.daily_routine,
                    habits: baseProfile.daily_routine
                }),
                decision_making: JSON.stringify({
                    style: baseProfile.decision_style,
                    approach: baseProfile.decision_style
                }),
                communication_style: JSON.stringify({
                    tone: 'professional',
                    approach: baseProfile.communication_style
                }),
                key_quotes: JSON.stringify([...baseProfile.key_phrases, ...regional.key_phrases]),
                fintech_preferences: JSON.stringify({
                    usage: baseProfile.fintech_usage,
                    preferences: baseProfile.fintech_usage
                }),
                social_context: JSON.stringify({
                    values: baseProfile.community_values,
                    triggers: baseProfile.triggers
                }),
                cultural_background: JSON.stringify({
                    heritage: regional.cultural_heritage,
                    values: baseProfile.community_values
                }),
                sample_quote: generateSampleQuote(role, regional.key_phrases),
                tone: 'professional'
            };
            
            // Update the agent using correct column names
            await pool.query(`
                UPDATE ai_agents SET 
                    age = $1,
                    gender = $2,
                    education = $3,
                    income_range = $4,
                    personality = $5,
                    background_story = $6,
                    goals = $7,
                    pain_points = $8,
                    motivations = $9,
                    hobbies = $10,
                    daily_routine = $11,
                    decision_making = $12,
                    communication_style = $13,
                    key_quotes = $14,
                    fintech_preferences = $15,
                    social_context = $16,
                    cultural_background = $17,
                    sample_quote = $18,
                    tone = $19,
                    personality_traits = $20
                WHERE id = $21
            `, [
                enrichedProfile.age,
                enrichedProfile.gender,
                enrichedProfile.education,
                enrichedProfile.income,
                enrichedProfile.personality,
                enrichedProfile.background_story,
                enrichedProfile.goals,
                enrichedProfile.pain_points,
                enrichedProfile.motivations,
                enrichedProfile.hobbies,
                enrichedProfile.daily_routine,
                enrichedProfile.decision_style,
                enrichedProfile.communication_style,
                enrichedProfile.key_phrases,
                enrichedProfile.fintech_usage,
                enrichedProfile.triggers,
                enrichedProfile.community_values,
                enrichedProfile.cultural_heritage,
                enrichedProfile.sample_quote,
                enrichedProfile.tone,
                agent.id
            ]);
            
            console.log(`✅ Enriched ${agent.name} (${role}) - ${location} (${i + 1}/${agents.length})`);
        }
        
        console.log('🎉 All agents enriched successfully!');
        
    } catch (error) {
        console.error('❌ Error enriching agents:', error);
    } finally {
        await pool.end();
    }
}

function generateSampleQuote(role, regionalPhrases) {
    const quotes = {
        'Operations Manager': `"${regionalPhrases[0]}, we need to optimize our processes to improve efficiency and reduce costs."`,
        'Research Director': `"${regionalPhrases[0]}, based on our research data, I can see some interesting patterns emerging."`,
        'Data Analyst': `"${regionalPhrases[0]}, the numbers clearly show that we need to focus on this area for better results."`,
        'Sales Executive': `"${regionalPhrases[0]}, I'm confident this product will meet your needs perfectly."`,
        'IT Consultant': `"${regionalPhrases[0]}, this solution will help streamline your operations and improve security."`,
        'Retail Manager': `"${regionalPhrases[0]}, customer satisfaction is our top priority, and we're committed to excellence."`,
        'Marketing Manager': `"${regionalPhrases[0]}, we need to create engaging content that resonates with our target audience."`,
        'Financial Advisor': `"${regionalPhrases[0]}, let me help you plan for a secure financial future."`,
        'Product Manager': `"${regionalPhrases[0]}, we need to focus on user experience and deliver value to our customers."`,
        'Business Analyst': `"${regionalPhrases[0]}, let me analyze the requirements and propose the best solution."`,
        'Senior Software Engineer': `"${regionalPhrases[0]}, we need to write clean, maintainable code that scales well."`,
        'Senior Data Scientist': `"${regionalPhrases[0]}, our machine learning model shows promising results for this use case."`,
        'Doctor': `"${regionalPhrases[0]}, your health is my priority, and I'm here to help you feel better."`,
        'Sales Agent': `"${regionalPhrases[0]}, I'm here to help you find the perfect solution for your needs."`,
        'Small Business Owner': `"${regionalPhrases[0]}, we're committed to quality and customer satisfaction in everything we do."`
    };
    
    return quotes[role] || `"${regionalPhrases[0]}, I'm here to help you with your needs."`;
}

function generateBeliefs(role, communityValues) {
    const beliefs = {
        'Operations Manager': `Efficiency and process improvement are key to success. ${communityValues}.`,
        'Research Director': `Evidence-based decisions lead to better outcomes. ${communityValues}.`,
        'Data Analyst': `Data tells the real story. ${communityValues}.`,
        'Sales Executive': `Building relationships is the foundation of sales success. ${communityValues}.`,
        'IT Consultant': `Technology should solve real problems. ${communityValues}.`,
        'Retail Manager': `Customer satisfaction drives business success. ${communityValues}.`,
        'Marketing Manager': `Understanding customers is essential for effective marketing. ${communityValues}.`,
        'Financial Advisor': `Financial planning is crucial for a secure future. ${communityValues}.`,
        'Product Manager': `User needs should drive product decisions. ${communityValues}.`,
        'Business Analyst': `Clear requirements lead to successful projects. ${communityValues}.`,
        'Senior Software Engineer': `Code quality and maintainability are paramount. ${communityValues}.`,
        'Senior Data Scientist': `Data integrity and model accuracy are essential. ${communityValues}.`,
        'Doctor': `Patient care and medical ethics are fundamental. ${communityValues}.`,
        'Sales Agent': `Helping customers find solutions is rewarding. ${communityValues}.`,
        'Small Business Owner': `Hard work and integrity build successful businesses. ${communityValues}.`
    };
    
    return beliefs[role] || `Success comes from dedication and hard work. ${communityValues}.`;
}

enrichAgents();
