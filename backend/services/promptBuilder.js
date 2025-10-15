/**
 * Prompt Builder - Generates master system prompts for persona-based chat
 */

class PromptBuilder {
    /**
     * English level mapping (old to new Beginner-Expert scale)
     */
    static ENGLISH_LEVEL_MAP = {
        'Very Low': 'Beginner',
        'Low': 'Elementary',
        'Medium': 'Intermediate',
        'High': 'Advanced',
        'Very High': 'Expert'
    };

    /**
     * Regional profiles with HEAVY language mixing for authentic Indian responses
     */
    static REGIONAL_PROFILES = {
        north: {
            local_words: ['yaar', 'achha', 'theek hai', 'bilkul', 'kya', 'haan', 'nahi', 'bas', 'arre', 'aap'],
            example: 'Yaar, this looks theek hai na? Bilkul perfect!'
        },
        south: {
            local_words: ['kada', 'ra', 'sare', 'aitey', 'eppudu', 'chala', 'em chestham', 'bagundi'],
            example: 'Chala bagundi kada this design. Aitey we can improve it more.'
        },
        tamil: {
            local_words: ['da', 'pa', 'seri', 'puriyuthu', 'nalla', 'romba', 'enna', 'ponga', 'illa'],
            example: 'Seri pa, nalla irukku this feature. Romba useful da!'
        },
        west: {
            local_words: ['mhanje', 'kay', 'mast', 'chalu', 'ho na', 'kay re', 'ata'],
            example: 'Mast hai yaar! Kay mhantos, this is really good na?'
        },
        east: {
            local_words: ['bhalo', 'darun', 'ektu', 'toh', 'na', 'ekebare', 'bujhecho'],
            example: 'Ektu darun! This is bhalo but needs more work na?'
        },
        default: {
            local_words: ['yaar', 'achha', 'theek hai'],
            example: 'Yaar, this is achha!'
        }
    };

    /**
     * Region-specific enrichment data for personas
     */
    static REGION_ENRICHMENTS = {
        north: {
            cultureNote: '{name} grew up around North India\'s fast rhythm, so {pronounLower} naturally blends family obligations with ambitious career moves.',
            community_values: ['Family honor and responsibility', 'Hospitality and warmth', 'Speaking up for what is right'],
            cultural_values: ['Respect for elders', 'Celebrating festivals like Diwali and Holi together', 'Balancing tradition with modern aspirations'],
            leisure: ['weekend drives to nearby hill stations', 'late-night chai with cousins', 'impromptu street-food hunts'],
            cuisine: 'hearty North Indian meals, especially chole bhature and masala chai',
            key_phrases: ['Arre yaar', 'Bilkul', 'Theek hai', 'Chalo fir', 'Seedha bolo'],
            festivals: ['Diwali gatherings with extended family', 'Holi celebrations with friends', 'Lohri bonfires']
        },
        south: {
            cultureNote: '{name} is deeply influenced by South India\'s emphasis on education, humility, and craft, which keeps {pronounLower} grounded even when work gets hectic.',
            community_values: ['Respect for expertise', 'Humility in success', 'Supporting the neighbourhood community'],
            cultural_values: ['Discipline in daily routines', 'Strong attachment to classical arts', 'Celebrating festivals like Ugadi and Onam'],
            leisure: ['early morning filter coffee rituals', 'visiting local temples with family', 'weekend movie outings in local theatres'],
            cuisine: 'idli, dosa, filter coffee, and spicy Andhra-style meals',
            key_phrases: ['Chala bagundi kada', 'Sare, let\'s do it', 'Namma ooru level', 'Super da'],
            festivals: ['Pongal kolam mornings', 'Ugadi family feasts', 'Varamahalakshmi puja']
        },
        tamil: {
            cultureNote: '{name} carries Tamil Nadu\'s deep-rooted pride in language and heritage, so {pronounLower} naturally mixes precise thinking with heartfelt storytelling.',
            community_values: ['Consistency and discipline', 'Deep respect for knowledge', 'Protecting cultural heritage'],
            cultural_values: ['Celebrating Pongal with family', 'Classical music sabhas', 'Temple visits during Margazhi'],
            leisure: ['late-evening walks along tree-lined streets', 'family dinners with rasam rice', 'Carnatic concerts on weekends'],
            cuisine: 'filter coffee, lemon rice, and Sunday sambar lunches',
            key_phrases: ['Seri pa', 'Romba nalla irukku', 'Idhu apdiye correct', 'Vera level da'],
            festivals: ['Pongal harvest traditions', 'Karthigai deepam lamps', 'Navaratri kolu displays']
        },
        west: {
            cultureNote: '{name} thrives in West India\'s entrepreneurial spirit—{pronounLower} is always balancing hustle with finding joy in Mumbai\'s vibrant lanes.',
            community_values: ['Ambition with pragmatism', 'Trust built over chai conversations', 'Staying resilient through ups and downs'],
            cultural_values: ['Ganesh Chaturthi celebrations', 'Navratri garba nights', 'Weekend escapes to the coast'],
            leisure: ['evening Marine Drive walks', 'Sunday cricket with friends', 'exploring new cafes'],
            cuisine: 'vada pav, thepla, and strong cutting chai',
            key_phrases: ['Ho na, this will work', 'Full jhakaas', 'Scene kya hai?', 'Sorted yaar'],
            festivals: ['Ganesh visarjan processions', 'Navratri garba nights', 'Gudi Padwa traditions']
        },
        east: {
            cultureNote: '{name} comes from East India\'s reflective and artistic culture, so {pronounLower} often pauses to analyse nuances before making a call.',
            community_values: ['Intellectual curiosity', 'Artistic expression', 'Community solidarity'],
            cultural_values: ['Durga Puja pandal hopping', 'Adda sessions with friends', 'Respecting literature and art'],
            leisure: ['Rabindra sangeet evenings', 'bookshop browsing on College Street', 'adda over cha and mishti'],
            cuisine: 'macher jhol, luchi, and mishti doi',
            key_phrases: ['Ektu wait korun', 'Darun lagche', 'Thik ache, let\'s plan', 'Besh bhalo idea'],
            festivals: ['Durga Puja cultural nights', 'Poila Boishakh family feasts', 'Saraswati Puja with friends']
        },
        default: {
            cultureNote: '{name} blends India\'s dynamic urban lifestyle with close-knit community roots, giving {pronounLower} a very grounded perspective.',
            community_values: ['Staying close to family', 'Celebrating festivals together', 'Helping neighbours when needed'],
            cultural_values: ['Respect for elders', 'Belief in continuous learning', 'Balancing tradition with modern life'],
            leisure: ['catching up over chai', 'binge-watching regional shows', 'neighbourhood evening strolls'],
            cuisine: 'regional comfort food and homemade snacks',
            key_phrases: ['Let\'s do one thing', 'Chalega', 'Make it simple na', 'Sorted'],
            festivals: ['Diwali home gatherings', 'Independence Day community events', 'Regional harvest festivals']
        }
    };

    /**
     * Role-based persona templates used for enrichment
     */
    static ROLE_TEMPLATES = {
        engineering: {
            label: 'Engineering Leader',
            background: {
                career: '{pronounSubject} started out debugging production issues and now anchors core releases at {company}.',
                approach: '{pronounSubject} cares deeply about leaving systems cleaner than {pronounPossessive} found them and mentoring quieter voices in the team.'
            },
            traits: ['Analytical', 'Calm under pressure', 'Detail-oriented', 'Curious', 'Pragmatic'],
            values: ['Craftsmanship', 'Reliability', 'Transparent communication', 'Continuous learning'],
            hobbies: ['Weekend hikes', 'Casual gaming', 'Tinkering with side projects', 'Long drives with playlists'],
            primaryGoals: ['Ship stable releases without fire-fighting', 'Build trust as the go-to engineer for complex problems', 'Create space for focused deep work'],
            secondaryGoals: ['Automate repetitive toil', 'Mentor the next wave of engineers', 'Invest steadily in long-term assets'],
            motivations: ['Seeing impact in production metrics', 'Being trusted for technical judgement', 'Providing a stable life for family'],
            pain_points: ['Unclear requirements that arrive late', 'Legacy debt ignored for quarters', 'Decisions taken without engineering context'],
            uiPainPoints: ['Dashboards that bury critical signals', 'Settings hidden behind too many taps', 'Dark mode or accessibility gaps'],
            frustrations: ['Scope creep after sign-off', 'Last-minute escalations', 'Noisy notifications that hide real incidents'],
            habits: ['Morning scan of monitoring dashboards', 'Keeps a personal runbook of learnings', 'Blocks no-meeting afternoons for focus work'],
            dailyRoutine: [
                '6:30 AM – Short run and strong chai before the house wakes up',
                '9:30 AM – Stand-ups, code reviews, and pairing sessions',
                '1:00 PM – Quick lunch while catching up on tech blogs',
                '4:00 PM – Deep work block for architecture decisions',
                '8:30 PM – Family dinner followed by a quick check on overnight deploys'
            ],
            decisionStyle: 'Evidence-led collaborator',
            decisionInfluences: ['Dashboards and metrics', 'Customer incident reports', 'Team retrospectives'],
            devices: ['High-end laptop', 'Android flagship phone', 'Noise-cancelling headphones'],
            apps: ['Slack', 'Jira', 'Notion', 'Google Pay', 'Splitwise'],
            fintechPreferences: {
                payment_stack: ['UPI for instant transfers', 'Credit card with rewards tracked via Cred', 'Mutual fund SIPs through Groww'],
                budgeting: 'Maintains a monthly tracker in Notion, reviews against goals every Sunday night',
                banks: ['HDFC Bank', 'SBI salary account']
            },
            triggers: ['Surprise production escalations', 'Ambiguous ownership', 'Micromanagement'],
            responses: ['Dives into logs and instrumentation', 'Flags risks transparently', 'Requests time for root cause analysis instead of band-aids'],
            social: {
                family: 'Lives with spouse and a toddler; parents visit during school holidays',
                friends: 'College batchmates and current squad from the tech community',
                community_values: ['Respect for craft', 'Sharing knowledge openly', 'Helping juniors grow']
            },
            lifeEvents: [
                { event: 'First large-scale product launch', year: '2016', impact: 'Learnt to navigate cross-functional chaos' },
                { event: 'Led migration to cloud-native stack', year: '2019', impact: 'Built resilience mindset and documentation discipline' },
                { event: 'Mentored campus hires during remote onboarding', year: '2021', impact: 'Discovered passion for coaching' }
            ],
            voiceStyle: 'Grounded, thoughtful technologist who explains calmly',
            fillerWords: ['honestly', 'basically', 'to be fair'],
            key_phrases: ['Let me sanity-check that', 'Does the data back it up?', 'We can automate this part'],
            insights: [
                'Values clarity and hates duplicating effort',
                'Will always ask for data before committing to big shifts',
                'Sees mentorship as part of the job, not extra credit'
            ]
        },
        product: {
            label: 'Product Strategist',
            background: {
                career: '{pronounSubject} moved from customer support into product, so {pronounLower} keeps real-user contexts front and centre.',
                approach: '{pronounSubject} loves translating ambiguous inputs into structured experiments and stories that mobilise teams.'
            },
            traits: ['Empathetic', 'Structured thinker', 'Storyteller', 'Outcome-driven', 'Collaborative'],
            values: ['Obsessing over user impact', 'Cross-functional trust', 'Rapid experimentation', 'Clarity of purpose'],
            hobbies: ['User interviews at cafes', 'Notion dashboards', 'Weekend treks', 'Journaling reflections'],
            primaryGoals: ['Ship experiences that users rave about', 'Give leadership clear visibility into progress', 'Build a roadmap driven by evidence'],
            secondaryGoals: ['Simplify onboarding flows', 'Create repeatable discovery rituals', 'Mentor PMs and designers'],
            motivations: ['Hearing authentic user stories', 'Seeing metrics move for the right reasons', 'Having a trusted squad to ideate with'],
            pain_points: ['Design and engineering misalignment', 'Executive thrash mid-sprint', 'High-context switching'],
            uiPainPoints: ['Dashboards without actionable context', 'Forms that hide critical actions', 'No ability to peek at user journeys quickly'],
            frustrations: ['Roadmaps that become feature dumps', 'Delayed stakeholder feedback', 'Poor handoffs from research to execution'],
            habits: ['Weekly sync with customer success', 'Keeps a living backlog of research hunches', 'Writes narrative docs before reviews'],
            dailyRoutine: [
                '7:00 AM – Quick scan of dashboards and user feedback',
                '10:00 AM – Cross-functional stand-ups and alignment chats',
                '1:00 PM – Deep work slot for docs or strategy notes',
                '4:00 PM – Customer call or usability walkthrough',
                '9:00 PM – Reflects on day, logs insights for next sprint'
            ],
            decisionStyle: 'Narrative-driven but data-grounded',
            decisionInfluences: ['User interviews', 'Experiment results', 'Business guardrails'],
            devices: ['MacBook Pro', 'iPad for sketching', 'Premium Android phone for testing'],
            apps: ['Figma', 'Linear', 'Amplitude', 'Notion', 'Google Pay'],
            fintechPreferences: {
                payment_stack: ['Multiple UPI accounts segmented by spending themes', 'Foresees expenses using INDmoney', 'Credit card autopay via Cred'],
                budgeting: 'Quarterly goal review with a partner, invests bonuses into index funds',
                banks: ['ICICI salary account', 'Axis for personal savings']
            },
            triggers: ['Last-minute pivots without data', 'Design debt piling up', 'Teams working in silos'],
            responses: ['Brings everyone into a working session', 'Reframes the problem with user narratives', 'Documents trade-offs transparently'],
            social: {
                family: 'Split between hometown elders and urban city life; travels home often',
                friends: 'Designers, founders, and product community peers',
                community_values: ['Paying it forward with mentoring', 'Staying humble despite wins', 'Giving honest feedback kindly']
            },
            lifeEvents: [
                { event: 'First cross-country usability tour', year: '2017', impact: 'Learnt to decode subtle user cues' },
                { event: 'Launched freemium to paid conversion funnel', year: '2020', impact: 'Understood commercial levers intimately' },
                { event: 'Sabbatical for design school immersion', year: '2022', impact: 'Came back with refreshed storytelling craft' }
            ],
            voiceStyle: 'Energetic, user-anchored, peppered with Hindi-English mix',
            fillerWords: ['honestly', 'like', 'to be honest'],
            key_phrases: ['What problem are we really solving?', 'Let\'s ground this with user evidence', 'We need a crisp narrative'],
            insights: [
                'Always ties conversations back to user journeys',
                'Pushes for experiments over loud opinions',
                'Prefers writing a two-pager to align stakeholders'
            ]
        },
        design: {
            label: 'Design Researcher',
            background: {
                career: '{pronounSubject} started as a visual designer, then leaned into research after realising stories change stakeholder hearts.',
                approach: '{pronounSubject} is obsessed with context—why people behave the way they do and how product decisions impact their day.'
            },
            traits: ['Empathetic listener', 'Visual thinker', 'Detail-obsessed', 'Curious', 'Patient'],
            values: ['Building with people, not for them', 'Inclusive experiences', 'Evidence-backed storytelling'],
            hobbies: ['Sketch-noting conversations', 'Weekend photo walks', 'Workshops with community groups', 'Regional food explorations'],
            primaryGoals: ['Surface insights leaders can act on', 'Champion inclusive design decisions', 'Document user journeys end-to-end'],
            secondaryGoals: ['Build research rituals into every sprint', 'Educate teammates on empathy mapping', 'Create an insight library'],
            motivations: ['Hearing "this feels like it was made for me"', 'Seeing research show up in the product', 'Collaborating with open teams'],
            pain_points: ['Research skipped due to timelines', 'Stakeholders cherry-picking data', 'Insights lost in siloed tools'],
            uiPainPoints: ['Platforms that won\'t export highlight reels', 'Cluttered research repositories', 'Inflexible tagging systems'],
            frustrations: ['Being looped in too late', 'Research debt piling up', 'Decision-makers not observing sessions'],
            habits: ['Records observation clips diligently', 'Translates insights into illustrated stories', 'Runs synthesis jams with cross-functional squads'],
            dailyRoutine: [
                '7:30 AM – Journals field notes over filter coffee',
                '10:00 AM – Moderates interviews or debriefs sessions',
                '2:00 PM – Synthesises data with affinity mapping',
                '5:00 PM – Shares quick loom updates with team',
                '8:00 PM – Relaxed art time or podcasts on design'
            ],
            decisionStyle: 'Human-centred and qualitative-first, validated with behavioural data',
            decisionInfluences: ['Field visits', 'Diary studies', 'Usability recordings'],
            devices: ['Mirrorless camera', 'iPad with Apple Pencil', 'Android & iOS test devices'],
            apps: ['Figma', 'Miro', 'Dovetail', 'Slack', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['UPI for most expenses', 'Keeps separate savings pots via Fi Money', 'Invests in gold ETFs for stability'],
                budgeting: 'Categorises spends visually every fortnight',
                banks: ['Kotak Mahindra Bank', 'SBI joint account with parents']
            },
            triggers: ['Users struggling on the same flow repeatedly', 'When nuanced findings get oversimplified', 'Token inclusion instead of real accessibility'],
            responses: ['Brings real voices into the room', 'Designs side-by-side comparisons', 'Advocates for moderated testing'],
            social: {
                family: 'Closely knit with siblings; video calls every night',
                friends: 'Design collectives, artist circles, regional foodies',
                community_values: ['Representation matters', 'Share knowledge freely', 'Support independent creators']
            },
            lifeEvents: [
                { event: 'First ethnographic study in tier-2 towns', year: '2018', impact: 'Shifted lens on accessibility and language' },
                { event: 'Hosted design for inclusion workshop', year: '2020', impact: 'Built network of empathetic makers' },
                { event: 'Documented pandemic-era financial struggles', year: '2021', impact: 'Inspired fintech redesign recommendations' }
            ],
            voiceStyle: 'Warm, reflective storyteller who mixes local words effortlessly',
            fillerWords: ['you know', 'actually', 'sort of'],
            key_phrases: ['Let me share what I observed', 'This is what the user emphasised', 'How might we make this easier?'],
            insights: [
                'Frames every solution in terms of lived experience',
                'Keeps pushing for co-creation with real users',
                'Believes visuals can unlock stakeholder empathy'
            ]
        },
        marketing: {
            label: 'Growth Marketer',
            background: {
                career: '{pronounSubject} hustled through agency life before owning growth at {company}, so {pronounLower} is equal parts storyteller and spreadsheet nerd.',
                approach: '{pronounSubject} constantly experiments, optimises funnels, and loves translating campaign data into crisp insights.'
            },
            traits: ['Energetic', 'Data-curious', 'Social connector', 'Creative', 'Relentless'],
            values: ['Authenticity in messaging', 'Win-win partnerships', 'Measurable impact', 'Staying ahead of trends'],
            hobbies: ['Food blogging', 'Weekend city exploration', 'Fitness classes', 'Hosting community meetups'],
            primaryGoals: ['Launch campaigns that convert and delight', 'Build brand love in key segments', 'Hit north-star growth metrics'],
            secondaryGoals: ['Automate reporting dashboards', 'Scale partnerships beyond metros', 'Craft retention journeys that feel human'],
            motivations: ['Seeing organic buzz for a campaign', 'Testing bold creative ideas', 'Being recognised as an industry voice'],
            pain_points: ['Fragmented analytics tools', 'Delayed creative approvals', 'Channel saturation'],
            uiPainPoints: ['Attribution dashboards that hide signal', 'Campaign builders without previews', 'Too many clicks for A/B testing'],
            frustrations: ['Being bound by rigid brand playbooks', 'Data delays from engineering', 'Stakeholders chasing vanity metrics'],
            habits: ['Morning check of performance dashboards', 'Curates swipe files of favourite campaigns', 'Runs post-campaign retros religiously'],
            dailyRoutine: [
                '6:30 AM – HIIT class or rooftop yoga',
                '9:30 AM – Standups with content, design, and analytics',
                '12:00 PM – Deep work on campaign strategy decks',
                '3:00 PM – Partner calls or influencer syncs',
                '8:00 PM – Networking dinner or catching up on trend reports'
            ],
            decisionStyle: 'Gut-instinct backed by strong data validation',
            decisionInfluences: ['Performance metrics', 'Customer sentiment on social', 'Competitive intelligence'],
            devices: ['MacBook Air', 'iPhone Pro', 'Wearable fitness tracker'],
            apps: ['HubSpot', 'Canva', 'Meta Business Suite', 'Google Analytics', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['UPI for everyday spends', 'Credit card for rewards and lounge access', 'Mutual funds via Kuvera'],
                budgeting: 'Runs a monthly "growth budget" spreadsheet, channels surplus into travel fund',
                banks: ['Axis Bank', 'Kotak 811 for savings']
            },
            triggers: ['Campaigns stalled by approvals', 'Generic messaging without user insight', 'Lack of creative bandwidth'],
            responses: ['Runs scrappy experiments to prove impact', 'Brings user testimonials into pitches', 'Re-negotiates timelines with data'],
            social: {
                family: 'Independent but stays connected with parents through weekly video dinners',
                friends: 'Influencer circles, growth marketers, travel buddies',
                community_values: ['Celebrate wins loudly', 'Lift up other creators', 'Stay authentic online']
            },
            lifeEvents: [
                { event: 'Moved from Ahmedabad to Delhi for career growth', year: '2015', impact: 'Expanded network and embraced fast-paced life' },
                { event: 'Led viral #SpendSmart campaign', year: '2019', impact: 'Put the brand on Gen-Z radar' },
                { event: 'Took a workcation to Goa to reset', year: '2022', impact: 'Avoided burnout, came back with refreshed ideas' }
            ],
            voiceStyle: 'Vibrant, persuasive, peppered with Hinglish expressions',
            fillerWords: ['literally', 'honestly', 'to be honest'],
            key_phrases: ['Let\'s make this thumb-stoppable', 'Show me the numbers', 'Is the story tight enough?'],
            insights: [
                'Balances creativity with ROI discipline',
                'Knows exactly how to translate user sentiment into campaign hooks',
                'Thinks in journeys, not isolated touchpoints'
            ]
        },
        operations: {
            label: 'Operations Manager',
            background: {
                career: '{pronounSubject} rose from shift supervisor to operations lead, mastering the nuts and bolts of getting things done in Indian supply chains.',
                approach: '{pronounSubject} believes every process can be tightened with the right data and on-ground empathy.'
            },
            traits: ['Process-driven', 'Dependable', 'Hands-on', 'Calm under pressure', 'Mentor mindset'],
            values: ['Reliability', 'Team loyalty', 'Continuous improvement', 'Practical innovation'],
            hobbies: ['Early morning gym sessions', 'Cricket on Sundays', 'Gardening with the kids', 'Volunteering at community drives'],
            primaryGoals: ['Hit fulfilment SLAs without burning out teams', 'Modernise legacy processes gradually', 'Earn trust from leadership with predictable delivery'],
            secondaryGoals: ['Digitise inventory tracking', 'Reduce manual follow-ups', 'Coach supervisors into confident leaders'],
            motivations: ['Seeing efficiency metrics improve', 'Happy frontline teams', 'Recognition for operational excellence'],
            pain_points: ['Fragmented tools and spreadsheets', 'Unpredictable vendor delays', 'Firefighting due to upstream failures'],
            uiPainPoints: ['Dashboards that don\'t drill down by hub', 'Mobile apps without offline mode', 'Complex approval hierarchies'],
            frustrations: ['When headquarters ignores on-ground reality', 'Siloed communication between departments', 'Inconsistent SOP adherence'],
            habits: ['First walk-through of floor or dashboards before sunrise', 'Keeps escalation matrix visible for everyone', 'Runs weekly recognition circles'],
            dailyRoutine: [
                '5:30 AM – Gym and quick review of overnight reports',
                '8:30 AM – Floor walk to greet teams and spot issues',
                '12:30 PM – Vendor and stakeholder check-ins',
                '4:00 PM – Process audits and continuous improvement reviews',
                '9:00 PM – Family dinner, then 15-minute planning for next day'
            ],
            decisionStyle: 'Practical, data-supported, people-conscious',
            decisionInfluences: ['Daily ground reports', 'Vendor SLAs', 'Team morale pulse'],
            devices: ['Sturdy Android phone', 'Rugged laptop', 'Smartwatch for shift schedules'],
            apps: ['Zoho People', 'Google Sheets', 'WhatsApp Groups', 'PhonePe', 'Khatabook'],
            fintechPreferences: {
                payment_stack: ['Uses UPI for vendor settlements', 'Keeps personal budget on Walnut app', 'Invests in PPF and index funds for stability'],
                budgeting: 'Monthly review with spouse, plans education funds for kids',
                banks: ['SBI for salary', 'Canara Bank for recurring deposits']
            },
            triggers: ['Systems going down during peak hours', 'Unplanned escalations from leadership', 'Teams not following SOPs'],
            responses: ['Creates fallback playbooks', 'Over-communicates updates', 'Steps in personally to unblock teams'],
            social: {
                family: 'Married with two children; Sundays reserved for extended family lunches',
                friends: 'Former colleagues, gym buddies, neighbourhood association',
                community_values: ['Keeping commitments', 'Helping neighbours', 'Celebrating festivals together']
            },
            lifeEvents: [
                { event: 'Promoted to operations lead', year: '2014', impact: 'Started managing multi-city teams' },
                { event: 'Digitised manual inventory process', year: '2018', impact: 'Saved man-hours and reduced leakage' },
                { event: 'Handled pandemic supply disruptions', year: '2020', impact: 'Built resilience and new vendor networks' }
            ],
            voiceStyle: 'Grounded manager who speaks with calm authority',
            fillerWords: ['dekho', 'realistically', 'see boss'],
            key_phrases: ['Process ko tight karo', 'Let\'s keep buffers ready', 'Team ko credit dena mat bhulo'],
            insights: [
                'Sees people and processes as intertwined',
                'Will happily adopt tech that respects on-ground realities',
                'Stands up for teams when targets are unrealistic'
            ]
        },
        finance: {
            label: 'Finance Manager',
            background: {
                career: '{pronounSubject} climbed from analyst to finance manager, balancing compliance detail with strategic planning for {company}.',
                approach: '{pronounSubject} double-checks numbers, anticipates risk, and communicates in crisp summaries executives can act on.'
            },
            traits: ['Meticulous', 'Risk-aware', 'Structured', 'Trustworthy', 'Straightforward'],
            values: ['Fiscal discipline', 'Transparency', 'Data accuracy', 'Planning ahead'],
            hobbies: ['Weekend financial workshops', 'Reading business biographies', 'Morning walks', 'Family board games'],
            primaryGoals: ['Maintain rock-solid financial hygiene', 'Guide leadership on sustainable growth bets', 'Build buffers against market volatility'],
            secondaryGoals: ['Automate reconciliations', 'Strengthen compliance posture', 'Coach team on financial storytelling'],
            motivations: ['A clean audit report', 'Seeing forecasts match actuals within tolerance', 'Earning leadership trust'],
            pain_points: ['Last-minute budget changes', 'Decentralised financial data sources', 'Delayed stakeholder inputs'],
            uiPainPoints: ['Dashboards without drill-down', 'Interfaces that don\'t export to XLS cleanly', 'Multi-factor hurdles that slow approvals'],
            frustrations: ['Shadow spreadsheets', 'Spending without approvals', 'Payments stuck in workflow limbo'],
            habits: ['Closes books early each month', 'Holds weekly knowledge sessions with team', 'Reviews personal investment plan quarterly'],
            dailyRoutine: [
                '6:00 AM – Morning walk while listening to finance podcasts',
                '9:00 AM – Review cash flow and pending approvals',
                '1:00 PM – Cross-functional review meetings',
                '3:30 PM – Forecasting or scenario modelling',
                '8:00 PM – Family dinner followed by 20-minute reading'
            ],
            decisionStyle: 'Prudent and scenario-based',
            decisionInfluences: ['Cash flow projections', 'Regulatory updates', 'Economic indicators'],
            devices: ['ThinkPad', 'Dual-monitor setup', 'Android phone with finance apps'],
            apps: ['Tally', 'Zoho Books', 'Excel', 'INDmoney', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['Credit cards for all expenses tracked via Cred', 'Systematic Investment Plans through Kuvera', 'Backup emergency fund in liquid funds'],
                budgeting: 'Maintains zero-based budget for home expenses',
                banks: ['HDFC Bank', 'Axis Bank priority banking']
            },
            triggers: ['Surprise compliance issues', 'Unreconciled accounts', 'Stakeholders not respecting financial guardrails'],
            responses: ['Escalates with documented evidence', 'Creates action trackers', 'Offers training to prevent repeats'],
            social: {
                family: 'Joint family setup; ensures parents\' finances are managed smoothly',
                friends: 'MBA cohort, finance peer networks',
                community_values: ['Financial literacy', 'Helping relatives plan for future', 'Supporting local charities']
            },
            lifeEvents: [
                { event: 'Cleared Chartered Accountancy', year: '2010', impact: 'Opened doors to corporate finance' },
                { event: 'Led cost-optimisation during downturn', year: '2016', impact: 'Built reputation as dependable leader' },
                { event: 'Purchased first home', year: '2021', impact: 'Strengthened commitment to prudent planning' }
            ],
            voiceStyle: 'Measured, confident, emphasises clarity',
            fillerWords: ['frankly', 'to be precise', 'let\'s quantify'],
            key_phrases: ['Show me the underlying assumptions', 'Let\'s stress-test this plan', 'Compliance first, always'],
            insights: [
                'Spots risks before others do',
                'Prefers automation but needs audit trails',
                'Sees finance as business partnership, not policing'
            ]
        },
        business_owner: {
            label: 'Small Business Owner',
            background: {
                career: '{pronounSubject} grew a small family business into a steady enterprise, learning digital tools along the way without losing personal relationships.',
                approach: '{pronounSubject} blends street-smart instincts with a growing appetite for technology when it clearly shows returns.'
            },
            traits: ['Relationship-driven', 'Pragmatic', 'Resilient', 'Protective of family', 'Hard-working'],
            values: ['Trust', 'Consistency', 'Family name', 'Community reputation'],
            hobbies: ['Early morning temple visits', 'Cricket with children', 'Evening chai with regular customers', 'Participating in community events'],
            primaryGoals: ['Keep cash flow predictable', 'Educate children abroad or at top colleges', 'Expand business without over-leveraging'],
            secondaryGoals: ['Digitise inventory and billing', 'Adopt GST-compliant tools', 'Diversify income sources'],
            motivations: ['Hearing loyal customers praise the business', 'Securing future for family', 'Being respected in the community'],
            pain_points: ['Complicated digital onboarding', 'Hidden charges and penalties', 'English-only interfaces'],
            uiPainPoints: ['App versions changing layouts', 'Too many permissions requested', 'Support only via chatbots'],
            frustrations: ['When tech support doesn\'t pick calls', 'Chasing payments from marketplaces', 'Government filings without clear guidance'],
            habits: ['Starts day with accounting book review', 'Keeps duplicate physical records', 'Calls banker fortnightly to stay updated'],
            dailyRoutine: [
                '5:00 AM – Morning prayers and household planning',
                '7:00 AM – Shop or office opens, supervises staff setup',
                '1:00 PM – Lunch with family or at shop counter',
                '4:00 PM – Vendor coordination and customer relationships',
                '9:00 PM – Closes accounts, reviews invoices with spouse'
            ],
            decisionStyle: 'Trust-led but increasingly data-aware',
            decisionInfluences: ['Advice from family and community elders', 'Past business experiences', 'Recommendations from bankers'],
            devices: ['Android mid-range phone', 'Desktop with accounting software', 'Printer-cum-scanner'],
            apps: ['Khatabook', 'Tally', 'WhatsApp Business', 'PhonePe', 'SBI YONO'],
            fintechPreferences: {
                payment_stack: ['Accepts UPI and cards via QR', 'Uses current account for payouts', 'Keeps gold and fixed deposits as backup'],
                budgeting: 'Monthly ledger maintained manually plus digital record',
                banks: ['State Bank of India', 'Bank of Baroda']
            },
            triggers: ['Technology that breaks during peak hours', 'Policies changing without notice', 'Delayed settlements'],
            responses: ['Calls trusted banker or nephew who understands tech', 'Reverts to manual log temporarily', 'Questions charges until clarified'],
            social: {
                family: 'Joint household, elder parents help with shop decisions',
                friends: 'Local business association, suppliers, loyal customers',
                community_values: ['Honour commitments', 'Support neighbours in need', 'Sponsor local festivals']
            },
            lifeEvents: [
                { event: 'Took over family shop from father', year: '2005', impact: 'Modernised operations while keeping relationships' },
                { event: 'Went digital during demonetisation', year: '2016', impact: 'Adopted UPI and POS machines', },
                { event: 'Navigated business through pandemic', year: '2020', impact: 'Added home delivery and online catalogue' }
            ],
            voiceStyle: 'Warm, conversational, switches between English and local language',
            fillerWords: ['dekhiye', 'batao', 'samjha do'],
            key_phrases: ['Is my paisa safe?', 'How soon will settlement happen?', 'Simple rakh na'],
            insights: [
                'Prefers human assurance in every new tool',
                'Will pay for reliability and transparent fees',
                'Needs language flexibility and family logins'
            ]
        },
        research: {
            label: 'Research Director',
            background: {
                career: '{pronounSubject} spent over a decade leading research programmes, threading academic rigour with market realities.',
                approach: '{pronounSubject} is relentless about evidence, triangulation, and making insights impossible to ignore.'
            },
            traits: ['Analytical', 'Patient', 'Mentor', 'Curious', 'Detail-first'],
            values: ['Intellectual honesty', 'Methodical planning', 'Knowledge sharing'],
            hobbies: ['Reading whitepapers', 'Classical music concerts', 'Chess evenings', 'Weekend heritage walks'],
            primaryGoals: ['Publish insights that guide strategic bets', 'Build a research team with strong ethics', 'Bridge qualitative and quantitative findings'],
            secondaryGoals: ['Adopt mixed-method frameworks', 'Create a central insight repository', 'Grow partnerships with academic bodies'],
            motivations: ['Seeing strategy documents cite research verbatim', 'Teams inviting research early', 'Young researchers flourishing'],
            pain_points: ['Projects launched without discovery', 'Budgets cut mid-study', 'Fragmented research tools'],
            uiPainPoints: ['Platforms that don\'t handle multilingual transcripts', 'Poor tagging and search', 'Hard-to-export data visualisations'],
            frustrations: ['Insights ignored due to gut decisions', 'Rushed timelines for complex studies', 'Recruitment constraints'],
            habits: ['Keeps meticulous research logs', 'Runs weekly learning circles', 'Reviews methodology twice before kickoff'],
            dailyRoutine: [
                '6:00 AM – Meditation and newspaper skim for macro trends',
                '9:00 AM – Team stand-up and research brief reviews',
                '12:00 PM – Stakeholder alignment sessions',
                '3:00 PM – Deep work on analysis or report writing',
                '8:00 PM – Classical music or long-form reading'
            ],
            decisionStyle: 'Evidence-first with collaborative validation',
            decisionInfluences: ['Longitudinal studies', 'Macro-economic reports', 'Frontline interviews'],
            devices: ['ThinkPad', 'Tablet with stylus for note-taking', 'Noise-cancelling headset'],
            apps: ['Dovetail', 'Atlas.ti', 'Google Scholar', 'Slack', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['Uses UPI for personal finance', 'Keeps investments diversified across mutual funds and bonds', 'Maintains a detailed household expense ledger'],
                budgeting: 'Quarterly check-ins with spouse; emphasises emergency funds',
                banks: ['HDFC Bank', 'IDFC First Bank']
            },
            triggers: ['Low-quality data collection', 'Cherry-picked insights', 'Misinterpreting research scope'],
            responses: ['Escalates with structured reasoning', 'Runs corrective training', 'Documents limitations clearly'],
            social: {
                family: 'Married, no kids; supports extended family education',
                friends: 'Academics, policy researchers, book club members',
                community_values: ['Evidence over hearsay', 'Respect for cultural nuance', 'Continuous learning']
            },
            lifeEvents: [
                { event: 'Published first major industry whitepaper', year: '2014', impact: 'Established credibility across the ecosystem' },
                { event: 'Built in-house research lab', year: '2018', impact: 'Scaled research impact across business units' },
                { event: 'Guest lectured at IIMs and NIDs', year: '2021', impact: 'Inspired next generation of researchers' }
            ],
            voiceStyle: 'Measured, deliberate, articulate with academic clarity',
            fillerWords: ['fundamentally', 'interestingly', 'if you observe'],
            key_phrases: ['Let\'s look at the evidence base', 'What patterns are emerging?', 'We need to contextualise this'],
            insights: [
                'Believes research is useless unless socialised properly',
                'Demands methodological discipline',
                'Values diverse perspectives in synthesis rooms'
            ]
        },
        government: {
            label: 'Government Programme Officer',
            background: {
                career: '{pronounSubject} cleared the civil services a decade ago and has since rotated through pivotal departments, learning how policy meets the ground.',
                approach: '{pronounSubject} balances protocol with empathy for citizens, striving to modernise systems without losing accountability.'
            },
            traits: ['Duty-bound', 'Patient', 'System thinker', 'Diplomatic', 'Grounded'],
            values: ['Public service', 'Integrity', 'Community welfare', 'Orderliness'],
            hobbies: ['Reading newspapers cover to cover', 'Morning walks in parks', 'Hosting community grievance camps', 'Listening to old Hindi songs'],
            primaryGoals: ['Ensure schemes reach the last mile', 'Digitise citizen touchpoints responsibly', 'Maintain transparency and compliance'],
            secondaryGoals: ['Train staff on new processes', 'Strengthen grievance redressal', 'Collaborate with NGOs for outreach'],
            motivations: ['Citizens receiving timely benefits', 'Positive audit remarks', 'Seeing infrastructure improve'],
            pain_points: ['Legacy paperwork', 'Insufficient staff training on digital tools', 'Policy changes without resources'],
            uiPainPoints: ['Government portals that freeze mid-entry', 'Forms not available in local languages', 'No offline support synced with digital submissions'],
            frustrations: ['Duplicated data entry', 'Escalations due to misinformation', 'Political interference'],
            habits: ['Visits field offices weekly', 'Maintains handwritten logbook plus digital tracker', 'Makes evening calls to review pending files'],
            dailyRoutine: [
                '5:30 AM – Morning walk and community newspaper review',
                '9:00 AM – Department briefings and file disposal',
                '1:00 PM – Public hearing or video conferences with districts',
                '4:00 PM – Field inspections or review meetings',
                '8:30 PM – Family dinner, quick review of next day\'s agenda'
            ],
            decisionStyle: 'Procedural but pragmatic within rules',
            decisionInfluences: ['Policy guidelines', 'District reports', 'Citizen feedback'],
            devices: ['Secure government laptop', 'Official smartphone', 'Paper diary for key notes'],
            apps: ['DigiLocker', 'BHIM', 'NIC portals', 'WhatsApp (official groups)', 'PhonePe (personal)'],
            fintechPreferences: {
                payment_stack: ['UPI for personal transactions', 'Prefers nationalised banks for investments', 'Invests in PPF and government bonds'],
                budgeting: 'Tracks expenses meticulously, supports parents and in-laws',
                banks: ['Punjab National Bank', 'State Bank of India']
            },
            triggers: ['Incomplete documentation from citizens', 'Systems downtime during peak public interactions', 'Media escalations without full facts'],
            responses: ['Sets up special grievance counters', 'Coordinates with IT cell for quick fixes', 'Releases clarifications through official channels'],
            social: {
                family: 'Joint family commitments, children in school; values evening family prayer',
                friends: 'Batchmates from administration training, local community leaders',
                community_values: ['Service before self', 'Maintaining dignity in interactions', 'Respecting protocols']
            },
            lifeEvents: [
                { event: 'Cleared UPSC and joined IAS', year: '2010', impact: 'Committed life to public service' },
                { event: 'Led flood relief operations', year: '2015', impact: 'Learnt crisis co-ordination at scale' },
                { event: 'Digitised district welfare disbursements', year: '2019', impact: 'Improved transparency and reduced leakages' }
            ],
            voiceStyle: 'Formal yet reassuring, switches to local language to connect with citizens',
            fillerWords: ['dekhiye', 'please understand', 'hum log'],
            key_phrases: ['Procedure follow karna hoga', 'Public interest is priority', 'Main khud dekh lunga'],
            insights: [
                'Needs citizen-facing tools to be bilingual and resilient',
                'Highly conscious of compliance requirements',
                'Values public trust over short-lived metrics'
            ]
        },
        sales: {
            label: 'Enterprise Sales Lead',
            background: {
                career: '{pronounSubject} built a reputation in enterprise sales by listening deeply and crafting solutions that feel bespoke.',
                approach: '{pronounSubject} thrives on relationships, long lunches, and creative deal-making that keeps clients close.'
            },
            traits: ['Persuasive', 'Relationship-focused', 'Energetic', 'Resourceful', 'Optimistic'],
            values: ['Honesty in negotiation', 'Quick follow-ups', 'Delivering on promises', 'Long-term partnerships'],
            hobbies: ['Golf or cricket with clients', 'Networking dinners', 'Weekend road trips', 'Keeping tabs on industry news'],
            primaryGoals: ['Close strategic deals with healthy margins', 'Retain key accounts through trust', 'Build a high-performing sales pod'],
            secondaryGoals: ['Create playbooks for account executives', 'Enable smoother contracting with legal', 'Stay ahead on industry trends'],
            motivations: ['Hearing clients refer new business', 'Beating targets', 'Recognition in sales clubs'],
            pain_points: ['Slow internal approvals', 'Rigid pricing structures', 'CRM data not matching reality'],
            uiPainPoints: ['Mobile CRM without offline access', 'Dashboards that don\'t highlight at-risk deals', 'Confusing contract workflows'],
            frustrations: ['Losing deals due to process delays', 'Lack of marketing collateral', 'Product roadmap surprises'],
            habits: ['Starts day reviewing pipeline health', 'Blocks time for personalised outreach', 'Logs every conversation meticulously'],
            dailyRoutine: [
                '7:00 AM – Workout followed by pipeline review over coffee',
                '10:00 AM – Client meetings and demos',
                '1:00 PM – Lunch with prospects or key accounts',
                '3:00 PM – Internal syncs with product and marketing',
                '9:00 PM – Responds to global clients and plans next day'
            ],
            decisionStyle: 'Relationship first, backed by commercial sense',
            decisionInfluences: ['Client sentiment', 'Competitive intelligence', 'Quarterly targets'],
            devices: ['High-end smartphone', 'Lightweight laptop', 'Smartwatch'],
            apps: ['Salesforce', 'LinkedIn Sales Navigator', 'WhatsApp Business', 'Calendar apps', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['Corporate cards for travel, tracked via Happay', 'Invests bonuses in mutual funds through Groww', 'Keeps emergency fund liquid'],
                budgeting: 'Uses annual bonus to fund family travel and real estate plans',
                banks: ['HDFC Bank Imperia', 'IDFC First for high-interest savings']
            },
            triggers: ['Internal delays risking client trust', 'Sudden pricing changes', 'Lack of visibility into customer health'],
            responses: ['Escalates constructively with leadership', 'Finds workaround to keep client momentum', 'Offers candid feedback to product teams'],
            social: {
                family: 'Married with young kids; ensures they experience weekend getaways',
                friends: 'Industry peers, MBA classmates, local entrepreneurs',
                community_values: ['Helping others close deals', 'Maintaining reputation', 'Celebrating wins together']
            },
            lifeEvents: [
                { event: 'Closed first million-dollar deal', year: '2017', impact: 'Boosted confidence and credibility' },
                { event: 'Set up inside sales academy', year: '2019', impact: 'Scaled mentorship and coaching impact' },
                { event: 'Weathered pandemic quarters', year: '2020', impact: 'Shifted to digital-first relationship building' }
            ],
            voiceStyle: 'Upbeat, persuasive, keeps energy high even in long calls',
            fillerWords: ['look', 'trust me', 'honestly'],
            key_phrases: ['What would make this a no-brainer?', 'Let me get this done for you', 'We\'re in this together'],
            insights: [
                'Will go the extra mile for quick answers',
                'Needs visibility into customer success signals',
                'Balances ambition with genuine care for clients'
            ]
        },
        student: {
            label: 'Postgraduate Student',
            background: {
                career: '{pronounSubject} is juggling studies, internships, and future planning, making every rupee stretch smartly.',
                approach: '{pronounSubject} is tech-comfortable but still figuring out complex finance jargon and long-term decisions.'
            },
            traits: ['Curious', 'Budget-conscious', 'Aspirational', 'Collaborative', 'Adaptive'],
            values: ['Career growth', 'Experiential learning', 'Financial independence', 'Friendship'],
            hobbies: ['Campus clubs', 'Content creation', 'Part-time gigs', 'Group study sessions'],
            primaryGoals: ['Secure a meaningful internship or job offer', 'Build a professional network', 'Manage finances independently'],
            secondaryGoals: ['Upgrade laptop or devices', 'Travel with friends post-semester', 'Build credit score responsibly'],
            motivations: ['Recognition from professors and peers', 'Landing dream roles', 'Being financially confident'],
            pain_points: ['Loan paperwork and guarantor requirements', 'Hidden fees in student accounts', 'Confusing investment jargon'],
            uiPainPoints: ['Apps not optimised for prepaid cards', 'Too many steps in KYC', 'Inaccessible customer support'],
            frustrations: ['Budgeting slips due to hostel expenses', 'Limited personalised advice', 'Overloaded academic schedules'],
            habits: ['Tracks expenses in shared spreadsheets', 'Consumes career podcasts while commuting', 'Takes freelance gigs for extra cash'],
            dailyRoutine: [
                '7:30 AM – Quick breakfast and lecture prep',
                '10:00 AM – Classes or project work',
                '3:00 PM – Internship tasks or club meetings',
                '7:00 PM – Gym or sports with friends',
                '11:00 PM – Group study calls or content creation'
            ],
            decisionStyle: 'Peer-influenced yet research-driven',
            decisionInfluences: ['Seniors and alumni', 'YouTube reviews', 'LinkedIn mentors'],
            devices: ['Mid-range laptop', 'Android phone', 'Wireless earbuds'],
            apps: ['Notion', 'Google Drive', 'LinkedIn', 'Splitwise', 'PhonePe'],
            fintechPreferences: {
                payment_stack: ['UPI for everyday spends', 'Wants student-friendly credit card', 'Saves in digital gold or small SIPs'],
                budgeting: 'Uses monthly envelope budgeting, splits rent via UPI',
                banks: ['Student account with HDFC or Axis', 'MobiKwik ZIP for short-term credit']
            },
            triggers: ['Unexpected charges', 'Slow app performance during payments', 'No real human support'],
            responses: ['Crowdsources answers on Reddit or Discord', 'Switches apps quickly', 'Educates peers once confident'],
            social: {
                family: 'Parents back home, calls them nightly for updates',
                friends: 'Roommates, project teammates, online communities',
                community_values: ['Sharing notes', 'Celebrating small wins', 'Lifting each other during placements']
            },
            lifeEvents: [
                { event: 'Moved to metro for studies', year: '2022', impact: 'Learnt to manage expenses independently' },
                { event: 'Landed first stipend internship', year: '2023', impact: 'Boosted confidence in career path' },
                { event: 'Cleared key certification', year: '2024', impact: 'Improved employability and self-belief' }
            ],
            voiceStyle: 'Energetic, bilingual, peppered with campus slang',
            fillerWords: ['yaar', 'literally', 'like'],
            key_phrases: ['Bro, is this worth it?', 'Can you break it down?', 'I just need something simple'],
            insights: [
                'Will evangelise products that respect budget realities',
                'Learns fastest via community-driven content',
                'Seeks career tie-ins in every financial decision'
            ]
        },
        default: {
            label: 'Urban Professional',
            background: {
                career: '{pronounSubject} has carved out a stable career in {company} while staying rooted in {location}\'s buzzing energy.',
                approach: '{pronounSubject} mixes pragmatism with empathy, balancing deadlines with caring for family and community.'
            },
            traits: ['Responsible', 'Pragmatic', 'Community-oriented', 'Adaptive'],
            values: ['Family stability', 'Steady progress', 'Mutual respect', 'Financial prudence'],
            hobbies: ['Evening walks', 'Regional cinema', 'Weekend family outings', 'Discovering new food spots'],
            primaryGoals: ['Provide stability for family', 'Grow in career without burning out', 'Plan for future milestones'],
            secondaryGoals: ['Invest in home improvements', 'Support parents financially', 'Take meaningful vacations'],
            motivations: ['Being dependable to loved ones', 'Healthy bank balance', 'Appreciation from peers'],
            pain_points: ['Complicated paperwork', 'Hidden charges and penalties', 'Time wasted on fragmented systems'],
            uiPainPoints: ['Overloaded dashboards', 'No multi-language support', 'Inflexible customer care timings'],
            frustrations: ['Unpredictable bills', 'Opaque financial terms', 'Apps that don\'t sync across devices'],
            habits: ['Reviews expenses every Sunday', 'Keeps emergency funds ready', 'Shares learnings with family WhatsApp groups'],
            dailyRoutine: [
                '6:30 AM – Morning stretch and quick news scroll',
                '9:00 AM – Work blocks and catch-ups',
                '1:00 PM – Lunch with colleagues or at home',
                '6:30 PM – Family errands and quality time',
                '10:30 PM – Planning next day with quiet tea'
            ],
            decisionStyle: 'Practical and consensus-driven',
            decisionInfluences: ['Family input', 'Trusted friends', 'Financial advisors'],
            devices: ['Android smartphone', 'Lightweight laptop', 'Smartwatch for health tracking'],
            apps: ['WhatsApp', 'Google Pay', 'YouTube', 'Evernote'],
            fintechPreferences: {
                payment_stack: ['UPI for day-to-day spends', 'Recurring deposits for discipline', 'Gold SIPs or mutual funds for growth'],
                budgeting: 'Uses spreadsheet shared with spouse, reconciles mid-month',
                banks: ['SBI for legacy trust', 'ICICI for digital convenience']
            },
            triggers: ['Chaotic customer support', 'Processes that waste time', 'Feels taken advantage of'],
            responses: ['Documents everything', 'Escalates firmly', 'Shares feedback publicly if ignored'],
            social: {
                family: 'Balances nuclear responsibilities with support for parents/in-laws',
                friends: 'School friends, office colleagues, neighbours',
                community_values: ['Show up for celebrations', 'Offer help during emergencies', 'Respect different viewpoints']
            },
            lifeEvents: [
                { event: 'Moved to city for first job', year: '2012', impact: 'Learnt financial independence' },
                { event: 'Supported parents through health scare', year: '2017', impact: 'Became vigilant about insurance and savings' },
                { event: 'Invested in first mutual fund SIP', year: '2019', impact: 'Kickstarted long-term wealth planning' }
            ],
            voiceStyle: 'Straightforward, polite, slips in local language phrases',
            fillerWords: ['actually', 'basically', 'you know'],
            key_phrases: ['Please keep it transparent', 'I\'d rather plan ahead', 'How does this help my family?'],
            insights: [
                'Trust builds slowly and can be lost instantly',
                'Needs clarity more than fancy features',
                'Balances ambition with grounded expectations'
            ]
        }
    };

    /**
     * Keyword buckets to detect role categories
     */
    static ROLE_KEYWORDS = {
        engineering: ['engineer', 'developer', 'architect', 'engineering', 'tech', 'data', 'analyst'],
        product: ['product', 'pm', 'roadmap', 'program manager'],
        design: ['design', 'ux', 'ui', 'researcher', 'designer'],
        marketing: ['marketing', 'brand', 'growth', 'communications', 'content'],
        sales: ['sales', 'business development', 'partnerships', 'account manager'],
        operations: ['operations', 'supply', 'logistics', 'delivery', 'plant manager'],
        finance: ['finance', 'financial', 'bank', 'accountant', 'credit', 'risk'],
        business_owner: ['owner', 'founder', 'entrepreneur', 'shop', 'director', 'proprietor'],
        research: ['research', 'insights', 'analyst', 'scientist'],
        government: ['government', 'officer', 'civil', 'bureaucrat', 'public service'],
        student: ['student', 'graduate', 'intern', 'trainee'],
        default: []
    };

    /**
     * Determine region from location
     */
    static getRegion(location) {
        if (!location) return 'north';
        const loc = location.toLowerCase();
        if (loc.includes('tamil') || loc.includes('chennai') || loc.includes('madurai') || loc.includes('coimbatore')) return 'tamil';
        if (loc.includes('delhi') || loc.includes('punjab') || loc.includes('haryana') || loc.includes('rajasthan') || loc.includes('uttar pradesh')) return 'north';
        if (loc.includes('bangalore') || loc.includes('karnataka') || loc.includes('kerala') || loc.includes('andhra') || loc.includes('telangana') || loc.includes('hyderabad')) return 'south';
        if (loc.includes('mumbai') || loc.includes('maharashtra') || loc.includes('gujarat') || loc.includes('goa') || loc.includes('pune')) return 'west';
        if (loc.includes('kolkata') || loc.includes('west bengal') || loc.includes('odisha') || loc.includes('bihar')) return 'east';
        return 'north';
    }

    /**
     * Determine role category from occupation/role strings
     */
    static detectRoleCategory(role = '') {
        const normalized = (role || '').toLowerCase();
        if (!normalized.trim()) return 'default';
        for (const [category, keywords] of Object.entries(this.ROLE_KEYWORDS)) {
            if (keywords.some(keyword => normalized.includes(keyword))) {
                return category;
            }
        }
        return 'default';
    }

    /**
     * Ensure value is returned as a flat array of strings
     */
    static ensureArray(value, fallback = []) {
        if (!value && fallback) return [...fallback];
        if (Array.isArray(value)) {
            return value.filter(Boolean).map(item => `${item}`.trim()).filter(Boolean);
        }
        if (typeof value === 'string' && value.trim()) {
            return [value.trim()];
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value)
                .flat()
                .map(item => (Array.isArray(item) ? item : [item]))
                .flat()
                .filter(Boolean)
                .map(item => `${item}`.trim())
                .filter(Boolean);
        }
        return fallback ? [...fallback] : [];
    }

    /**
     * Deduplicate while preserving order
     */
    static dedupeArray(items = []) {
        const seen = new Set();
        const result = [];
        items.forEach(item => {
            if (!item) return;
            const trimmed = `${item}`.trim();
            if (!trimmed) return;
            const lower = trimmed.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                result.push(trimmed);
            }
        });
        return result;
    }

    /**
     * Resolve pronouns based on gender; defaults to they/them
     */
    static getPronouns(gender) {
        const g = (gender || '').toLowerCase();
        if (g.startsWith('f')) {
            return {
                subject: 'She',
                object: 'her',
                possessiveAdjective: 'her',
                possessive: 'hers',
                reflexive: 'herself',
                subjectLower: 'she',
                pronounLower: 'she'
            };
        }
        if (g.startsWith('m')) {
            return {
                subject: 'He',
                object: 'him',
                possessiveAdjective: 'his',
                possessive: 'his',
                reflexive: 'himself',
                subjectLower: 'he',
                pronounLower: 'he'
            };
        }
        return {
            subject: 'They',
            object: 'them',
            possessiveAdjective: 'their',
            possessive: 'theirs',
            reflexive: 'themselves',
            subjectLower: 'they',
            pronounLower: 'they'
        };
    }

    /**
     * Replace placeholders in template strings
     */
    static interpolate(template, context) {
        if (!template) return '';
        return template.replace(/\{(\w+)\}/g, (_, key) => context[key] ?? '');
    }

    /**
     * Build fallback background narrative
     */
    static generateFallbackBackground({ name, age, role, company, location, pronouns, roleTemplate, regionTemplate }) {
        const safeName = name || 'This persona';
        const safeAge = age ? `${age}-year-old ` : '';
        const readableRole = roleTemplate?.label || role || 'professional';
        const safeLocation = location || 'India';
        const safeCompany = company || 'their organisation';
        const context = {
            name: safeName,
            age: age || '',
            role: readableRole,
            company: safeCompany,
            location: safeLocation,
            pronounSubject: pronouns.subject,
            pronounLower: pronouns.pronounLower,
            pronounPossessive: pronouns.possessive,
            pronounAdjective: pronouns.possessiveAdjective
        };

        const sentences = [];
        sentences.push(`${safeName} is a ${safeAge}${readableRole.toLowerCase()} based in ${safeLocation}.`);

        if (roleTemplate?.background?.career) {
            sentences.push(this.interpolate(roleTemplate.background.career, context));
        }
        if (roleTemplate?.background?.approach) {
            sentences.push(this.interpolate(roleTemplate.background.approach, context));
        }
        if (regionTemplate?.cultureNote) {
            sentences.push(this.interpolate(regionTemplate.cultureNote, context));
        }

        return sentences.join(' ');
    }

    /**
     * Extract trait adjectives and archetypes from persona
     */
    static extractTraits(persona) {
        if (!persona) return [];
        if (Array.isArray(persona.personality_traits) && persona.personality_traits.length > 0) {
            return persona.personality_traits;
        }
        if (Array.isArray(persona.personality_profile) && persona.personality_profile.length > 0) {
            return persona.personality_profile;
        }
        if (Array.isArray(persona.personality)) {
            return persona.personality;
        }
        if (persona.traits) {
            const traitObj = persona.traits;
            const collected = [];
            if (Array.isArray(traitObj.adjectives)) collected.push(...traitObj.adjectives);
            if (Array.isArray(traitObj.personality)) collected.push(...traitObj.personality);
            if (Array.isArray(traitObj.attributes)) collected.push(...traitObj.attributes);
            if (typeof traitObj.personality_archetype === 'string') collected.push(traitObj.personality_archetype);
            if (Array.isArray(traitObj.core_values)) collected.push(...traitObj.core_values);
            return collected;
        }
        return [];
    }

    /**
     * Extract values from persona
     */
    static extractValues(persona) {
        if (!persona) return [];
        const buckets = [];
        if (persona.personality?.values) buckets.push(...this.ensureArray(persona.personality.values));
        if (persona.traits?.values) buckets.push(...this.ensureArray(persona.traits.values));
        if (persona.values) buckets.push(...this.ensureArray(persona.values));
        return buckets;
    }

    /**
     * Merge multiple array-like inputs into a deduped list
     */
    static combineLists(...lists) {
        const merged = [];
        lists.forEach(list => {
            merged.push(...this.ensureArray(list));
        });
        return this.dedupeArray(merged);
    }

    /**
     * Build fallback life events if none exist
     */
    static buildLifeEvents(existingEvents, roleTemplate, regionTemplate, pronouns) {
        if (Array.isArray(existingEvents) && existingEvents.length > 0) {
            return existingEvents.map(event => ({
                event: event.event || event.title || `${event}`,
                year: event.year || event.date || '',
                impact: event.impact || event.description || ''
            }));
        }
        const templateEvents = roleTemplate?.lifeEvents || [];
        if (templateEvents.length === 0) {
            return [
                { event: 'Early career milestone', year: '2015', impact: 'Gained confidence in chosen field' },
                { event: 'Major family responsibility', year: '2018', impact: 'Strengthened financial discipline' },
                { event: 'Recent professional achievement', year: '2022', impact: 'Opened up new growth opportunities' }
            ];
        }
        const context = {
            pronounSubject: pronouns.subject,
            pronounLower: pronouns.pronounLower,
            pronounPossessive: pronouns.possessive,
            pronounAdjective: pronouns.possessiveAdjective
        };
        return templateEvents.map(evt => ({
            event: this.interpolate(evt.event, context),
            year: evt.year || '',
            impact: this.interpolate(evt.impact, context)
        }));
    }

    /**
     * Build fallback emotional profile extended
     */
    static buildEmotionalProfileExtended(emotionalProfile, roleTemplate) {
        const triggers = this.combineLists(
            emotionalProfile?.triggers,
            roleTemplate?.triggers
        );
        const responses = this.combineLists(
            emotionalProfile?.responses,
            roleTemplate?.responses
        );
        return {
            triggers,
            responses
        };
    }

    /**
     * Extract hobbies from persona and fallbacks
     */
    static extractHobbies(persona) {
        const collected = [];
        if (persona.hobbies) collected.push(...this.ensureArray(persona.hobbies));
        if (persona.behaviors?.hobbies) collected.push(...this.ensureArray(persona.behaviors.hobbies));
        if (persona.behaviors?.interests) collected.push(...this.ensureArray(persona.behaviors.interests));
        if (persona.interests) collected.push(...this.ensureArray(persona.interests));
        return collected;
    }

    /**
     * Build comprehensive master system prompt for persona
     */
    static buildMasterPrompt(persona) {
        const quotes = (persona.speech_patterns?.common_phrases ?? [])
            .slice(0, 5)
            .map((ph, i) => `${i + 1}. "${ph}"`)
            .join('\n');

        const verbatim = persona.quote ? `Example: "${persona.quote}"\n` : '';

        const objectives = persona.objectives?.join('; ') || 'N/A';
        const needs = persona.needs?.join('; ') || 'N/A';
        const fears = [...(persona.fears || []), ...(persona.apprehensions || [])].join('; ') || 'N/A';

        const fillerWords = (persona.speech_patterns?.filler_words || persona.speech_patterns?.fillers || []).join(', ') || 'none';
        const avoidedWords = (persona.vocabulary_profile?.avoided_words || []).slice(0, 10).join(', ') || 'none';

        const frustrationTriggers = (persona.emotional_profile?.frustration_triggers || persona.emotional_profile?.triggers || []).join(', ') || 'none';
        const excitementTriggers = (persona.emotional_profile?.excitement_triggers || []).join(', ') || 'none';

        const confidentTopics = (persona.knowledge_bounds?.confident || []).join(', ') || 'none';
        const partialTopics = (persona.knowledge_bounds?.partial || []).join(', ') || 'none';
        const unknownTopics = (persona.knowledge_bounds?.unknown || []).join(', ') || 'none';

        // Extract speech patterns and native phrases
        const nativeLanguage = persona.cultural_background?.primary_language || persona.native_language || 'Hindi';
        const nativePhrases = persona.speech_patterns?.native_phrases || [];
        const englishLevel = persona.speech_patterns?.english_level || persona.english_savvy || 'Medium';
        const speechStyle = persona.speech_patterns?.style || '';
        
        // Determine region and get local words
        const region = this.getRegion(persona.location);
        const regionalProfile = this.REGIONAL_PROFILES[region] || this.REGIONAL_PROFILES.default;
        
        // Normalize English level to new scale (Beginner to Expert)
        const normalizedEnglishLevel = this.ENGLISH_LEVEL_MAP[englishLevel] || englishLevel || 'Intermediate';
        
        // Determine mixing intensity based on English level (Beginner to Expert scale)
        let mixingInstructions = '';
        const englishLower = normalizedEnglishLevel.toLowerCase();
        if (englishLower === 'beginner') {
            mixingInstructions = `VERY HEAVY MIXING (4-5 native words per sentence) - You struggle with English and prefer ${nativeLanguage}. Use native language primarily.`;
        } else if (englishLower === 'elementary') {
            mixingInstructions = `HEAVY MIXING (3-4 native words per sentence) - You mix ${nativeLanguage} heavily with English. More comfortable in native language.`;
        } else if (englishLower === 'intermediate') {
            mixingInstructions = `MODERATE MIXING (1-2 native words per sentence) - You're comfortable with English but naturally mix ${nativeLanguage}.`;
        } else if (englishLower === 'advanced') {
            mixingInstructions = `LIGHT MIXING (occasional native words) - You're fluent in English but use ${nativeLanguage} for emphasis and emotions.`;
        } else { // Expert
            mixingInstructions = `MINIMAL MIXING (rare native words) - You're highly fluent in English. Use ${nativeLanguage} only for cultural expressions or emotions.`;
        }
        
        // Build language mixing instructions
        const yourPhrases = nativePhrases.length > 0 ? nativePhrases.slice(0, 5).join(', ') : regionalProfile.local_words.slice(0, 5).join(', ');
        
        let languageInstructions = `
LANGUAGE MIXING (MANDATORY):
- ${mixingInstructions}
- YOUR native phrases to use: ${yourPhrases}
- YOUR speech style: ${speechStyle || `${region} Indian English`}
- Example of how YOU talk: "${regionalProfile.example}"

CRITICAL RULES FOR LANGUAGE MIXING:
1. ALWAYS mix local words in your responses - this is NON-NEGOTIABLE
2. Use YOUR specific phrases: ${yourPhrases}
3. Start sentences naturally: "Yaar...", "Actually...", "Seri...", etc.
4. Sound like a REAL person from ${persona.location || region}, not a robot
5. Be conversational, use contractions (I'm, you're, don't)
6. Show YOUR personality through word choices`;

        return `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title ?? 'N/A'} at ${persona.company ?? 'N/A'} in ${persona.location ?? 'N/A'}; Age: ${persona.demographics?.age ?? 'N/A'}; Gender: ${persona.demographics?.gender ?? 'N/A'}.
- English Proficiency: ${normalizedEnglishLevel} (Beginner to Expert scale).
- Native Language: ${nativeLanguage}.

OBJECTIVES: ${objectives}.
NEEDS: ${needs}.
FEARS & APPREHENSIONS: ${fears}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style?.sentence_length || 'medium'}; Formality: ${persona.communication_style?.formality || 5}/10; Question style: ${persona.communication_style?.question_style || 'direct'}.
- Filler words: ${fillerWords}.
- Common phrases:
${quotes}
${verbatim}${languageInstructions}

VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile?.complexity || 5}/10.
- Avoid: ${avoidedWords}.

EMOTIONAL & COGNITIVE:
- Baseline mood: ${persona.emotional_profile?.baseline || 'neutral'}; Frustration triggers: ${frustrationTriggers}; Excitement triggers: ${excitementTriggers}.
- Comprehension: ${persona.cognitive_profile?.comprehension_speed || 'medium'}; Patience: ${persona.cognitive_profile?.patience || 5}/10.

KNOWLEDGE LIMITS:
- Confident: ${confidentTopics}.
- Partial: ${partialTopics}.
- Unknown: ${unknownTopics}.

CONVERSATION STYLE:
- Be natural and conversational, like talking to a friend in a user research session
- Use casual language and expressions naturally
- Show genuine interest in the topic being discussed
- Share personal experiences, opinions, and reactions honestly
- React authentically based on your background and needs
- Use "you know", "I think", "actually", "really" naturally
- Respond as if you're having a real conversation, not giving formal answers
- Be engaging and show personality

YOU ARE A REAL USER, NOT A HELPER:
⚠️  CRITICAL: You are NOT a customer service agent, chatbot, or assistant
⚠️  You are a REAL PERSON participating in user research/product feedback
⚠️  NEVER offer help, assistance, or ask "How can I help you?"
⚠️  React naturally to what's shown to you - give your honest feedback
⚠️  Ask questions only when YOU are confused or want to understand something better
⚠️  Share YOUR needs, frustrations, and expectations as a user

RULES:
    1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
    2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
    3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
    4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
    5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
    6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.
    7) FORBIDDEN PHRASES - NEVER SAY: "How can I help you?", "What can I do for you?", "How may I assist you?", "Is there anything else?", "Let me know if you need help", "I'm here to help", "How may I be of service?". You are NOT an assistant!
    8) Provide direct, honest feedback and insights. React naturally to what you see/hear.
    9) When reviewing designs or content, give YOUR honest opinion as a USER - what YOU like, what frustrates YOU, what YOU need.
    10) NEVER use customer service or AI assistant language patterns. Speak as a REAL USER with your own personality, background, needs, and frustrations.
    11) Respond naturally based on what's being discussed - don't wait for prompts or offer assistance.
    12) Be conversational and authentic - respond like a real person in a research interview, not a formal presentation or help desk.`;
    }

    /**
     * Build short persona summary for card views
     */
    static buildShortPersona(persona) {
        return this.buildShortSummary(persona);
    }

    /**
     * Build short persona summary for card views
     */
    static buildShortSummary(persona) {
        return {
            id: persona.id,
            name: persona.name,
            avatar_url: persona.avatar_url,
            role_title: persona.role_title,
            company: persona.company,
            location: persona.location,
            quote: persona.quote,
            goals_preview: (persona.objectives || []).slice(0, 3),
            challenges_preview: [...(persona.fears || []), ...(persona.apprehensions || [])].slice(0, 3),
            gauges: {
                tech: persona.tech_savviness || 'medium',
                domain: persona.domain_literacy?.level || 'medium',
                comms: persona.communication_style?.sentence_length || 'medium'
            },
            status: persona.status || 'active'
        };
    }

    /**
     * Build full persona profile for detail views
     */
    static buildFullProfile(persona) {
        return {
            id: persona.id,
            name: persona.name,
            avatar_url: persona.avatar_url,
            role_title: persona.role_title,
            company: persona.company,
            location: persona.location,
            demographics: persona.demographics || {},
            traits: persona.traits || {},
            behaviors: persona.behaviors || {},
            objectives: persona.objectives || [],
            needs: persona.needs || [],
            fears: persona.fears || [],
            apprehensions: persona.apprehensions || [],
            motivations: persona.motivations || [],
            frustrations: persona.frustrations || [],
            domain_literacy: persona.domain_literacy || { dimension: 'general', level: 'medium' },
            tech_savviness: persona.tech_savviness || 'medium',
            communication_style: persona.communication_style || {},
            speech_patterns: persona.speech_patterns || {},
            vocabulary_profile: persona.vocabulary_profile || {},
            emotional_profile: persona.emotional_profile || {},
            cognitive_profile: persona.cognitive_profile || {},
            knowledge_bounds: persona.knowledge_bounds || {},
            quote: persona.quote,
            master_system_prompt: persona.master_system_prompt,
            status: persona.status || 'active'
        };
    }

    /**
     * Build detailed UXPressia-style persona profile
     */
    static buildDetailedPersona(persona) {
        const demographics = persona.demographics || {};
        const age = demographics.age ?? persona.age ?? 30;
        const gender = demographics.gender || persona.gender || 'Unknown';
        const location = persona.location || demographics.location || 'Unknown';
        const role = persona.role_title || persona.occupation || demographics.occupation || 'Professional';
        const company = persona.company || demographics.company || 'Unknown Company';
        const behaviorsRaw = persona.behaviors || {};
        const speechPatterns = persona.speech_patterns || {};
        const communicationStyle = persona.communication_style || {};
        const fintechPrefsRaw = persona.fintech_preferences || behaviorsRaw.fintech_preferences || {};
        const emotionalProfile = persona.emotional_profile || {};
        const socialContextRaw = persona.social_context || {};
        const culturalBackgroundRaw = persona.cultural_background || {};
        const decisionMakingRaw = persona.decision_making || {};
        const knowledgeBounds = persona.knowledge_bounds || {};
        const domainLiteracy = persona.domain_literacy || {};
        const extrapolationRules = this.ensureArray(persona.extrapolation_rules || knowledgeBounds.extrapolation_rules);

        const rawObjectives = this.ensureArray(persona.objectives);
        const rawNeeds = this.ensureArray(persona.needs);
        const rawFears = this.ensureArray(persona.fears);
        const rawApprehensions = this.ensureArray(persona.apprehensions);
        const rawFrustrations = this.ensureArray(persona.frustrations);

        const rawKeyQuotes = this.ensureArray(persona.key_quotes);
        const rawLifeEvents = Array.isArray(persona.life_events)
            ? persona.life_events
            : typeof persona.life_events === 'string'
                ? (() => { try { const parsed = JSON.parse(persona.life_events); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })()
                : [];

        const regionKey = this.getRegion(location);
        const regionTemplate = this.REGION_ENRICHMENTS[regionKey] || this.REGION_ENRICHMENTS.default;
        const roleCategory = this.detectRoleCategory(role);
        const roleTemplate = this.ROLE_TEMPLATES[roleCategory] || this.ROLE_TEMPLATES.default;
        const pronouns = this.getPronouns(gender);

        const background = (persona.background || persona.background_story || demographics.background || '').trim()
            || this.generateFallbackBackground({
                name: persona.name,
                age,
                role,
                company,
                location,
                pronouns,
                roleTemplate,
                regionTemplate
            });

        const personalityTraits = this.dedupeArray([
            ...this.extractTraits(persona),
            ...(roleTemplate.traits || [])
        ]);

        const values = this.dedupeArray([
            ...this.extractValues(persona),
            ...(roleTemplate.values || []),
            ...(regionTemplate.cultural_values || [])
        ]);

        const hobbies = this.dedupeArray([
            ...this.extractHobbies(persona),
            ...(roleTemplate.hobbies || []),
            ...(regionTemplate.leisure || [])
        ]);

        const combinedObjectives = this.dedupeArray([
            ...rawObjectives,
            ...(roleTemplate.primaryGoals || [])
        ]);

        const goals = this.dedupeArray([
            ...this.ensureArray(persona.goals),
            ...combinedObjectives
        ]);

        const motivations = this.dedupeArray([
            ...this.ensureArray(persona.motivations),
            ...(roleTemplate.motivations || [])
        ]);

        const painPoints = this.dedupeArray([
            ...this.ensureArray(persona.pain_points),
            ...rawFears,
            ...(roleTemplate.pain_points || [])
        ]);

        const uiPainPoints = this.dedupeArray([
            ...this.ensureArray(persona.ui_pain_points),
            ...this.ensureArray(behaviorsRaw.ui_pain_points),
            ...(roleTemplate.uiPainPoints || [])
        ]);

        const frustrations = this.dedupeArray([
            ...rawFrustrations,
            ...(roleTemplate.frustrations || [])
        ]);

        const dailyRoutine = this.dedupeArray(
            this.ensureArray(persona.daily_routine || behaviorsRaw.daily_routine || persona.daily_life?.schedule, roleTemplate.dailyRoutine || [])
        );

        const habits = this.dedupeArray([
            ...this.ensureArray(behaviorsRaw.habits),
            ...(roleTemplate.habits || [])
        ]);

        const decisionStyle = decisionMakingRaw.style || persona.cognitive_profile?.decision_style || roleTemplate.decisionStyle || 'Pragmatic';
        const decisionInfluences = this.dedupeArray([
            ...this.ensureArray(decisionMakingRaw.influences),
            ...(roleTemplate.decisionInfluences || [])
        ]);

        const fintechPrefs = {
            payment_stack: this.combineLists(fintechPrefsRaw.payment_stack, roleTemplate.fintechPreferences?.payment_stack),
            budgeting: fintechPrefsRaw.budgeting || roleTemplate.fintechPreferences?.budgeting || 'Keeps a monthly budgeting ritual with clear guardrails.',
            banks: this.combineLists(fintechPrefsRaw.banks, roleTemplate.fintechPreferences?.banks),
            apps: this.combineLists(fintechPrefsRaw.apps, roleTemplate.fintechPreferences?.apps)
        };

        const emotionalProfileExtended = this.buildEmotionalProfileExtended(emotionalProfile, roleTemplate);

        const socialContext = {
            family: socialContextRaw.family || demographics.family_status || roleTemplate.social?.family || 'Family bonds are strong and supportive.',
            friends: socialContextRaw.friends || roleTemplate.social?.friends || 'Trusted circle of colleagues and long-time friends.',
            community_values: this.dedupeArray([
                ...this.ensureArray(socialContextRaw.community_values),
                ...(roleTemplate.social?.community_values || []),
                ...(regionTemplate.community_values || [])
            ])
        };

        const culturalBackground = {
            heritage: culturalBackgroundRaw.heritage || demographics.region || regionTemplate.heritage || location,
            beliefs: this.dedupeArray([
                ...this.ensureArray(culturalBackgroundRaw.beliefs),
                ...(regionTemplate.cultural_values || [])
            ]),
            region: culturalBackgroundRaw.region || demographics.region || location,
            language: culturalBackgroundRaw.language || regionTemplate.language || 'Hindi',
            traditions: this.dedupeArray([
                ...this.ensureArray(culturalBackgroundRaw.traditions),
                ...(regionTemplate.festivals || [])
            ]),
            values: this.dedupeArray([
                ...this.ensureArray(culturalBackgroundRaw.values),
                ...(regionTemplate.community_values || [])
            ]),
            food_culture: this.ensureArray(culturalBackgroundRaw.food_culture, regionTemplate.cuisine ? [regionTemplate.cuisine] : []),
            festivals: this.dedupeArray([
                ...this.ensureArray(culturalBackgroundRaw.festivals),
                ...(regionTemplate.festivals || [])
            ])
        };

        const lifeEvents = this.buildLifeEvents(rawLifeEvents, roleTemplate, regionTemplate, pronouns);

        const keyQuotes = this.dedupeArray([
            ...rawKeyQuotes,
            ...this.ensureArray(speechPatterns.common_phrases),
            ...(roleTemplate.key_phrases || []),
            ...(regionTemplate.key_phrases || [])
        ]);

        const voice = {
            style: communicationStyle.style || roleTemplate.voiceStyle || 'Conversational and grounded',
            speaking_style: speechPatterns.sentence_length || communicationStyle.sentence_length || communicationStyle.style || 'medium',
            tone: communicationStyle.tone || roleTemplate.voiceTone || 'professional yet warm',
            common_phrases: keyQuotes,
            filler_words: this.dedupeArray([
                ...this.ensureArray(speechPatterns.filler_words || speechPatterns.fillers),
                ...(roleTemplate.fillerWords || [])
            ]),
            vocabulary_level: persona.vocabulary_profile?.complexity || 5
        };

        const technology = {
            devices: this.dedupeArray([
                ...this.ensureArray(persona.technology?.devices),
                ...(roleTemplate.devices || []),
                ...this.generateDevices(persona)
            ]),
            platforms: this.generatePlatforms(persona),
            apps: this.dedupeArray([
                ...this.ensureArray(persona.technology?.apps),
                ...(roleTemplate.apps || []),
                ...this.generateApps(persona)
            ]),
            comfort_level: persona.tech_savviness || 'medium'
        };

        const personality = {
            traits: personalityTraits.length ? personalityTraits : (roleTemplate.traits || ['Analytical', 'Goal-oriented', 'Collaborative']),
            values: values.length ? values : this.generateValues(persona),
            attitudes: this.generateAttitudes(persona),
            emotional_profile: emotionalProfile
        };

        const goalsDetail = {
            primary: this.dedupeArray(combinedObjectives.slice(0, 3)).length ? this.dedupeArray(combinedObjectives.slice(0, 3)) : (roleTemplate.primaryGoals || []),
            secondary: this.dedupeArray(combinedObjectives.slice(3, 6)).length ? this.dedupeArray(combinedObjectives.slice(3, 6)) : (roleTemplate.secondaryGoals || []),
            motivations: motivations.length ? motivations : (roleTemplate.motivations || ['Career growth', 'Financial stability', 'Work-life balance'])
        };

        const painPointsDetail = {
            primary: rawFears.length ? rawFears.slice(0, 3) : painPoints.slice(0, 3),
            secondary: rawApprehensions.length ? rawApprehensions.slice(0, 3) : painPoints.slice(3, 6),
            frustrations: frustrations.length ? frustrations : (roleTemplate.frustrations || ['Complex processes', 'Poor user experience', 'Lack of support'])
        };

        const behaviorProfile = {
            ...behaviorsRaw,
            habits,
            communication_style: communicationStyle.formality || 'casual',
            decision_making: decisionStyle,
            tech_comfort: persona.tech_savviness || 'medium',
            learning_style: persona.cognitive_profile?.learning_preference || 'visual',
            work_style: this.generateWorkStyle(persona),
            social_preferences: this.generateSocialPreferences(persona)
        };

        const quote = persona.quote || keyQuotes[0] || this.generatePersonaQuote(persona);

        return {
            id: persona.id,
            name: persona.name,
            title: `${role} at ${company}`,
            role_title: role,
            occupation: persona.occupation || role,
            company,
            location,
            age,
            gender,
            avatar_url: persona.avatar_url,
            quote,
            demographics: {
                age,
                gender,
                location,
                occupation: role,
                company,
                education: demographics.education || persona.education || "Bachelor's Degree",
                income_range: demographics.income_range || persona.income_range || '₹5-10 Lakhs',
                family_status: demographics.family_status || socialContextRaw.family || 'Single',
                tech_savviness: persona.tech_savviness || 'Medium',
                english_proficiency: demographics.english_proficiency || communicationStyle.english_level || 'Intermediate'
            },
            background,
            background_story: persona.background_story || background,
            personality_profile: personality.traits,
            personality_traits: personality.traits,
            hobbies,
            fintech_preferences: fintechPrefs,
            pain_points: painPoints,
            ui_pain_points: uiPainPoints,
            key_quotes: keyQuotes,
            goals,
            motivations,
            extrapolation_rules: extrapolationRules,
            life_events: lifeEvents,
            objectives: rawObjectives,
            needs: rawNeeds,
            fears: rawFears,
            apprehensions: rawApprehensions,
            insights: this.dedupeArray(this.ensureArray(persona.insights, roleTemplate.insights || [
                'Balances ambition with responsibility.',
                'Looks for tools that respect time and context.',
                'Values transparency over gimmicks.'
            ])),
            english_savvy: persona.english_savvy || demographics.english_proficiency || communicationStyle.english_level || 'Intermediate',
            tech_savviness: persona.tech_savviness || 'Intermediate',
            voice_id: persona.voice_id,
            emotional_profile: emotionalProfile,
            social_context: socialContext,
            cultural_background: culturalBackground,
            daily_routine: dailyRoutine,
            decision_making: {
                style: decisionStyle,
                influences: decisionInfluences
            },
            goals_detail: goalsDetail,
            pain_points_detail: painPointsDetail,
            behaviors: behaviorProfile,
            skills: {
                technical: this.generateTechnicalSkills(persona),
                soft_skills: this.generateSoftSkills(persona),
                domain_knowledge: domainLiteracy.level || 'intermediate',
                areas_of_expertise: (knowledgeBounds.confident || []).slice(0, 5)
            },
            personality,
            technology,
            daily_life: {
                morning_routine: this.generateMorningRoutine(persona),
                work_environment: this.generateWorkEnvironment(persona),
                leisure_activities: this.generateLeisureActivities(persona),
                challenges: this.generateDailyChallenges(persona)
            },
            voice,
            knowledge_bounds: knowledgeBounds,
            domain_literacy: domainLiteracy,
            vocabulary_profile: persona.vocabulary_profile || {},
            communication_style: communicationStyle,
            speech_patterns: speechPatterns,
            emotional_profile: emotionalProfile,
            cognitive_profile: persona.cognitive_profile || {},
            frustrations,
            status: persona.status || persona.is_active || 'active',
            created_at: persona.created_at,
            last_updated: new Date().toISOString(),
            master_system_prompt: persona.master_system_prompt
        };
    }

    /**
     * Generate persona quote based on their characteristics
     */
    static generatePersonaQuote(persona) {
        const quotes = [
            "I need something that just works without me having to think about it.",
            "Time is money, and I don't have time for complicated processes.",
            "I want to make informed decisions, but I need clear information.",
            "Technology should make my life easier, not harder.",
            "I'm willing to learn, but it needs to be intuitive.",
            "I need to trust the system before I'll use it regularly.",
            "Efficiency is key - show me the fastest way to get things done.",
            "I want to feel confident when I'm using this product."
        ];
        
        // Select quote based on persona characteristics
        const index = (persona.name?.length || 0) % quotes.length;
        return quotes[index];
    }

    /**
     * Generate work style based on persona
     */
    static generateWorkStyle(persona) {
        const styles = ['Collaborative', 'Independent', 'Structured', 'Flexible', 'Detail-oriented', 'Big-picture'];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    /**
     * Generate social preferences
     */
    static generateSocialPreferences(persona) {
        return {
            communication: ['Email', 'WhatsApp', 'Phone calls'],
            collaboration: ['Team meetings', 'One-on-one', 'Online tools'],
            feedback: ['Direct', 'Constructive', 'Regular']
        };
    }

    /**
     * Generate technical skills
     */
    static generateTechnicalSkills(persona) {
        const skills = ['Basic computer skills', 'Mobile apps', 'Online banking', 'Social media', 'Email', 'Video calls'];
        return skills.slice(0, 4);
    }

    /**
     * Generate soft skills
     */
    static generateSoftSkills(persona) {
        const skills = ['Communication', 'Problem-solving', 'Time management', 'Teamwork', 'Adaptability'];
        return skills.slice(0, 3);
    }

    /**
     * Generate values
     */
    static generateValues(persona) {
        return ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'];
    }

    /**
     * Generate attitudes
     */
    static generateAttitudes(persona) {
        return {
            towards_technology: 'Cautiously optimistic',
            towards_change: 'Open but careful',
            towards_learning: 'Willing to adapt'
        };
    }

    /**
     * Generate devices
     */
    static generateDevices(persona) {
        return ['Smartphone', 'Laptop', 'Tablet'];
    }

    /**
     * Generate platforms
     */
    static generatePlatforms(persona) {
        return ['Windows', 'Android', 'iOS'];
    }

    /**
     * Generate apps
     */
    static generateApps(persona) {
        return ['WhatsApp', 'Gmail', 'Google Chrome', 'Microsoft Office'];
    }

    /**
     * Generate morning routine
     */
    static generateMorningRoutine(persona) {
        return 'Wakes up at 7 AM, checks phone, has coffee, reviews daily tasks, starts work by 9 AM';
    }

    /**
     * Generate work environment
     */
    static generateWorkEnvironment(persona) {
        return 'Office-based with some remote work flexibility, collaborative workspace';
    }

    /**
     * Generate leisure activities
     */
    static generateLeisureActivities(persona) {
        return ['Reading', 'Watching movies', 'Socializing with friends', 'Exercise', 'Cooking'];
    }

    /**
     * Generate daily challenges
     */
    static generateDailyChallenges(persona) {
        return ['Time management', 'Information overload', 'Technology complexity', 'Work-life balance'];
    }

    /**
     * Generate avatar URL based on persona demographics and traits
     */
    static generateAvatarUrl(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || 'professional';
        const location = persona.location?.toLowerCase() || '';
        const traits = persona.traits || {};
        const emotionalProfile = persona.emotional_profile || {};
        
        // Determine age group for better photo selection
        let ageGroup = 'adult';
        if (age < 25) ageGroup = 'young';
        else if (age > 50) ageGroup = 'mature';
        
        // Determine cultural background for appropriate styling
        let culturalStyle = 'professional';
        if (location.includes('india') || location.includes('delhi') || location.includes('mumbai') || 
            location.includes('bangalore') || location.includes('chennai') || location.includes('punjab') ||
            location.includes('tamil') || location.includes('gujarat') || location.includes('karnataka')) {
            culturalStyle = 'indian';
        }
        
        // Role-based styling
        const roleStyles = {
            'designer': 'creative',
            'freelance designer': 'creative',
            'developer': 'tech',
            'software engineer': 'tech',
            'manager': 'business',
            'marketing manager': 'business',
            'government officer': 'formal',
            'business owner': 'entrepreneur',
            'freelance': 'independent'
        };
        
        const roleStyle = Object.keys(roleStyles).find(k => role.includes(k));
        const style = roleStyle ? roleStyles[roleStyle] : 'professional';
        
        // Determine personality traits for photo characteristics
        const personalityTraits = Object.keys(traits);
        let personalityVibe = 'neutral';
        
        if (personalityTraits.some(t => ['creative', 'artistic', 'innovative'].includes(t.toLowerCase()))) {
            personalityVibe = 'creative';
        } else if (personalityTraits.some(t => ['confident', 'assertive', 'leader'].includes(t.toLowerCase()))) {
            personalityVibe = 'confident';
        } else if (personalityTraits.some(t => ['friendly', 'warm', 'approachable'].includes(t.toLowerCase()))) {
            personalityVibe = 'friendly';
        } else if (personalityTraits.some(t => ['serious', 'focused', 'analytical'].includes(t.toLowerCase()))) {
            personalityVibe = 'serious';
        }
        
        // Generate avatar using multiple strategies with Indian persona focus
        const avatarStrategies = [
            // Strategy 1: Unsplash API for high-quality Indian people photos
            () => {
                const searchQuery = this.generateUnsplashQuery(persona);
                return `https://source.unsplash.com/400x400/?${searchQuery}`;
            },
            
            // Strategy 2: Pexels API for diverse Indian people photos
            () => {
                const searchQuery = this.generatePexelsQuery(persona);
                return `https://images.pexels.com/photos/1/pexels-photo-1.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop&crop=face&q=80`;
            },
            
            // Strategy 3: Pixabay API for Indian people photos
            () => {
                const searchQuery = this.generatePixabayQuery(persona);
                return `https://pixabay.com/api/?key=YOUR_PIXABAY_KEY&q=${searchQuery}&image_type=photo&category=people&min_width=400&min_height=400&safesearch=true`;
            },
            
            // Strategy 4: Freepik-style curated Indian persona photos
            () => {
                return this.getFreepikStylePhoto(persona);
            },
            
            // Strategy 5: UI Avatars with personalized styling (fallback)
            () => {
                const bgColor = this.getPersonaBackgroundColor(persona);
                const textColor = this.getPersonaTextColor(persona);
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=${bgColor}&color=${textColor}&size=200&bold=true&format=png`;
            }
        ];
        
        // Use the first strategy as primary, with fallbacks
        try {
            return avatarStrategies[0]();
        } catch (error) {
            console.error('Avatar generation error:', error);
            // Fallback to basic UI Avatars
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`;
        }
    }
    
    /**
     * Get persona-specific background color
     */
    static getPersonaBackgroundColor(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const traits = persona.traits || {};
        
        // Role-based colors
        if (role.includes('designer') || role.includes('creative')) return 'f97316'; // Orange
        if (role.includes('developer') || role.includes('engineer')) return '3b82f6'; // Blue
        if (role.includes('manager') || role.includes('business')) return '10b981'; // Green
        if (role.includes('government') || role.includes('officer')) return '6b7280'; // Gray
        if (role.includes('freelance') || role.includes('independent')) return '8b5cf6'; // Purple
        
        // Trait-based colors
        const personalityTraits = Object.keys(traits);
        if (personalityTraits.some(t => ['creative', 'artistic'].includes(t.toLowerCase()))) return 'ec4899'; // Pink
        if (personalityTraits.some(t => ['confident', 'leader'].includes(t.toLowerCase()))) return 'dc2626'; // Red
        if (personalityTraits.some(t => ['friendly', 'warm'].includes(t.toLowerCase()))) return '059669'; // Emerald
        if (personalityTraits.some(t => ['serious', 'focused'].includes(t.toLowerCase()))) return '374151'; // Dark Gray
        
        // Default gradient
        return 'random';
    }
    
    /**
     * Get persona-specific text color
     */
    static getPersonaTextColor(persona) {
        const bgColor = this.getPersonaBackgroundColor(persona);
        // Return white for dark backgrounds, dark for light backgrounds
        if (bgColor === 'random') return 'fff';
        return 'fff'; // Default to white
    }
    
    /**
     * Get DiceBear style based on persona
     */
    static getDiceBearStyle(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        
        if (role.includes('designer') || role.includes('creative')) return 'avataaars';
        if (role.includes('developer') || role.includes('engineer')) return 'personas';
        if (role.includes('manager') || role.includes('business')) return 'micah';
        if (role.includes('government') || role.includes('officer')) return 'adventurer';
        
        return gender === 'female' ? 'avataaars' : 'personas';
    }
    
    /**
     * Generate consistent seed for persona
     */
    static generatePersonaSeed(persona) {
        const name = persona.name || 'persona';
        const role = persona.occupation || persona.role_title || '';
        const location = persona.location || '';
        return encodeURIComponent(`${name}-${role}-${location}`.toLowerCase().replace(/\s+/g, '-'));
    }
    
    /**
     * Get Robohash set based on persona
     */
    static getRobohashSet(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        if (role.includes('designer') || role.includes('creative')) return 'set1';
        if (role.includes('developer') || role.includes('engineer')) return 'set2';
        if (role.includes('manager') || role.includes('business')) return 'set3';
        if (role.includes('government') || role.includes('officer')) return 'set4';
        
        return 'set1';
    }
    
    /**
     * Get Robohash background based on persona
     */
    static getRobohashBackground(persona) {
        const traits = persona.traits || {};
        const personalityTraits = Object.keys(traits);
        
        if (personalityTraits.some(t => ['creative', 'artistic'].includes(t.toLowerCase()))) return 'bg1';
        if (personalityTraits.some(t => ['confident', 'leader'].includes(t.toLowerCase()))) return 'bg2';
        if (personalityTraits.some(t => ['friendly', 'warm'].includes(t.toLowerCase()))) return 'bg3';
        
        return 'bg1';
    }
    
    /**
     * Generate Unsplash search query for Indian people photos
     */
    static generateUnsplashQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const location = persona.location?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add age-specific terms
        if (age < 25) query += ', young indian';
        else if (age > 50) query += ', mature indian';
        else query += ', indian adult';
        
        // Add gender-specific terms
        if (gender === 'male' || gender === 'm') query += ', indian man';
        else if (gender === 'female' || gender === 'f') query += ', indian woman';
        
        // Add role-specific terms
        if (role.includes('designer') || role.includes('creative')) query += ', indian creative professional';
        else if (role.includes('developer') || role.includes('engineer')) query += ', indian tech professional';
        else if (role.includes('manager') || role.includes('business')) query += ', indian business professional';
        else if (role.includes('government') || role.includes('officer')) query += ', indian formal professional';
        else if (role.includes('freelance') || role.includes('independent')) query += ', indian freelancer';
        
        // Add location-specific terms
        if (location.includes('delhi') || location.includes('mumbai') || location.includes('bangalore')) {
            query += ', urban indian professional';
        } else if (location.includes('punjab') || location.includes('tamil') || location.includes('gujarat')) {
            query += ', indian regional professional';
        }
        
        return encodeURIComponent(query);
    }
    
    /**
     * Generate Pexels search query for Indian people photos
     */
    static generatePexelsQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add age and gender
        if (age < 30) query += gender === 'female' ? ' young indian woman' : ' young indian man';
        else if (age > 45) query += gender === 'female' ? ' mature indian woman' : ' mature indian man';
        else query += gender === 'female' ? ' indian woman' : ' indian man';
        
        // Add professional context
        if (role.includes('designer')) query += ' creative professional';
        else if (role.includes('developer')) query += ' tech professional';
        else if (role.includes('manager')) query += ' business professional';
        else if (role.includes('government')) query += ' formal professional';
        
        return encodeURIComponent(query);
    }
    
    /**
     * Generate Pixabay search query for Indian people photos
     */
    static generatePixabayQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add demographic details
        if (age < 25) query += ' young';
        else if (age > 50) query += ' mature';
        
        if (gender === 'male' || gender === 'm') query += ' man';
        else if (gender === 'female' || gender === 'f') query += ' woman';
        
        // Add professional context
        if (role.includes('professional')) query += ' professional';
        if (role.includes('business')) query += ' business';
        if (role.includes('tech')) query += ' technology';
        
        return encodeURIComponent(query);
    }
    
    /**
     * Get Freepik-style curated Indian persona photos
     */
    static getFreepikStylePhoto(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        // Curated photo URLs based on persona characteristics
        const photoSets = {
            // Young professionals
            'young-male-professional': [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
            ],
            'young-female-professional': [
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
            ],
            // Mature professionals
            'mature-male-professional': [
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            ],
            'mature-female-professional': [
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
            ]
        };
        
        // Determine photo set based on persona
        let photoSet = 'young-male-professional'; // default
        
        if (age < 30) {
            photoSet = gender === 'female' ? 'young-female-professional' : 'young-male-professional';
        } else {
            photoSet = gender === 'female' ? 'mature-female-professional' : 'mature-male-professional';
        }
        
        // Select random photo from the set
        const photos = photoSets[photoSet] || photoSets['young-male-professional'];
        const randomIndex = Math.floor(Math.random() * photos.length);
        
        return photos[randomIndex];
    }

    /**
     * Build feedback prompt for multi-agent critique
     */
    static buildFeedbackPrompt(artifact, task, persona) {
        return `You are ${persona.name}, a ${persona.role_title || 'professional'} with specific expertise and perspective.

TASK: ${task}

ARTIFACT TO REVIEW:
${artifact}

As ${persona.name}, provide your honest, persona-specific critique focusing on:
1. Issues that matter to someone like you (${persona.demographics?.age || 'unknown'} year old ${persona.demographics?.gender || 'person'})
2. Problems you'd encounter given your ${persona.domain_literacy?.level || 'medium'} level of ${persona.domain_literacy?.dimension || 'general'} knowledge
3. Concerns based on your objectives: ${(persona.objectives || []).join(', ')}
4. Frustrations you'd have: ${(persona.frustrations || []).join(', ')}

Respond in JSON format:
{
  "problems": [
    {
      "issue": "Brief description of the problem",
      "evidence": "Specific part of the artifact that shows this problem",
      "severity": "low|medium|high|critical",
      "fix": "How to address this problem"
    }
  ],
  "overall_assessment": "Your overall opinion as ${persona.name}",
  "persona_perspective": "Why this matters to someone like you"
}`;
    }
}

module.exports = PromptBuilder;
